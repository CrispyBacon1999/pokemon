import { useQuery } from "@tanstack/react-query";
import { ICard } from "../types/tcgapi/card";

async function fetchCards({ setId }: { setId: string }): Promise<ICard[]> {
  const res = await fetch(`/api/cards?setId=${setId}`);
  if (!res.ok) throw new Error("Failed to fetch sets");
  return res.json();
}

export function useCards({ setId }: { setId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["cards", setId],
    queryFn: () => fetchCards({ setId }),
    staleTime: 300_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
    enabled: !!setId,
  });

  return { data, isLoading, error };
}