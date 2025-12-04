import { Suit } from "@/utils/interface"

export const SuitSymbols: Record<Suit, string> = {
  DIAMONDS: "♦",
  HEARTS: "♥",
  CLUBS: "♣",
  SPADES: "♠"
};

type SuitChangePros = {
    onClick? : (suit: Suit) => void;
}

export default function SuitChange({ onClick }: SuitChangePros) {

  return (
    <>
      <div className="grid grid-cols-2 grid-rows-2 w-[100px] h-[100px] border-2 relative">

        {/* horizontal line */}
        <div className="absolute top-1/2 left-0 w-full border-t"></div>

        {/* vertical line */}
        <div className="absolute left-1/2 top-0 h-full border-l"></div>

        <div 
            className="flex items-center justify-center text-xl"
            onClick={() => onClick?.("DIAMONDS")}
            style={{ cursor: 'pointer' }}
        >
          {SuitSymbols.DIAMONDS}
        </div>

        <div 
            className="flex items-center justify-center text-xl"
            onClick={() => onClick?.("HEARTS")}
            style={{ cursor: 'pointer' }}
        >
          {SuitSymbols.HEARTS}
        </div>

        <div 
            className="flex items-center justify-center text-xl"
            onClick={() => onClick?.("SPADES")}
            style={{ cursor: 'pointer' }}
        >
          {SuitSymbols.SPADES}
        </div>

        <div 
            className="flex items-center justify-center text-xl"
            onClick={() => onClick?.("CLUBS")}
            style={{ cursor: 'pointer' }}
        >
          {SuitSymbols.CLUBS}
        </div>

      </div>
    </>
  )
}
