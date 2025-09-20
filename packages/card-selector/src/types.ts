import type { CommonCard } from "@heart-of-crown-randomizer/card/type";

export interface CardSelectionOptions {
  numberOfCards: number;
  excludedCards: CommonCard[];
}

export interface CardSelectionResult {
  selectedCards: CommonCard[];
  availableCards: CommonCard[];
}

export interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  isDragging: boolean;
  cardElement: HTMLElement | null;
  cardIndex: number;
  threshold: number;
}

export interface SwipeHandlers {
  onSwipeStart: (event: TouchEvent | MouseEvent, index: number) => void;
  onSwipeMove: (event: TouchEvent | MouseEvent) => void;
  onSwipeEnd: () => void;
  onSwipeCancel: () => void;
}