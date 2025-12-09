import cards from '../utils/deckofcards.json'
import type { Card } from '../utils/interface'

export class Deck {
    cards: Card[] = [];

      constructor(jsonCards: Card[]) {
    this.cards = jsonCards.map(card => ({
      ...card,
    }));
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

    takeCard(): Card | undefined {
    return this.cards.shift();
  }

  takeCards(count: number): Card[] {
    if (count < 0) throw new Error('Card count must be non-negative');
    return this.cards.splice(0, count);
  }

  reset(jsonCards: Card[]): void {
    this.cards = jsonCards.map(card => ({
      ...card,
    }));
  }
}