import { ICard } from "../../types/tcgapi/card";
import type { ISet } from "../../types/tcgapi/set";
import client from "../cache/redis";
import { ICacheResult } from "../cache/result";
import { ApiResponseWithEtag, pokemonApiFetch } from "../util/pokemon-api-fetch";

export class CardQueryBuilder {
  private queries: Record<string, string>;
  private etag: string;

  constructor() {
    this.queries = {};
    this.etag = "";
  }

  withName(name: string) {
    this.queries.name = name;
    return this;
  }

  withSetId(setId: string) {
    this.queries["set.id"] = setId;
    return this;
  }

  withEtag(etag: string | null) {
    this.etag = etag ?? "";
    return this;
  }

  makeQueryString(): string {
    console.log(this.queries);
    const queryString = Object.entries(this.queries).map(([key, value]) => {
      return `${key}:${value}`;
    }).join("+");

    console.log(queryString);

    return queryString;
  }

  makeSortString(): string {
    return "-releaseDate";
  }

  async execute(): Promise<ApiResponseWithEtag<ICard[]>> {
    const queryString = this.makeQueryString();
    const sortString = this.makeSortString();
    const response = await pokemonApiFetch<ICard[]>(`/cards?q=${queryString}&orderBy=${sortString}`, this.etag);
    return response;
  }
}

export const cardQuery = () => {
  return new CardQueryBuilder();
}

const cardsCacheKey = "catalog:cards";

const TTL_STALE_SECONDS = 60 * 60 * 24 * 7;
const STALE_RETENTION_SECONDS = 60 * 60 * 24 * 365;


async function cacheSets(setId: string, cards: ICard[], etag: string) {
  const payload = JSON.stringify({ cards, lastUpdated: Date.now() });
  await client.multi()
    .set(`${cardsCacheKey}:${setId}:fresh`, payload, { EX: TTL_STALE_SECONDS })
    .set(`${cardsCacheKey}:${setId}:stale`, payload, { EX: STALE_RETENTION_SECONDS })
    .set(`${cardsCacheKey}:${setId}:etag`, etag, { EX: STALE_RETENTION_SECONDS })
    .exec();
}

export const getAllCardsAndCacheResults = async (setId: string, etag: string): Promise<ICacheResult<ICard[]>> => {
  let raw = await client.get(`${cardsCacheKey}:${setId}:fresh`);
  let cachedEtag = await client.get(`${cardsCacheKey}:${setId}:etag`);
  let stale = false;

  const matchedEtag = etag !== "" && etag === cachedEtag;

  if (!raw) {
    raw = await client.get(`${cardsCacheKey}:${setId}:stale`);
    stale = true;
  }

  if (raw) {
    if (stale) {
      void (async () => {
        try {
          const cards = await cardQuery().withSetId(setId).withEtag(cachedEtag).execute();
          await cacheSets(setId, cards.data, cards.etag);

          // Clear the cached list of sets with data
          await client.del(`${setsWithDataCacheKey}`);
        } catch { }
      })();
    }
    const env = JSON.parse(raw) as { cards: ICard[], lastUpdated: number };
    // TODO: Handle etag
    return {
      data: env.cards,
      etag: cachedEtag ?? "",
      matchesCache: matchedEtag,
      recommendedRefetchInMs: stale ? 60_000 : 0,
      lastUpdated: new Date(env.lastUpdated),
      stale
    }
  }

  // No cached results, full refresh
  const cards = await cardQuery().withSetId(setId).execute();
  await cacheSets(setId, cards.data, cards.etag);
  // Clear the cached list of sets with data
  await client.del(`${setsWithDataCacheKey}`);
  return {
    data: cards.data,
    etag: cards.etag,
    matchesCache: false,
    recommendedRefetchInMs: 0,
    lastUpdated: new Date(),
    stale: false
  }
}

const setsWithDataCacheKey = "catalog:setsWithData";
const setsWithDataTTL = 60 * 60 * 24 * 1; // 24 hours

export const checkWhichSetsHaveData = async (sets: ISet[]): Promise<{ setId: string, hasData: boolean }[]> => {
  const cachedSetsWithData = await client.get(setsWithDataCacheKey);
  if (cachedSetsWithData) {
    return JSON.parse(cachedSetsWithData) as { setId: string, hasData: boolean }[];
  }

  const setsWithData = await Promise.all(sets.map(async (set) => {
    const setHasData = await client.exists(`${cardsCacheKey}:${set.id}:fresh`);
    return { setId: set.id, hasData: setHasData === 1 };
  }));

  await client.set(setsWithDataCacheKey, JSON.stringify(setsWithData), { EX: setsWithDataTTL });

  return setsWithData;
}