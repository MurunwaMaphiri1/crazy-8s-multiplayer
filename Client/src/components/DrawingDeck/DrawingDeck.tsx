import Card from "../Card/Card"
import type { Card as CardType } from "../../utils/interface"

type DrawingDeckProps = {
    deck: CardType[];
    onCardClick: (card: CardType) => void
}

export default function DrawingDeck({ deck, onCardClick }: DrawingDeckProps) {

    if (!deck || deck.length === 0) {

        return (
            <div className="flex items-center justify-center h-[150px] w-[100px] border-2 border-gray-800 rounded-lg bg-gray-300">
                <span className="text-xs text-gray-700">Empty Deck</span>
            </div>
        )
    }

    return (
        <>
            <div className="relative flex items-center justify-center h-[150px] w-[100px]">
                {deck.map((card, index) => (
                    <div
                        key={`${card.code}`}
                        className="absolute"
                    >
                        <Card code={card.code} value={card.value} showBack={true} onClick={() => onCardClick(card)} />
                    </div>
                ))}
            </div>
        </>
    )
}