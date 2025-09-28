import { json } from "@tanstack/react-start";
import { getAllSetsAndCacheResults } from "../../server/data/sets";

import { createFileRoute } from "@tanstack/react-router";
import { setResponseHeader, setResponseHeaders, setResponseStatus } from "@tanstack/react-start/server";
import { checkWhichSetsHaveData } from "../../server/data/cards";

export const Route = createFileRoute("/api/sets")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const etag = request.headers.get("If-None-Match");

        const sets = await getAllSetsAndCacheResults(etag ?? "");

        const setsWithData = await checkWhichSetsHaveData(sets.data);

        const setsWithCardData = sets.data.map((set) => {
          return {
            ...set,
            hasData: setsWithData.find((s) => s.setId === set.id)?.hasData ?? false,
          }
        })

        return json(
          setsWithCardData
        );
      }
    }
  }
})