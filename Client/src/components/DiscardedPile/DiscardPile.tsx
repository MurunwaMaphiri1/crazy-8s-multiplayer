import Card from "../Card/Card";
import type { Card as CardType } from "../../utils/interface"

type DiscardPileProps = {
  // cards: { code: string; value: string }[];
  cards: CardType[];
};

export default function DiscardPile({ cards }: DiscardPileProps) {
  if (!cards || cards.length === 0) {
    return (
      <div className="flex h-[150px] w-[100px] border-2 border-gray-600 rounded-sm items-center justify-center bg-gray-300">
        <span className="text-xs text-gray-700">Empty</span>
      </div>
    );
  }
  
  const topCard = cards[cards.length - 1];

  return (
    <div className="flex flex-col items-center">
      <Card code={topCard.code} value={topCard.value} />
      <p className="text-gray-200 text-xs mt-2">Discard Pile</p>
    </div>
  );
}
