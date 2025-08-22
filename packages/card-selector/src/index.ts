// Core card selection functionality
export {
  getAllCommonCards,
  getAvailableCards,
  drawRandomCards,
  drawMissingCards,
  findCardById,
  parseCardIdsFromUrl,
  separateCardsByEdition,
} from "./card-selection.js";

// URL and sharing utilities
export {
  cardsToQuery,
  generateShareUrl,
  copyToClipboard,
} from "./url-utils.js";

// Swipe gesture handling
export {
  isTouchEvent,
  createSwipeHandler,
} from "./swipe-handler.js";

// Local storage management
export {
  loadExcludedCards,
  saveExcludedCards,
  clearExcludedCards,
  addExcludedCard,
  removeExcludedCard,
} from "./storage.js";

// Type definitions
export type {
  CardSelectionOptions,
  CardSelectionResult,
  SwipeState,
  SwipeHandlers,
} from "./types.js";