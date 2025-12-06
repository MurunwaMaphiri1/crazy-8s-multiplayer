import { create } from "zustand"
import type { Card, Player, Suit, Bot } from "../../Shared/utils/interface"
import cards from "../../Shared/utils/deckofcards.json"
import bots from "../../Shared/utils/bots.json"
import { Deck } from "../../Shared/utils/Deck"
import { io } from "socket.io-client"

const jsonCards = cards as Card[];
// let socket: any = null;

type GameStore = {
  players: Player[];
  deck: Deck;
  discardPile: Card[];
  turnIndex: number;
  suit: Suit | null;
  leaderBoard: Player[];
  cardsDealt: boolean;
  gamesOver: boolean;
  showSuitPicker: boolean;

  setPlayers: (players: Player[]) => void;
  setDeck: (cards: Card[]) => void;
  setDiscardPile: (cards: Card[]) => void;
  setTurnIndex: (index: number) => void;
  setSuit: (suit: Suit | null) => void;
  setCardsDealt: (dealt: boolean) => void;
  setLeaderboard: (players: Player[]) => void;
  setGameOver: (isGameOver: boolean) => void;
  setSuitPicker: (suitPicker: boolean) => void;
  repopulateDeck: () => void;
  advanceTurn: () => void;
  playCard: (card: Card) => void;
  compPlay: () => void;
  handleCardEffect: (card: Card) => void;
  draw: () => void;
  draw2: () => void;
  jumpPlayer: () => void;
  changeSuit: (newSuit: Suit) => void;
  resetGame: () => void;
  initPlayers: () => void;
  // initOnlinePlayer: () => void;
  dealCards: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  players: [],
  deck: new Deck(jsonCards),
  discardPile: [],
  turnIndex: 0,
  suit: null,
  leaderBoard: [],
  cardsDealt: false,
  gamesOver: false,
  showSuitPicker: false,

  setPlayers: (players) => set({ players }),
  setDeck: (cards) => set({ deck: new Deck(cards) }),
  setDiscardPile: (cards) => set({ discardPile: cards }),
  setTurnIndex: (index) => set({ turnIndex: index }),
  setSuit: (suit) => set({ suit }),
  setCardsDealt: (dealt) => set({ cardsDealt: dealt }),
  setLeaderboard: (leaderBoard) => set({ leaderBoard }),
  setGameOver: (gamesOver) => set({ gamesOver }),
  setSuitPicker: (showSuitPicker) => set({ showSuitPicker }),

  // initOnlinePlayer: () => {
  //   if (typeof window === "undefined") return;

  //   if (!socket) {
  //     socket = io("http://localhost:3000"); 
  //   }

  //   const player1: Player = {
  //     id: crypto.randomUUID(),
  //     socketId: "",
  //     name: localStorage.getItem("playerName") || "Joker",
  //     avatar: localStorage.getItem("playerImg") || "/Images/Persona-5-icons/Joker.jpg",
  //     cards: [],
  //     isBot: false,
  //   };

  //   socket.on("connect", () => {
  //     player1.socketId = socket.id;
  //     socket.emit("join-room", player1);
  //   })

  //   socket.on("room-updated", (updatedPlayers: Player[]) => {
  //     set({ players: updatedPlayers })
  //     console.log(updatedPlayers)
  //   }
  //   );

  //   socket.on("deal-cards", () => {
  //     get().dealCards();
  //   })
  // },

  //Craete players array
  initPlayers: () => {
    if (typeof window === "undefined") return;

    const player: Player = {
      id: "1",
      name: localStorage.getItem("playerName") || "Joker",
      avatar: localStorage.getItem("playerImg") || "/Images/Persona-5-icons/Joker.jpg",
      cards: [],
      isBot: false,
    };

    const randomBot = bots[Math.floor(Math.random() * bots.length)];

    const bot: Bot = {
      id: "6",
      name: randomBot.name || "Ann",
      avatar: randomBot.avatar || "/images/Persona-5-icons/Ann.jpg",
      cards: [],
      isBot: true,
    };

    set({ players: [player, bot] });
  },

  //Deal cards to players
  dealCards: () => {
    const { deck, players } = get();
    deck.shuffle();

    const updatedPlayers = players.map(player => ({
      ...player,
      cards: deck.takeCards(8),
    }));

    const topCard = deck.takeCard();

    set({
      players: updatedPlayers,
      discardPile: topCard ? [topCard] : [],
      suit: topCard ? topCard.suit : null,
      turnIndex: 0,
      cardsDealt: true,
    });
  },

  //Advance turn
  advanceTurn: () => {
    const { turnIndex, players, setTurnIndex } = get();
    setTurnIndex((turnIndex + 1) % players.length);
  },

  //Repopulate deck
  repopulateDeck: () => {
    const discardPile = get().discardPile;
    const setDeck = get().setDeck;
    const setDiscardPile = get().setDiscardPile;
    const setSuit = get().setSuit;


    const cardsToReshuffle = discardPile.slice(0, -1);
    const topCard = discardPile[discardPile.length - 1];

    setDeck(cardsToReshuffle);
    const newDeck = get().deck;
    newDeck.shuffle();

    setDiscardPile([topCard]);
    setSuit(topCard.suit)
  },

  //handleCardEffect
  handleCardEffect: (selected: Card) => {
    const { players, turnIndex, setSuit, setSuitPicker, draw2, jumpPlayer } = get()
    switch (selected.value) {
        case "2":
            draw2();
            break;
        case "JACK":
            jumpPlayer();
            break;
        case "8":
            if (players[turnIndex].isBot == true) {
                const suitCount: Record<string, number> = {};

                for (let card of players[turnIndex].cards) {
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
                
                setSuit(chosenSuit || selected.suit);

            } else {
                setSuitPicker(true);
            }
            break;
        default:
            break;
    }
  },

  //Draw 1
  draw: () => {
    const { players, turnIndex, deck, setPlayers, advanceTurn } = get();
    const drawCard = deck.takeCard();
    
    if (!drawCard) return;

    const updatedPlayers = players.map((player, index) => 
        index === turnIndex
            ? { ...player, cards: [...player.cards, drawCard] }
            : player
    )

    setPlayers(updatedPlayers);
    advanceTurn();
  },

  //Draw 2
  draw2: () => {
    const { players, turnIndex, deck, setPlayers, setTurnIndex } = get();
    const drawnCards: Card[] = deck.takeCards(2);
    const nextPlayerIndex = (turnIndex + 1) % players.length;

    const updatedPlayers = players.map((player, index) => 
        index === nextPlayerIndex
            ? { ...player, cards: [...player.cards, ...drawnCards] }
            : player
    )

    setPlayers(updatedPlayers);
    setTurnIndex((turnIndex + 2) % players.length);
  },

  //Jump Player
  jumpPlayer: () => {
    const { setTurnIndex, turnIndex, players } = get();

    setTurnIndex((turnIndex + 2) % players.length)
  },

  //Change suit
  changeSuit: (newSuit: Suit) => {
    const { setSuit, setSuitPicker, advanceTurn } = get();

    setSuit(newSuit);
    setSuitPicker(false);
    advanceTurn();
  },

  //Play card
  playCard: (selected: Card) => {
    const { players, leaderBoard } = get();
    const currentSuit = get().suit;
    const discardPile = get().discardPile;
    const turnIndex = get().turnIndex;
    const setLeaderboard = get().setLeaderboard;
    const setPlayers = get().setPlayers;
    const setGameOver = get().setGameOver;
    const setDiscardPile = get().setDiscardPile;
    const setSuit = get().setSuit;
    const handleCardEffect = get().handleCardEffect;
    const advanceTurn = get().advanceTurn;

    const topCard = discardPile[discardPile.length - 1];

    if (players[turnIndex].isBot === false) {
        if (
            selected.suit === currentSuit ||
            selected.value === topCard.value ||
            selected.value === "8"
        ) {
            let cardRemoved = false;
            const currentPlayerIndex = turnIndex;
            const currentPlayer = players[currentPlayerIndex];

            const newHand = currentPlayer.cards.filter((card) => {
                if (!cardRemoved && card.suit === selected.suit && card.value === selected.value) {
                    cardRemoved = true;
                    return false;
                }
                return true;
            })

            if (newHand.length === 0) {
                const updatedLeaderboard = [...leaderBoard, currentPlayer]
                setLeaderboard(updatedLeaderboard);

                const playersRemaining = players.filter(player => player.id !== currentPlayer.id);

                setPlayers(playersRemaining);

                if (playersRemaining.length === 1) {
                    setLeaderboard([...updatedLeaderboard, playersRemaining[0]]);
                    setGameOver(true);
                    return;
                }
            } else {
                const updatedPlayers = players.map((player, index) => 
                    index === currentPlayerIndex
                        ? { ...player, cards: newHand }
                        : player
                )

                setPlayers(updatedPlayers);

                setDiscardPile([...discardPile, selected]);

                if (selected.value === topCard.value) {
                    setSuit(selected.suit);
                }

                if (selected.value === "JACK" || selected.value === "2") {
                    handleCardEffect(selected);
                } else if (selected.value === "8") {
                    handleCardEffect(selected)
                } else {
                    advanceTurn()
                }
            }
        }
    }
  },

  //Computer play
  compPlay: () => {
    const { players, leaderBoard, draw } = get();
    const currentSuit = get().suit;
    const discardPile = get().discardPile;
    const turnIndex = get().turnIndex;
    const setLeaderboard = get().setLeaderboard;
    const setPlayers = get().setPlayers;
    const setGameOver = get().setGameOver;
    const setDiscardPile = get().setDiscardPile;
    const setSuit = get().setSuit;
    const handleCardEffect = get().handleCardEffect;
    const advanceTurn = get().advanceTurn;

    const topCard = discardPile[discardPile.length - 1];
    const currentPlayer = players[turnIndex];
    let selected;

    for (let card of currentPlayer.cards) {
            if (
                card.suit === currentSuit ||
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
            const updatedLeaderboard = [...leaderBoard, currentPlayer]
            setLeaderboard(updatedLeaderboard);

            const playersWithoutWinner = players.filter(player => player.id !== currentPlayer.id);

            setPlayers(playersWithoutWinner); 
            setDiscardPile([...discardPile, selected]);
                
            if (playersWithoutWinner.length === 1) {
                setLeaderboard([...updatedLeaderboard, playersWithoutWinner[0]]);
                setGameOver(true);
                return;
            }

        } else {
                const updatedPlayers = players.map((player, index) => 
                    index === turnIndex
                        ? { ...player, cards: updatedHand }
                        : player
                    )

                    setPlayers(updatedPlayers);
                    setDiscardPile([...discardPile, selected]);

                    if (selected.value === topCard.value) {
                        setSuit(selected.suit)
                    }

                    if (selected.value === "JACK" || selected.value === "2") {
                        handleCardEffect(selected)
                    } else if (selected.value === "8") {
                        handleCardEffect(selected)
                        advanceTurn()
                    } else {
                        advanceTurn()
                    }
                }
    } else {
        draw()
    }
  },

  //Reset Game
  resetGame: () => {
    const freshDeck = new Deck(jsonCards);
    freshDeck.shuffle();
    set({
      deck: freshDeck,
      players: [],
      discardPile: [],
      turnIndex: 0,
      cardsDealt: false,
    });
  },
}));