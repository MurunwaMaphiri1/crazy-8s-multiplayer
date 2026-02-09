import { useEffect, useState } from "react";
import { useGameStore } from "../../zustand/store";
import Scoreboard from "../components/Scoreboard/Leaderboard";
import SuitChange from "../components/SuitChange/SuitChange";
import PlayerHand from "../components/PlayerHand/PlayerHand";
import BotHand from "../components/BotHand/BotHand";
import DrawingDeck from "../components/DrawingDeck/DrawingDeck";
import DiscardPile from "../components/DiscardedPile/DiscardPile";

export default function Game() {
  const [gameReady, setGameReady] = useState(false);
  const { players, 
          initPlayers,
          repopulateDeck,
          changeSuit,
          dealCards,
          draw,
          playCard,
          compPlay,
          deck,
          discardPile,
          turnIndex,
          suit,
          leaderBoard,
          cardsDealt,
          gamesOver,
          showSuitPicker
        } = useGameStore();

        
  useEffect(() => {
    initPlayers();
  }, [initPlayers]);

  useEffect(() => {
    if (!cardsDealt) {
        setGameReady(false);
        return;
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            setGameReady(true);
        })
    })
  }, [cardsDealt]);

  useEffect(() => {
    if (gamesOver) return;
    if (cardsDealt && players.length > 0 && players[turnIndex]?.isBot === true) {
        const botTimeout = setTimeout(() => {
            compPlay()
        }, 1000)
        return () => clearTimeout(botTimeout);
    }
  }, [turnIndex, cardsDealt, players]);

  useEffect(() => {
        if (deck.cards.length === 0 && discardPile.length > 1) {
            repopulateDeck();
        }
  }, [deck.cards.length, discardPile.length]);

        
    return (
        <>
            {gamesOver ? (
                <div className='flex min-h-screen items-center justify-center bg-[#0f1f3d]'>
                    <Scoreboard leaderboard={leaderBoard} playerId={leaderBoard[0].id} />
                </div>
            ) : cardsDealt ? (
                    <div className='flex flex-col items-center min-h-screen justify-center bg-[#0f1f3d]'>
                        <div className="top-40">
                            <BotHand cards={players[1]?.cards || []} />
                        </div>
                        <div className='flex flex-col mt-3'>
                            <div className='text-white'>
                                <p>
                                    Current suit: {suit}
                                </p>
                            </div>
                            <div className='text-white'>
                                <p>
                                    Player Turn: {players[turnIndex]?.name}
                                </p>
                            </div>
                        </div>
                        <div className='flex flex-row gap-4 mt-5 justify-center'>
                            <DrawingDeck onCardClick={draw} deck={deck.cards} />
                            <DiscardPile cards={discardPile} />
                        </div>
                        {showSuitPicker && (
                            <div>
                                <SuitChange onClick={changeSuit}/>
                            </div>
                        )}
                        <div>
                            <PlayerHand onCardClick={playCard} cards={players[0]?.cards || []} />
                        </div>
                    </div>
            ) : (
                    <div className='flex justify-center items-center min-h-screen bg-[#0f1f3d] text-white'>
                        <button
                            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-xl'
                            onClick={dealCards}
                            disabled={players.length === 0 && !cardsDealt}
                            style={{ cursor: 'pointer' }}
                        >
                            Deal Cards
                        </button>
                    </div>
            )}
        </>
            );
    }