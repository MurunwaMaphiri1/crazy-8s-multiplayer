import { useEffect, useState } from "react";
import Scoreboard from "../components/Scoreboard/Leaderboard";
import SuitChange from "../components/SuitChange/SuitChange";
import PlayerHand from "../components/PlayerHand/PlayerHand";
import BotHand from "../components/BotHand/BotHand";
import DrawingDeck from "../components/DrawingDeck/DrawingDeck";
import DiscardPile from "../components/DiscardedPile/DiscardPile";
import WaitingLobby from "../components/WaitingLobby/WaitingLobby";
import type { Player } from "../../utils/interface";
import { io } from "socket.io-client";

let socket: any = null;

export default function Multiplayer() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showLobby, setShowLobby] = useState(true)
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!socket) {
      socket = io("http://localhost:3000");
    }

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

    socket.on("room-updated", (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    })
  }, [])

  useEffect(() => {
    
  }, []);

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
        <WaitingLobby />
        {players.length >= 2 && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-4xl">
            Game starts in {countdown}...
          </div>
        )}
      </div>
    );
  }

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
                      <div>
                          <p>Current suit: {suit}</p>
                      </div>
                      <div>
                          <p>Player Turn: {players[turnIndex]?.name}</p>
                      </div>
                  </div>
                  <div className='flex flex-row gap-4 mt-5 justify-center'>
                      <DrawingDeck onCardClick={draw} deck={deck.cards} />
                      <DiscardPile cards={discardPile} />
                  </div>
                  {showSuitPicker && (
                      <SuitChange onClick={changeSuit}/>
                  )}
                  <PlayerHand onCardClick={playCard} cards={players[0]?.cards || []} />
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
