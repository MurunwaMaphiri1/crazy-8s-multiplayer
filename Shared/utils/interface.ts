export type CardValue = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "JACK" | "QUEEN" | "KING" | "ACE";
export type Suit = "DIAMONDS" | "HEARTS" | "CLUBS" | "SPADES";
export type Action = "None" | "ChangeSuit" | "DrawTwo" | "Skip";

export interface Player {
    id: string,
    name: string,
    avatar: string,
    cards: Card[],
    isBot: boolean,
    socketId?: string,
    // Set instead of `cards` when the server hides another player's hand
    cardCount?: number,
}

export interface Bot {
    id: string,
    name: string,
    avatar: string,
    cards: Card[],
    isBot: boolean,
}

export interface GameState {
  players: Player[];
  discardPile: Card[];
  turnIndex: number;
  suit: Suit;
  cardsDealt: boolean;
  showSuitPicker: boolean;
  gamesOver: boolean;
  leaderBoard: Player[];
  // Only the size of the draw pile is sent, never its order
  deckCount: number;
}

export interface Card {
    code: string;
    // image: string;
    // backImage: string;
    value: CardValue;
    suit: Suit;
    action: Action;
}
