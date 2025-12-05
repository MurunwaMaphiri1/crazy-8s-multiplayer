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
    discardPile: [] as Card[],
    turnIndex: 0,
    suit: "",
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
    });

    socket.on("disconnect", () => {
        console.log("user disconnected:", socket.id);
        gameState.players = gameState.players.filter(p => p.socketId !== socket.id);
        io.emit("room-updated", gameState.players);
    });

    socket.on("start-game", () => {
        console.log("Game started by:", socket.id);
        io.emit("deal-cards");
    });

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
    })

    socket.on("advance-turn", () => {
      gameState.turnIndex = (gameState.turnIndex + 1) % gameState.players.length;
      io.emit("turn-advanced", gameState.turnIndex);
    });

    socket.on("repopulate-deck", () => {
      const cardsToShuffle = gameState.discardPile.slice(0, -1);
      const topCard = gameState.discardPile[gameState.discardPile.length - 1];
      gameState.deck.reset(cardsToShuffle);
      gameState.deck.shuffle();
      gameState.discardPile = [topCard];
      io.emit("deck-repopulated");
    });

    socket.on("handle-card-effect", (selectedCard: Card) => {
      switch (selectedCard.value) {
        case "2":
          socket.emit("draw2");
          break;
        case "JACK":
          socket.emit("jump-player");
          break;
        case "8":
            if (gameState.players[gameState.turnIndex].isBot == true) {
                const suitCount: Record<string, number> = {};

                for (let card of gameState.players[gameState.turnIndex].cards) {
                    suitCount[card.suit] = (suitCount[card.suit] || 0) + 1;
                }

                let maxCount = 0;
                let chosenSuit: Card['suit'] | null = null;

                for (let [cardSuit, count] of Object.entries(suitCount)) {
                    if (count > maxCount) {
                        maxCount = count;
                        chosenSuit = cardSuit as Card['suit'];
                    }
                }
                
                gameState.suit = chosenSuit || selectedCard.suit;

            } else {
                gameState.showSuitPicker = true;
            }
      }
    });

    socket.on("draw-card", () => {
      const drawnCard = gameState.deck.takeCard();

      if (!drawnCard) return;

      const updatedPlayers = gameState.players.map((player, index) => 
          index === gameState.turnIndex
              ? { ...player, cards: [...player.cards, drawnCard] }
              : player
      )

      gameState.players = updatedPlayers;
      io.emit("card-drawn", { playerIndex: gameState.turnIndex, card: drawnCard });
      socket.emit("advance-turn");
    })

    socket.on("draw2", () => {
      const drawnCards: Card[] = gameState.deck.takeCards(2);

      const nextPlayerIndex = (gameState.turnIndex + 1) % gameState.players.length;

      const updatedPlayers = gameState.players.map((player, index) => 
          index === nextPlayerIndex
              ? { ...player, cards: [...player.cards, ...drawnCards] }
              : player
      )

      gameState.players = updatedPlayers;
      gameState.turnIndex = (gameState.turnIndex + 2) % gameState.players.length;
    });

    socket.on("jump-player", () => {
      gameState.turnIndex = (gameState.turnIndex + 2) % gameState.players.length;
    });

    socket.on("playCard", (selectedCard: Card) => {
      const topCard = gameState.discardPile[gameState.discardPile.length - 1]; 

      if (gameState.players[gameState.turnIndex].isBot === false) {
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
              return;
            }
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
            socket.emit("handle-card-effect", selectedCard);
          } else if (selectedCard.value === "8") {
            socket.emit("handle-card-effect", selectedCard);
          } else {
            socket.emit("advance-turn");
          }
        }
      }
  }})

  socket.on("comp-play", () => {
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const currentPlayer = gameState.players[gameState.turnIndex];
    let selected;

    for (let card of currentPlayer.cards) {
            if (
                card.suit === gameState.suit ||
                card.value === topCard.value ||
                card.value === "8"
            ) {
                selected = card;
                break;
            }
    } 

    if (selected) {
        const updatedHand = currentPlayer.cards.filter((card) => 
            !(card.suit === selected.suit && card.value === selected.value)
        )

        if (updatedHand.length === 0) {
            const updatedLeaderboard = [...gameState.leaderBoard, currentPlayer]
            gameState.leaderBoard = updatedLeaderboard;

            const playersWithoutWinner = gameState.players.filter(player => player.id !== currentPlayer.id);

            gameState.players = playersWithoutWinner; 
            gameState.discardPile.push(selected);
                
            if (playersWithoutWinner.length === 1) {
                gameState.leaderBoard = [...updatedLeaderboard, playersWithoutWinner[0]];
                gameState.gamesOver = true;
                return;
            }

        } else {
                const updatedPlayers = gameState.players.map((player, index) => 
                    index === gameState.turnIndex
                        ? { ...player, cards: updatedHand }
                        : player
                    )

                    gameState.players = updatedPlayers;
                    gameState.discardPile = [...gameState.discardPile, selected];

                    if (selected.value === topCard.value) {
                        gameState.suit = selected.suit;
                    }

                    if (selected.value === "JACK" || selected.value === "2") {
                        socket.emit("handle-card-effect", selected)
                    } else if (selected.value === "8") {
                        socket.emit("handle-card-effect", selected)
                        socket.emit("advance-turn");
                    } else {
                        socket.emit("advance-turn");
                    }
                }
    } else {
        socket.emit("draw-card");
    }
  })

  socket.on("reset-game", () => {
    gameState = {
        players: [] as Player[],
        deck: new Deck(jsonCards),
        discardPile: [] as Card[],
        turnIndex: 0,
        suit: "",
        leaderBoard: [] as Player[],
        cardsDealt: false,
        gamesOver: false,
        showSuitPicker: false,
    }
  })

});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
