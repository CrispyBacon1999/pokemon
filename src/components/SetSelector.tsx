import { useState } from "react";
import { useSets } from "../data/use-sets";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Check, ChevronsUpDown, CircleSmall } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "../lib/utils";

export const SetSelector = ({
  value,
  onSetIdChange,
}: {
  value: string;
  onSetIdChange: (setId: string) => void;
}) => {
  const sets = useSets();

  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? sets.data?.find((set) => set.id === value)?.name
            : "Select set..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search sets..." className="h-9" />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {sets.data?.map((set) => (
                <CommandItem
                  key={set.id}
                  value={set.id}
                  onSelect={(currentValue) => {
                    onSetIdChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className={cn(!set.hasData && "opacity-50")}
                >
                  {set.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === set.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
