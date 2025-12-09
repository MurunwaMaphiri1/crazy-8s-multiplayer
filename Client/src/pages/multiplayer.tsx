import { useEffect, useState } from "react";
import Scoreboard from "../components/Scoreboard/Leaderboard";
import SuitChange from "../components/SuitChange/SuitChange";
import PlayerHand from "../components/PlayerHand/PlayerHand";
import DrawingDeck from "../components/DrawingDeck/DrawingDeck";
import DiscardPile from "../components/DiscardedPile/DiscardPile";
import WaitingLobby from "../components/WaitingLobby/WaitingLobby";
import type { Player, Card, Suit } from "../../../Shared/utils/interface";
import { Deck } from "../../../Shared/utils/Deck";
import { io } from "socket.io-client";
import cards from "../../../Shared/utils/deckofcards.json";

let socket: any = null;
const jsonCards = cards as Card[];

export default function Multiplayer() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [deck] = useState(() => new Deck(jsonCards));
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [suit, setSuit] = useState("");
  const [leaderBoard, setLeaderBoard] = useState<Player[]>([]);
  const [cardsDealt, setCardsDealt] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showSuitPicker, setShowSuitPicker] = useState(false);
  const [showLobby, setShowLobby] = useState(true)
  const [, setCountdown] = useState(3);

  const player: Player = {
      id: crypto.randomUUID(),
      socketId: "",
      name: localStorage.getItem("playerName") || "Joker",
      avatar: localStorage.getItem("playerAvatar") || "/Images/Persona-5-icons/Joker.jpg",
      cards: [],
      isBot: false,
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!socket) {
      socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000");
    }

    socket.on("connect", () => {
      socket.emit("join-room", player);
    })

    socket.on("disconnect", () => {
      player.socketId = "";
      socket.emit("disconnect", player);
    })

    socket.on("room-updated", (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    })

    socket.on("state-updated", (state : any) => {
      setPlayers(state.players);
      setDiscardPile(state.discardPile);
      setTurnIndex(state.turnIndex);
      setSuit(state.suit);
      setCardsDealt(state.cardsDealt);
      setShowSuitPicker(state.showSuitPicker);
      setGameOver(state.gamesOver);
      setLeaderBoard(state.leaderBoard);
    })

    return () => {
      socket.off("connect");
      socket.off("room-updated");
      socket.off("cards-dealt");
    }
  }, [])

  useEffect(() => {
    socket.on("turn-advanced", (newTurnIndex: number) => {
      setTurnIndex(newTurnIndex);
    })

    return () => socket.off("turn-advanced")
  }, [])

  useEffect(() => {
    if (deck.cards.length === 0 && discardPile.length > 1) {
      socket.emit("repopulate-deck");
    }
  }, [deck.cards.length, discardPile.length]);

  useEffect(() => {
    if (players.length >= 2 && showLobby) {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowLobby(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [players, showLobby]);

  if (showLobby) {
    return (
      <div className="relative">
        <WaitingLobby lobbyPlayers={players} />
      </div>
    );
  }

  const handleDealCards = () => {
    socket.emit("dealCards");
  }

  const handleDrawCard = () => {
    socket.emit("draw-card");
  }

  const handlePlayCard = (card: Card) => {
    socket.emit("playCard", card);
  }

  const handleSuitChange = (newSuit: Suit) => {
    socket.emit("change-suit", newSuit);
  }

  const myPlayer = players.find(p => p.socketId === socket.id);

  const opponent = players.find(p => p.socketId !== socket.id);

  return (
    <>
      {gameOver ? (
          <div className='flex min-h-screen items-center justify-center bg-[#0f1f3d]'>
              <Scoreboard leaderboard={leaderBoard} playerId={leaderBoard[0].id} />
          </div>
      ) : cardsDealt ? (
              <div className='flex flex-col items-center min-h-screen justify-center bg-[#0f1f3d]'>
                  <div className="top-40">
                      <PlayerHand showback={true} onCardClick={handlePlayCard} cards={opponent?.cards || []} />
                  </div>
                  <div className='flex flex-col mt-3'>
                      <div>
                          <p>Current suit: {suit}</p>
                      </div>
                      <div>
                          <p>Player Turn: {players[turnIndex]?.name}</p>
                      </div>
                  </div>
                  <div className='flex flex-row gap-4 mt-5 justify-center'>
                      <DrawingDeck onCardClick={handleDrawCard} deck={deck.cards} />
                      <DiscardPile cards={discardPile} />
                  </div>
                  {showSuitPicker && (
                      <SuitChange onClick={handleSuitChange}/>
                  )}
                  <PlayerHand onCardClick={handlePlayCard} cards={myPlayer?.cards || []} />
              </div>
      ) : (
              <div className='flex justify-center items-center min-h-screen bg-[#0f1f3d] text-white'>
                  <button
                      className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-xl'
                      onClick={handleDealCards}
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
