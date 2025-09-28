import { currencyFormat } from "../server/util/currency-format";
import { ICard } from "../types/tcgapi/card";
import { ISet } from "../types/tcgapi/set";

export const Card = ({ card, set }: { card: ICard; set?: ISet }) => {
  return (
    <div className="flex flex-col gap-2">
      <a
        href={`${card.tcgplayer?.url ?? card.cardmarket?.url ?? "#"}`}
        target="_blank"
      >
        <img
          src={card.images.small}
          alt={card.name}
          className="w-full h-full object-contain aspect-[245/342] drop-shadow-lg hover:scale-105 transition-transform duration-300"
        />
      </a>
      <div className="text-center">
        <p>
          {card.number}
          {set ? `/${set.printedTotal}` : ""}
        </p>
      </div>
      <PriceInfo card={card} />
    </div>
  );
};

const PriceInfo = ({ card }: { card: ICard }) => {
  return (
    <div className="text-center">
      {card.tcgplayer?.prices?.["1stEditionHolofoil"] && (
        <p>
          1st Edition Holofoil:{" "}
          {currencyFormat(
            card.tcgplayer?.prices?.["1stEditionHolofoil"]?.market
          )}
        </p>
      )}
      {card.tcgplayer?.prices?.["1stEditionNormal"] && (
        <p>
          1st Edition Normal:{" "}
          {currencyFormat(card.tcgplayer?.prices?.["1stEditionNormal"]?.market)}
        </p>
      )}
      {card.tcgplayer?.prices?.holofoil && (
        <p>
          Holofoil: {currencyFormat(card.tcgplayer?.prices?.holofoil?.market)}
        </p>
      )}
      {card.tcgplayer?.prices?.reverseHolofoil && (
        <p>
          Reverse Holofoil:{" "}
          {currencyFormat(card.tcgplayer?.prices?.reverseHolofoil?.market)}
        </p>
      )}
      {card.tcgplayer?.prices?.normal && (
        <p>Normal: {currencyFormat(card.tcgplayer?.prices?.normal?.market)}</p>
      )}
    </div>
  );
};
