import Card from "../Card/Card"
import type { Card as CardType } from "../../../../Shared/utils/interface"
import { motion, animate } from "framer-motion"

type PlayerHandProps = {
    cards: CardType[];
    showBack?: boolean;
    onCardClick: (card: CardType) => void
}

export default function PlayerHand({ cards, onCardClick, showBack }: PlayerHandProps) {

    const cardAnimations = {
        initial: { y: -10, opacity: 0, scale: 0.8 }, // coming from deck
        animate: { y: 0, opacity: 1, scale: 1 },    // in hand
        exit: { y: 50, opacity: 0, scale: 0.8 },    // going to discard pile
    };

    return (
        <>
            <div className="flex justify-center mt-4 items-center">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.code}
                        layout
                        variants={cardAnimations}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="first:ml-0 -ml-12 sm:-ml-12 md:-ml-6"
                        style={{zIndex: i}}
                    >
                        <Card  
                            code={card.code} 
                            value={card.value} 
                            showBack={false} 
                            onClick={() => onCardClick(card)}
                        />
                    </motion.div>
                ))}
            </div>
        </>
    )
}