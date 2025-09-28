import type { ILegality } from "../../types/tcgapi/legality";
import type { ISet } from "../../types/tcgapi/set";
import client from "../cache/redis";
import { ICacheResult } from "../cache/result";
import { ApiResponseWithEtag, pokemonApiFetch } from "../util/pokemon-api-fetch";

export class SetQueryBuilder {
  private queries: Record<string, string>;
  private etag: string;

  constructor() {
    this.queries = {};
    this.etag = "";
  }

  withLegality(legality: keyof ILegality, value: boolean) {
    this.queries[`legality.${legality}`] = value ? "legal" : "banned";
    return this;
  }

  withName(name: string) {
    this.queries.name = name;
    return this;
  }

  withEtag(etag: string | null) {
    this.etag = etag ?? "";
    return this;
  }

  makeQueryString(): string {
    const queryString = Object.entries(this.queries).map(([key, value]) => {
      return `${key}:${value}`;
    }).join("+");

    return queryString;
  }

  makeSortString(): string {
    return "-releaseDate";
  }

  async execute(): Promise<ApiResponseWithEtag<ISet[]>> {
    const queryString = "q=" + this.makeQueryString();
    const sortString = "orderBy=" + this.makeSortString();

    const params = [queryString, sortString].join("&");

    const response = await pokemonApiFetch<ISet[]>(`/sets?${params}`, this.etag);
    return response;
  }
}

export const setQuery = () => {
  return new SetQueryBuilder();
}

const setsFreshCacheKey = "catalog:sets:fresh";
const setsStaleCacheKey = "catalog:sets:stale";
const setsEtagKey = "catalog:sets:etag";

const TTL_STALE_SECONDS = 60 * 60 * 24 * 7;
const STALE_RETENTION_SECONDS = 60 * 60 * 24 * 365;


async function cacheSets(sets: ISet[], etag: string) {
  const payload = JSON.stringify({ sets, lastUpdated: Date.now() });
  await client.multi()
    .set(setsFreshCacheKey, payload, { EX: TTL_STALE_SECONDS })
    .set(setsStaleCacheKey, payload, { EX: STALE_RETENTION_SECONDS })
    .set(setsEtagKey, etag, { EX: STALE_RETENTION_SECONDS })
    .exec();
}

export const getAllSetsAndCacheResults = async (etag: string): Promise<ICacheResult<ISet[]>> => {
  let raw = await client.get(setsFreshCacheKey);
  let cachedEtag = await client.get(setsEtagKey);
  let stale = false;

  const matchedEtag = etag !== "" && etag === cachedEtag;

  if (!raw) {
    raw = await client.get(setsStaleCacheKey);
    stale = true;
  }

  if (raw) {
    if (stale) {
      void (async () => {
        try {
          const sets = await setQuery().withEtag(cachedEtag).execute();
          await cacheSets(sets.data, sets.etag);
        } catch { }
      })();
    }
    const env = JSON.parse(raw) as { sets: ISet[], lastUpdated: number };
    // TODO: Handle etag
    return {
      data: env.sets,
      etag: cachedEtag ?? "",
      matchesCache: matchedEtag,
      recommendedRefetchInMs: stale ? 60_000 : 0,
      lastUpdated: new Date(env.lastUpdated),
      stale
    }
  }

  // No cached results, full refresh
  const sets = await setQuery().execute();
  await cacheSets(sets.data, sets.etag);
  return {
    data: sets.data,
    etag: sets.etag,
    matchesCache: false,
    recommendedRefetchInMs: 0,
    lastUpdated: new Date(),
    stale: false
  }
}