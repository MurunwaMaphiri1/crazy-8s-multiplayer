import cards from "../../../../Shared/utils/deckofcards.json"
import type { Card } from "../../../../Shared/utils/interface"

type CardProps = {
  code: string
  value: string
  showBack?: boolean
  onClick? : () => void
}

export default function Card({ code, showBack = false, onClick }: CardProps) {
  // Find the card data based on the code
  const cardData = cards.find(card => card.code === code)

  if (!cardData) {
    return (
      <div className="flex h-[60px] max-w-60 w-full border-2 border-r-4 border-gray-800 rounded-lg items-center justify-center bg-gray-200">
        <span className="text-xs text-gray-600">Card not found</span>
      </div>
    )
  }

  const imageSrc = showBack ? cardData.backImage : cardData.image

  return (
    <div
        onClick={onClick} 
        className="relative flex h-[150px] max-w-[100px] w-full rounded-sm overflow-hidden shadow-lg bg-white"
        style={{ cursor: 'pointer' }}
    >
      <img
        className="w-full h-full object-fit"
        src={imageSrc}
        alt={showBack ? "Card back" : `${cardData.value} of ${cardData.suit}`}
        width={100}
        height={150}
      />
    </div>
  )
}
