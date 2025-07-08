import type { CommonCard } from "@heart-of-crown-randomizer/card/type";

// Core interfaces
export interface ICardSelector {
  readonly options: CardSelectionOptions;
  drawRandomCards(): CardSelectionResult;
  drawMissingCards(currentSelection: readonly CommonCard[]): readonly CommonCard[];
  getAvailableCards(): readonly CommonCard[];
}

export interface IExcludedCardManager {
  readonly excludedCards: readonly CommonCard[];
  addCard(card: CommonCard): void;
  removeCard(card: CommonCard): void;
  clearAll(): void;
  isExcluded(card: CommonCard): boolean;
}

export interface IUrlManager {
  generateShareUrl(cards: readonly CommonCard[], origin: string): string;
  parseCardsFromUrl(cardIds: readonly string[]): readonly CommonCard[];
  cardsToQueryString(cards: readonly CommonCard[]): string;
}

export interface ISwipeHandler {
  readonly threshold: number;
  onSwipeStart(event: TouchEvent | MouseEvent, index: number): void;
  onSwipeMove(event: TouchEvent | MouseEvent): void;
  onSwipeEnd(): void;
  onSwipeCancel(): void;
  destroy(): void;
}

// Configuration types
export interface CardSelectionOptions {
  readonly numberOfCards: number;
  readonly excludedCards: readonly CommonCard[];
  readonly allowDuplicates?: boolean;
  readonly sortByIdAfterSelection?: boolean;
}

export interface SwipeConfiguration {
  readonly threshold: number;
  readonly verticalCancelThreshold: number;
  readonly opacityTransition: boolean;
  readonly animationDuration: number;
}

export interface StorageConfiguration {
  readonly storageKey: string;
  readonly enablePersistence: boolean;
  readonly storageType: 'localStorage' | 'sessionStorage';
}

// Result types
export interface CardSelectionResult {
  readonly selectedCards: readonly CommonCard[];
  readonly availableCards: readonly CommonCard[];
  readonly selectionMetadata: SelectionMetadata;
}

export interface SelectionMetadata {
  readonly timestamp: Date;
  readonly totalAvailable: number;
  readonly excludedCount: number;
  readonly requestedCount: number;
  readonly actualCount: number;
  readonly hasReachedLimit: boolean;
}

export interface CardsByEdition {
  readonly basicCards: readonly CommonCard[];
  readonly farEasternCards: readonly CommonCard[];
}

// Event types
export interface SwipeEvent {
  readonly type: 'start' | 'move' | 'end' | 'cancel';
  readonly cardIndex: number;
  readonly deltaX: number;
  readonly deltaY: number;
  readonly threshold: number;
  readonly shouldDelete: boolean;
}

export interface CardSelectionEvent {
  readonly type: 'draw' | 'add' | 'remove' | 'clear';
  readonly cards: readonly CommonCard[];
  readonly metadata: SelectionMetadata;
}

// Error types
export abstract class CardSelectorError extends Error {
  abstract readonly code: string;
  abstract readonly context: Record<string, unknown>;
}

export class InvalidCardIdError extends CardSelectorError {
  readonly code = 'INVALID_CARD_ID';
  readonly context: Record<string, unknown>;

  constructor(cardId: number | string, context: Record<string, unknown> = {}) {
    super(`Invalid card ID: ${cardId}`);
    this.context = { cardId, ...context };
  }
}

export class InsufficientCardsError extends CardSelectorError {
  readonly code = 'INSUFFICIENT_CARDS';
  readonly context: Record<string, unknown>;

  constructor(requested: number, available: number, context: Record<string, unknown> = {}) {
    super(`Insufficient cards: requested ${requested}, available ${available}`);
    this.context = { requested, available, ...context };
  }
}

export class StorageError extends CardSelectorError {
  readonly code = 'STORAGE_ERROR';
  readonly context: Record<string, unknown>;

  constructor(operation: string, cause?: Error, context: Record<string, unknown> = {}) {
    super(`Storage operation failed: ${operation}`);
    this.context = { operation, cause, ...context };
  }
}

// Utility types
export type CardFilterPredicate = (card: CommonCard) => boolean;
export type CardComparator = (a: CommonCard, b: CommonCard) => number;
export type CardMapper<T> = (card: CommonCard) => T;

export type SwipeEventHandler = (event: SwipeEvent) => void;
export type CardSelectionEventHandler = (event: CardSelectionEvent) => void;
export type CardRemovalHandler = (index: number) => void;

// Type guards
export const isCommonCard = (obj: unknown): obj is CommonCard => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'cost' in obj &&
    'edition' in obj &&
    typeof (obj as CommonCard).id === 'number' &&
    typeof (obj as CommonCard).name === 'string' &&
    typeof (obj as CommonCard).cost === 'number' &&
    typeof (obj as CommonCard).edition === 'number'
  );
};

export const isTouchEvent = (event: TouchEvent | MouseEvent): event is TouchEvent => {
  return 'touches' in event;
};

// Constants
export const DEFAULT_CARD_SELECTION_OPTIONS: Required<CardSelectionOptions> = {
  numberOfCards: 10,
  excludedCards: [],
  allowDuplicates: false,
  sortByIdAfterSelection: true,
} as const;

export const DEFAULT_SWIPE_CONFIGURATION: SwipeConfiguration = {
  threshold: 100,
  verticalCancelThreshold: 50,
  opacityTransition: true,
  animationDuration: 200,
} as const;

export const DEFAULT_STORAGE_CONFIGURATION: StorageConfiguration = {
  storageKey: 'excludedCommons',
  enablePersistence: true,
  storageType: 'localStorage',
} as const;