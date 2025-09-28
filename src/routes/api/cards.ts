import { json } from "@tanstack/react-start";

import { createFileRoute } from "@tanstack/react-router";
import { setResponseHeader, setResponseHeaders, setResponseStatus } from "@tanstack/react-start/server";
import { getAllCardsAndCacheResults } from "../../server/data/cards";
import * as v from "valibot";

export const Route = createFileRoute("/api/cards")({
  validateSearch: v.object({
    setId: v.string(),
  }),
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const setId = url.searchParams.get("setId")!;
        const etag = request.headers.get("If-None-Match");

        console.log(setId);

        const cards = await getAllCardsAndCacheResults(setId, etag ?? "");

        return json(
          cards.data,
        );
      }
    }
  }
})