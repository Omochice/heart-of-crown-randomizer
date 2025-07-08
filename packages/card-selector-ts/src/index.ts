// Core services
export { CardSelector } from "./services/card-selector.js";
export { ExcludedCardManager } from "./services/excluded-card-manager.js";

// Handlers
export { SwipeHandler } from "./handlers/swipe-handler.js";

// Utilities
export { UrlManager } from "./utils/url-manager.js";

// Type definitions and interfaces
export type {
  // Core interfaces
  ICardSelector,
  IExcludedCardManager,
  IUrlManager,
  ISwipeHandler,

  // Configuration types
  CardSelectionOptions,
  SwipeConfiguration,
  StorageConfiguration,

  // Result types
  CardSelectionResult,
  SelectionMetadata,
  CardsByEdition,

  // Event types
  SwipeEvent,
  CardSelectionEvent,

  // Function types
  CardFilterPredicate,
  CardComparator,
  CardMapper,
  SwipeEventHandler,
  CardSelectionEventHandler,
  CardRemovalHandler,
} from "./types/index.js";

// Error types
export {
  CardSelectorError,
  InvalidCardIdError,
  InsufficientCardsError,
  StorageError,
} from "./types/index.js";

// Type guards
export {
  isCommonCard,
  isTouchEvent,
} from "./types/index.js";

// Constants
export {
  DEFAULT_CARD_SELECTION_OPTIONS,
  DEFAULT_SWIPE_CONFIGURATION,
  DEFAULT_STORAGE_CONFIGURATION,
} from "./types/index.js";

// Utility functions for card management
export {
  getAllCommonCards,
  getAvailableCards,
  separateCardsByEdition,
} from "./utils/card-utilities.js";

// High-level facade for common use cases
export { CardSelectorFacade } from "./facade/card-selector-facade.js";