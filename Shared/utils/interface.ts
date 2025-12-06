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
}

export interface Bot {
    id: string,
    name: string,
    avatar: string,
    cards: Card[],
    isBot: boolean,
}

export interface Card {
    code: string;
    image: string; 
    backImage: string;
    value: CardValue; 
    suit: Suit;
    action: Action;  
}