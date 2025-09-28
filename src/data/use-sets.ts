import { useQuery } from "@tanstack/react-query";
import { ISet } from "../types/tcgapi/set";

async function fetchSets(): Promise<(ISet & { hasData: boolean })[]> {
  const res = await fetch("/api/sets");
  if (!res.ok) throw new Error("Failed to fetch sets");
  return res.json();
}

export function useSets() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sets"],
    queryFn: fetchSets,
    staleTime: 0,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  return { data, isLoading, error };
}