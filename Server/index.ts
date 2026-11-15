import express from "express";
import http from "http";
import { Server } from "socket.io";
import type { Player, Card, Suit, GameState } from "../Shared/utils/interface";
import { Deck } from "../Shared/utils/Deck";
import cards from '../Shared/utils/deckofcards.json'

const app = express();
const server = http.createServer(app);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      CLIENT_URL,
    ],
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

        emitRoomUpdated();
        console.log("Updated players:", gameState.players.map(p => p.name));
        updatedGameState();
    });


    //Disconnect
    socket.on("disconnect", () => {
        console.log("user disconnected:", socket.id);
        const leavingIndex = gameState.players.findIndex(p => p.socketId === socket.id);
        if (leavingIndex === -1) return;

        removePlayerAt(leavingIndex);
        emitRoomUpdated();

        // A game can't continue with fewer than 2 players: reset the table,
        // but keep whoever is still connected so they don't have to rejoin.
        if (gameState.cardsDealt && !gameState.gamesOver && gameState.players.length < 2) {
          resetGameState(gameState.players);
        } else {
          updatedGameState();
        }
    });


    //Remove a player and keep turnIndex pointing at the right player
    function removePlayerAt(index: number) {
      // If the player leaving was choosing a suit, close the picker so the game doesn't stall
      if (index === gameState.turnIndex) {
        gameState.showSuitPicker = false;
      }
      gameState.players = gameState.players.filter((_, i) => i !== index);
      const count = gameState.players.length;
      if (count === 0) {
        gameState.turnIndex = 0;
        return;
      }
      // Players after the removed one shift down by one. If the removed player
      // held the turn, the next player (now at the same index) gets it.
      if (index < gameState.turnIndex) {
        gameState.turnIndex -= 1;
      }
      gameState.turnIndex %= count;
    }


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

    //Update game state helper function.
    //Each socket gets its own view so nobody can read opponents' hands or the
    //deck order from DevTools (Network → WS frames, React state).
    function updatedGameState() {
      for (const [socketId, client] of io.sockets.sockets) {
        const view: GameState = {
          players: playersVisibleTo(socketId),
          discardPile: gameState.discardPile,
          turnIndex: gameState.turnIndex,
          suit: gameState.suit,
          cardsDealt: gameState.cardsDealt,
          showSuitPicker: gameState.showSuitPicker,
          gamesOver: gameState.gamesOver,
          deckCount: gameState.deck.cards.length,
          leaderBoard: gameState.gamesOver
            ? gameState.leaderBoard
            : gameState.leaderBoard.map(p => hideHand(p, socketId)),
        };
        client.emit("state-updated", view);
      }
    }

    //Players list with every hand except the viewer's replaced by a card count
    function playersVisibleTo(socketId: string): Player[] {
      return gameState.players.map(p => hideHand(p, socketId));
    }

    function hideHand(player: Player, viewerSocketId: string): Player {
      if (player.socketId === viewerSocketId) return player;
      return { ...player, cards: [], cardCount: player.cards.length };
    }

    function emitRoomUpdated() {
      for (const [socketId, client] of io.sockets.sockets) {
        client.emit("room-updated", playersVisibleTo(socketId));
      }
    }

    //Reset game state helper function
    function resetGameState(keepPlayers: Player[] = []) {
      gameState = {
        players: keepPlayers.map(player => ({ ...player, cards: [] })),
        deck: new Deck(jsonCards),
        discardPile: [] as Card[],
        turnIndex: 0,
        suit: "" as Suit,
        leaderBoard: [] as Player[],
        cardsDealt: false,
        gamesOver: false,
        showSuitPicker: false,
      }
      updatedGameState();
    }


    //Repopulate deck
    socket.on("repopulate-deck", () => {
      // Every client asks when the deck runs out; only the first request should
      // act, or later ones would replace the refilled deck with an empty one.
      if (gameState.deck.cards.length > 0 || gameState.discardPile.length <= 1) return;

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
      const currentPlayer = gameState.players[gameState.turnIndex];
      if (currentPlayer.socketId !== socket.id) return;

      const drawnCard = gameState.deck.takeCard();
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
          // Only accept a card the player actually holds
          const handIndex = currentPlayer.cards.findIndex(
            (card) => card.suit === selectedCard.suit && card.value === selectedCard.value
          );
          if (handIndex === -1) return;

          const playedCard = currentPlayer.cards[handIndex];
          const newHand = currentPlayer.cards.filter((_, i) => i !== handIndex);

          if (newHand.length === 0) {
            const winnerIndex = gameState.turnIndex;
            gameState.discardPile.push(playedCard);
            // Winner is gone, so nobody picks a suit after a winning 8: the 8's own suit stands
            gameState.suit = playedCard.suit;
            gameState.leaderBoard = [...gameState.leaderBoard, { ...currentPlayer, cards: [] }];

            removePlayerAt(winnerIndex);
            const playersRemaining = gameState.players;

            if (playersRemaining.length === 1) {
              gameState.leaderBoard = [...gameState.leaderBoard, playersRemaining[0]];
              gameState.gamesOver = true;
              updatedGameState();
              return;
            }

            // After removal, the next player sits at turnIndex. A winning 2 or Jack still applies to them.
            if (playedCard.value === "2") {
              const victimIndex = gameState.turnIndex;
              const drawnCards = gameState.deck.takeCards(2);
              gameState.players = gameState.players.map((player, index) =>
                index === victimIndex ? { ...player, cards: [...player.cards, ...drawnCards] } : player
              );
              gameState.turnIndex = (victimIndex + 1) % gameState.players.length;
            } else if (playedCard.value === "JACK") {
              gameState.turnIndex = (gameState.turnIndex + 1) % gameState.players.length;
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
          gameState.discardPile.push(playedCard);

          if (selectedCard.value === topCard.value) {
            gameState.suit = playedCard.suit;
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

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
