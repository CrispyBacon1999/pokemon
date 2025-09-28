const BASE_URL = "https://api.pokemontcg.io/v2"
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY;

const headers = {
  "x-api-key": POKEMON_TCG_API_KEY!,
}

export interface ApiResponseWithEtag<T> {
  data: T;
  etag: string;
}

export const pokemonApiFetch = async <T>(url: string, etag: string | null = null): Promise<ApiResponseWithEtag<T>> => {

  const response = await fetch(`${BASE_URL}${url}`, {
    method: "GET", headers: {
      ...headers,
      "If-None-Match": etag ?? "",
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return { data: (await response.json()).data as T, etag: response.headers.get("ETag") ?? "" };
}