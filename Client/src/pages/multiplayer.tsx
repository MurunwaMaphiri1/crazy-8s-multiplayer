import { useEffect, useState } from "react";
import Scoreboard from "../components/Scoreboard/Leaderboard";
import SuitChange from "../components/SuitChange/SuitChange";
import PlayerHand from "../components/PlayerHand/PlayerHand";
import BotHand from "../components/BotHand/BotHand";
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
  const [deck, setDeck] = useState(() => new Deck(jsonCards));
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [suit, setSuit] = useState("");
  const [leaderBoard, setLeaderBoard] = useState<Player[]>([]);
  const [cardsDealt, setCardsDealt] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showSuitPicker, setShowSuitPicker] = useState(false);
  const [showLobby, setShowLobby] = useState(true)
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!socket) {
      socket = io("http://localhost:3000");
    }

    // socket.emit("reset-game");

    const player1: Player = {
      id: crypto.randomUUID(),
      socketId: "",
      name: localStorage.getItem("playerName") || "Joker",
      avatar: localStorage.getItem("playerAvatar") || "/Images/Persona-5-icons/Joker.jpg",
      cards: [],
      isBot: false,
    }

    socket.on("connect", () => {
      player1.socketId = socket.id;
      socket.emit("join-room", player1);
    })

    socket.on("disconnect", () => {
      player1.socketId = "";
      socket.emit("disconnect", player1);
    })

    socket.on("room-updated", (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    })

    socket.on("cards-dealt", (state : any) => {
      setPlayers(state.players);
      setDiscardPile(state.discardPile);
      setTurnIndex(state.turnIndex);
      setSuit(state.suit);
      setCardsDealt(state.cardsDealt);
    })

    return () => {
      socket.off("connect");
      socket.off("room-updated");
      socket.off("cards-dealt");
    }
  }, [])

  useEffect(() => {
    socket.on("state-updated", (state: any) => {
      setPlayers(state.players);
      setDiscardPile(state.discardPile);
      setTurnIndex(state.turnIndex);
      setSuit(state.suit);
    })
  })

  useEffect(() => {
    socket.on("turnIndex-updated", () => {
      setTurnIndex(turnIndex);
    })
  })

  useEffect(() => {
    if (gameOver) return;
    if (cardsDealt && players.length > 0 && players[turnIndex]?.isBot === true) {
      const botTimeout = setTimeout(() => {
        socket.emit("comp-play");
      }, 1000)
      return () => clearTimeout(botTimeout);
    }
  }, [turnIndex, cardsDealt, players]);

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
        {/* <WaitingLobby /> */}
        {players.length == 2 && (
          <div className="absolute inset-0 flex items-center justify-center text-black text-4xl">
            Game starts in {countdown}...
          </div>
        )}
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

  return (
    <>
      {gameOver ? (
          <div className='flex min-h-screen items-center justify-center bg-[#0f1f3d]'>
              <Scoreboard leaderboard={leaderBoard} playerId={leaderBoard[0].id} />
          </div>
      ) : cardsDealt ? (
              <div className='flex flex-col items-center min-h-screen justify-center bg-[#0f1f3d]'>
                  <div className="top-40">
                      <BotHand cards={players[1]?.cards || []} />
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
                  <PlayerHand onCardClick={handlePlayCard} cards={players[0]?.cards || []} />
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
