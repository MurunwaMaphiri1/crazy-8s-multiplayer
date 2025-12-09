import express from "express";
import http from "http";
import { Server } from "socket.io";
import type { Player, Card, Suit } from "../Shared/utils/interface";
import { Deck } from "../Shared/utils/Deck";
import cards from '../Shared/utils/deckofcards.json'

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const jsonCards = cards as Card[];

let gameState = {
    players: [] as Player[],
    deck: new Deck(jsonCards),
    discardPile: [] as Card[],
    turnIndex: 0,
    suit: "" as Suit,
    leaderBoard: [] as Player[],
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
        io.emit("cards-dealt", {
          players: gameState.players,
          discardPile: gameState.discardPile,
          turnIndex: gameState.turnIndex,
          suit: gameState.suit,
          cardsDealt: gameState.cardsDealt,
        });
    });


    //Disconnect
    socket.on("disconnect", () => {
        console.log("user disconnected:", socket.id);
        gameState.players = gameState.players.filter(p => p.socketId !== socket.id);
        io.emit("room-updated", gameState.players);
        resetGameState();
    });


    //Deal cards
    socket.on("dealCards", () => {
      console.log("Dealing cards...");
      gameState.deck.shuffle();
      gameState.players = gameState.players.map(player => ({
        ...player,
        cards: gameState.deck.takeCards(8)
      }));

      gameState.discardPile.push(gameState.deck.takeCard()!);
      gameState.cardsDealt = true;
      gameState.turnIndex = 0;
      gameState.suit = gameState.discardPile[gameState.discardPile.length - 1].suit;
      updatedGameState();
    })


    //Advance turn helper function
    function advanceTurn() {
      gameState.turnIndex = (gameState.turnIndex + 1) % gameState.players.length;
      io.emit("turn-advanced", gameState.turnIndex);
    }


    //Change suit
    socket.on("change-suit", (newSuit: Suit) => {
      gameState.suit = newSuit;
      gameState.showSuitPicker = false;
      updatedGameState();
      advanceTurn();
    })

    //Update game state helper function
    function updatedGameState() {
      io.emit("state-updated", {
        players: gameState.players,
        discardPile: gameState.discardPile,
        turnIndex: gameState.turnIndex,
        suit: gameState.suit,
        cardsDealt: gameState.cardsDealt,
        showSuitPicker: gameState.showSuitPicker,
        gamesOver: gameState.gamesOver,
        deck: gameState.deck,
        leaderBoard: gameState.leaderBoard,
      })
    }

    //Reset game state helper function
    function resetGameState() {
      gameState = {
        players: [] as Player[],
        deck: new Deck(jsonCards),
        discardPile: [] as Card[],
        turnIndex: 0,
        suit: "" as Suit,
        leaderBoard: [] as Player[],
        cardsDealt: false,
        gamesOver: false,
        showSuitPicker: false,
      }
      io.emit("state-updated", gameState);
    }


    //Repopulate deck
    socket.on("repopulate-deck", () => {
      const cardsToShuffle = gameState.discardPile.slice(0, -1);
      const topCard = gameState.discardPile[gameState.discardPile.length - 1];
      gameState.deck.reset(cardsToShuffle);
      gameState.deck.shuffle();
      gameState.discardPile = [topCard];
      io.emit("deck-repopulated");
      updatedGameState();
    });


    //Handle card effects
    function handleCardEffect(selectedCard: Card) {
      switch (selectedCard.value) {
        case "2":
          draw2();
          break;
        case "JACK":
          jumpPlayer();
          break;
        case "8":
          gameState.showSuitPicker = true;
          updatedGameState();
          return;
      }
      updatedGameState();
    }
    


    //Draw card
    socket.on("draw-card", () => {
      const drawnCard = gameState.deck.takeCard();
      const currentPlayer = gameState.players[gameState.turnIndex];

      if (currentPlayer.socketId !== socket.id) return;

      if (!drawnCard) return;

      const updatedPlayers = gameState.players.map((player, index) => 
          index === gameState.turnIndex
              ? { ...player, cards: [...player.cards, drawnCard] }
              : player
      )

      gameState.players = updatedPlayers;
      advanceTurn();
      updatedGameState();
    });


    //Draw 2 cards 
    function draw2() {
      const drawnCards: Card[] = gameState.deck.takeCards(2);
      const nextPlayerIndex = (gameState.turnIndex + 1) % gameState.players.length;

      const updatedPlayers = gameState.players.map((player, index) =>
          index === nextPlayerIndex
              ? { ...player, cards: [...player.cards, ...drawnCards] }
              : player
      );

      gameState.players = updatedPlayers;
      gameState.turnIndex = (gameState.turnIndex + 2) % gameState.players.length;
      updatedGameState();
    }


    //Jump player
    function jumpPlayer() {
      gameState.turnIndex = (gameState.turnIndex + 2) % gameState.players.length;
    }


    //Play card
    socket.on("playCard", (selectedCard: Card) => {
      const topCard = gameState.discardPile[gameState.discardPile.length - 1]; 
      const currentPlayer = gameState.players[gameState.turnIndex];

      if (currentPlayer.socketId === socket.id) {
        if (
          selectedCard.suit === gameState.suit ||
          selectedCard.value === topCard.value ||
          selectedCard.value === "8"
        ) {
          let cardRemoved = false;
          const currentPlayer = gameState.players[gameState.turnIndex];
          const newHand = currentPlayer.cards.filter((card) => {
            if (!cardRemoved && selectedCard.suit === card.suit && selectedCard.value === card.value) {
                cardRemoved = true;
                return false;
            }
            return true;
          })

          if (newHand.length === 0) {
            const updatedLeaderBoard : Player[] = [...gameState.leaderBoard, currentPlayer];
            gameState.leaderBoard = updatedLeaderBoard;

            const playersRemaining = gameState.players.filter(player => player.id !== currentPlayer.id);
            gameState.players = playersRemaining;

            if (playersRemaining.length === 1) {
              gameState.leaderBoard = [...gameState.leaderBoard, playersRemaining[0]];
              gameState.gamesOver = true;
              updatedGameState();
              return;
            }

            updatedGameState();
            return;
        } else {
          const updatedPlayers = gameState.players.map((player, index) =>
            index === gameState.turnIndex
              ? { ...player, cards: newHand }
              : player
          );
          gameState.players = updatedPlayers;
          gameState.discardPile.push(selectedCard);

          if (selectedCard.value === topCard.value) {
            gameState.suit = selectedCard.suit;
          }

          if (selectedCard.value === "JACK" || selectedCard.value === "2") {
            handleCardEffect(selectedCard);
          } else if (selectedCard.value === "8") {
            handleCardEffect(selectedCard);
          } else {
            advanceTurn();
          }

          updatedGameState();
        }
      }
  }})

  //Reset game state
  socket.on("reset-game", () => {
    resetGameState();
  })

});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
