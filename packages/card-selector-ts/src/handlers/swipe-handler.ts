import type {
  ISwipeHandler,
  SwipeConfiguration,
  SwipeEvent,
  SwipeEventHandler,
  CardRemovalHandler,
} from "../types/index.js";
import { DEFAULT_SWIPE_CONFIGURATION } from "../types/index.js";
import { isTouchEvent } from "../types/index.js";

/**
 * TypeScript implementation of swipe gesture handling
 * Provides touch and mouse support with configurable thresholds and events
 */
export class SwipeHandler implements ISwipeHandler {
  private readonly _config: SwipeConfiguration;
  private readonly _onCardRemove: CardRemovalHandler;
  private readonly _eventListeners: Map<string, SwipeEventHandler[]>;

  // Swipe state
  private _isActive: boolean = false;
  private _startX: number = 0;
  private _startY: number = 0;
  private _currentX: number = 0;
  private _currentY: number = 0;
  private _cardElement: HTMLElement | null = null;
  private _cardIndex: number = -1;
  private _isDestroyed: boolean = false;

  // Bound event handlers for cleanup
  private readonly _boundMouseMove: (event: MouseEvent) => void;
  private readonly _boundMouseUp: () => void;

  constructor(
    onCardRemove: CardRemovalHandler,
    config: Partial<SwipeConfiguration> = {}
  ) {
    this._config = Object.freeze({
      ...DEFAULT_SWIPE_CONFIGURATION,
      ...config,
    });

    this._onCardRemove = onCardRemove;
    this._eventListeners = new Map();

    // Bind methods for event listener cleanup
    this._boundMouseMove = this._handleMouseMove.bind(this);
    this._boundMouseUp = this._handleMouseUp.bind(this);
  }

  /**
   * Get swipe threshold
   */
  get threshold(): number {
    return this._config.threshold;
  }

  /**
   * Start swipe gesture
   */
  onSwipeStart(event: TouchEvent | MouseEvent, index: number): void {
    if (this._isDestroyed || this._isActive) {
      return;
    }

    const clientX = isTouchEvent(event) ? event.touches[0]!.clientX : event.clientX;
    const clientY = isTouchEvent(event) ? event.touches[0]!.clientY : event.clientY;

    this._isActive = true;
    this._startX = clientX;
    this._startY = clientY;
    this._currentX = clientX;
    this._currentY = clientY;
    this._cardElement = event.currentTarget as HTMLElement;
    this._cardIndex = index;

    // Add document-level mouse event listeners for mouse events
    if (!isTouchEvent(event)) {
      document.addEventListener("mousemove", this._boundMouseMove);
      document.addEventListener("mouseup", this._boundMouseUp);
    }

    // Emit start event
    this._emitSwipeEvent({
      type: "start",
      cardIndex: this._cardIndex,
      deltaX: 0,
      deltaY: 0,
      threshold: this._config.threshold,
      shouldDelete: false,
    });
  }

  /**
   * Handle swipe movement
   */
  onSwipeMove(event: TouchEvent | MouseEvent): void {
    if (this._isDestroyed || !this._isActive || !this._cardElement) {
      return;
    }

    const clientX = isTouchEvent(event) ? event.touches[0]!.clientX : event.clientX;
    const clientY = isTouchEvent(event) ? event.touches[0]!.clientY : event.clientY;

    this._currentX = clientX;
    this._currentY = clientY;

    const deltaX = clientX - this._startX;
    const deltaY = Math.abs(clientY - this._startY);

    // Cancel swipe if vertical movement exceeds threshold
    if (deltaY > this._config.verticalCancelThreshold) {
      this._emitSwipeEvent({
        type: "cancel",
        cardIndex: this._cardIndex,
        deltaX,
        deltaY,
        threshold: this._config.threshold,
        shouldDelete: false,
      });
      this.onSwipeCancel();
      return;
    }

    // Update visual feedback
    this._updateCardVisuals(deltaX);

    // Emit move event
    this._emitSwipeEvent({
      type: "move",
      cardIndex: this._cardIndex,
      deltaX,
      deltaY,
      threshold: this._config.threshold,
      shouldDelete: Math.abs(deltaX) > this._config.threshold,
    });
  }

  /**
   * End swipe gesture
   */
  onSwipeEnd(): void {
    if (this._isDestroyed || !this._isActive) {
      return;
    }

    const deltaX = this._currentX - this._startX;
    const deltaY = Math.abs(this._currentY - this._startY);
    const shouldDelete = Math.abs(deltaX) > this._config.threshold;

    // Emit end event
    this._emitSwipeEvent({
      type: "end",
      cardIndex: this._cardIndex,
      deltaX,
      deltaY,
      threshold: this._config.threshold,
      shouldDelete,
    });

    if (shouldDelete) {
      // Trigger card removal
      this._onCardRemove(this._cardIndex);
    } else {
      // Return card to original position
      this._resetCardVisuals();
    }

    this._cleanup();
  }

  /**
   * Cancel swipe gesture
   */
  onSwipeCancel(): void {
    if (this._isDestroyed || !this._isActive) {
      return;
    }

    // Emit cancel event
    this._emitSwipeEvent({
      type: "cancel",
      cardIndex: this._cardIndex,
      deltaX: this._currentX - this._startX,
      deltaY: Math.abs(this._currentY - this._startY),
      threshold: this._config.threshold,
      shouldDelete: false,
    });

    // Reset card visuals
    this._resetCardVisuals();
    this._cleanup();
  }

  /**
   * Add event listener
   */
  addEventListener(type: "swipe", handler: SwipeEventHandler): void {
    if (!this._eventListeners.has(type)) {
      this._eventListeners.set(type, []);
    }
    this._eventListeners.get(type)!.push(handler);
  }

  /**
   * Remove event listener
   */
  removeEventListener(type: "swipe", handler: SwipeEventHandler): void {
    const handlers = this._eventListeners.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Destroy handler and clean up resources
   */
  destroy(): void {
    if (this._isDestroyed) {
      return;
    }

    this._isDestroyed = true;
    this._cleanup();
    this._eventListeners.clear();
  }

  /**
   * Handle mouse move events (bound method)
   */
  private _handleMouseMove(event: MouseEvent): void {
    this.onSwipeMove(event);
  }

  /**
   * Handle mouse up events (bound method)
   */
  private _handleMouseUp(): void {
    this.onSwipeEnd();
  }

  /**
   * Update card visual feedback during swipe
   */
  private _updateCardVisuals(deltaX: number): void {
    if (!this._cardElement) {
      return;
    }

    // Update transform
    this._cardElement.style.transform = `translateX(${deltaX}px)`;

    // Update opacity if enabled
    if (this._config.opacityTransition) {
      const opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 200);
      this._cardElement.style.opacity = opacity.toString();
    }
  }

  /**
   * Reset card visuals to original state
   */
  private _resetCardVisuals(): void {
    if (!this._cardElement) {
      return;
    }

    this._cardElement.style.transform = "";
    this._cardElement.style.opacity = "";
  }

  /**
   * Clean up swipe state and event listeners
   */
  private _cleanup(): void {
    // Remove document event listeners
    document.removeEventListener("mousemove", this._boundMouseMove);
    document.removeEventListener("mouseup", this._boundMouseUp);

    // Reset state
    this._isActive = false;
    this._startX = 0;
    this._startY = 0;
    this._currentX = 0;
    this._currentY = 0;
    this._cardElement = null;
    this._cardIndex = -1;
  }

  /**
   * Emit swipe event to all registered listeners
   */
  private _emitSwipeEvent(event: SwipeEvent): void {
    const handlers = this._eventListeners.get("swipe");
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(Object.freeze(event));
        } catch (error) {
          console.error("Error in swipe event handler:", error);
        }
      }
    }
  }
}