import { createFileRoute } from "@tanstack/react-router";
import { Test } from "~/start";
import { SetSelector } from "../components/SetSelector";
import { AnimatedThemeToggler } from "../components/ui/animated-theme-toggler";
import { useCards } from "../data/use-cards";
import { useMemo, useState } from "react";
import { Card } from "../components/Card";
import { ICard } from "../types/tcgapi/card";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useSets } from "../data/use-sets";
import { cardSorter } from "../server/util/card-sorter";

export const Route = createFileRoute("/")({
  component: Home,
  ssr: false,
});

function Home() {
  const [setId, setSetId] = useLocalStorage("setId", "");
  const cards = useCards({ setId });
  const [search, setSearch] = useState("");
  const sets = useSets();

  const set = sets.data?.find((set) => set.id === setId);

  const sortedCards = useMemo(() => {
    return cards.data?.sort(cardSorter);
  }, [cards.data]);

  return (
    <div className="p-2 flex flex-col gap-4">
      <nav className="flex items-center gap-2">
        <AnimatedThemeToggler />
        <SetSelector value={setId} onSetIdChange={setSetId} />
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8 flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </nav>
      <main className="px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 justify-around justify-items-center">
        {sortedCards
          ?.filter((card) =>
            card.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((card) => (
            <Card key={card.id} card={card} set={set} />
          ))}
      </main>
    </div>
  );
}
