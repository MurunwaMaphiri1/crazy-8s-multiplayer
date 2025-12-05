import express from "express";
import http from "http";
import { Server } from "socket.io";
import type { Player, Card } from "../Client/utils/interface";
import { Deck } from "../Client/utils/Deck";
import cards from '../Client/utils/deckofcards.json'

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const jsonCards = cards as Card[];

let gameState = {
    players: [] as Player[],
    deck: new Deck(jsonCards),
    discardPile: [],
    turnIndex: 0,
    suit: null,
    leaderBoard: [],
    cardsDealt: false,
    gamesOver: false,
    showSuitPicker: false,
}

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

    socket.on("join-room", (player: Player) => {
        player.socketId = socket.id;

        if (!gameState.players.find(p => p.socketId === player.socketId)) {
            gameState.players.push(player);
        }

        io.emit("room-updated", gameState.players);
        console.log("Updated players:", gameState.players);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected:", socket.id);
        gameState.players = gameState.players.filter(p => p.socketId !== socket.id);
        io.emit("room-updated", gameState.players);
    });

    socket.on("start-game", () => {
        console.log("Game started by:", socket.id);
        io.emit("deal-cards");
    })
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
