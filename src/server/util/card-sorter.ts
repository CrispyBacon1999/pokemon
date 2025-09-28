import { ICard } from "../../types/tcgapi/card";

export const cardSorter = (a: ICard, b: ICard) => {
  // Sort by prices by default
  const aMaxPrice = Math.max(a.tcgplayer?.prices?.holofoil?.market ?? 0, a.tcgplayer?.prices?.reverseHolofoil?.market ?? 0, a.tcgplayer?.prices?.normal?.market ?? 0, a.tcgplayer?.prices?.["1stEditionHolofoil"]?.market ?? 0, a.tcgplayer?.prices?.["1stEditionNormal"]?.market ?? 0);
  const bMaxPrice = Math.max(b.tcgplayer?.prices?.holofoil?.market ?? 0, b.tcgplayer?.prices?.reverseHolofoil?.market ?? 0, b.tcgplayer?.prices?.normal?.market ?? 0, b.tcgplayer?.prices?.["1stEditionHolofoil"]?.market ?? 0, b.tcgplayer?.prices?.["1stEditionNormal"]?.market ?? 0);
  if (aMaxPrice !== bMaxPrice) {
    return bMaxPrice - aMaxPrice;
  }
  // Sort by number
  return parseInt(b.number) - parseInt(a.number);
}