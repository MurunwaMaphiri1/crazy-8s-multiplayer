import Card from "../Card/Card"
import type { Card as CardType } from "../../../../Shared/utils/interface"
import { motion } from "framer-motion"

type BotHandProps = {
    cards: CardType[];
}

export default function BotHand({ cards }: BotHandProps) {

    const cardAnimations = {
        initial: { y: -10, opacity: 0, scale: 0.8 }, // coming from deck
        animate: { y: 0, opacity: 1, scale: 1 },    // in hand
        exit: { y: 50, opacity: 0, scale: 0.8 },    // going to discard pile
    }

    return (
        <>
            <div className="flex justify-center mt-4 items-center relative">
                {cards.map((card, i) => (
                    <motion.div 
                        key={card.code}
                        layout
                        variants={cardAnimations}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.05 }}
                        className="first:ml-0 -ml-[3.75em] sm:-ml-[2em] md:-ml-[1.2em]"
                        style={{zIndex: i}}
                    >
                        <Card 
                            code={card.code} 
                            value={card.value} 
                            showBack={true}
                        />
                    </motion.div>
                ))}
            </div>
        </>
    )
}