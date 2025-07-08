import { vi } from 'vitest';

// Mock card data that will be available to all tests
export const mockBasicCards = [
  { id: 1, name: "Card 1", cost: 2, edition: 0, type: "common", mainType: ["action"], hasChild: false, linkLevel: 0, effects: [], linkCards: [] },
  { id: 2, name: "Card 2", cost: 3, edition: 0, type: "common", mainType: ["action"], hasChild: false, linkLevel: 0, effects: [], linkCards: [] },
  { id: 3, name: "Card 3", cost: 4, edition: 0, type: "common", mainType: ["action"], hasChild: false, linkLevel: 0, effects: [], linkCards: [] },
  { id: 4, name: "Card 4", cost: 5, edition: 0, type: "common", mainType: ["action"], hasChild: false, linkLevel: 0, effects: [], linkCards: [] },
  { id: 5, name: "Card 5", cost: 6, edition: 0, type: "common", mainType: ["action"], hasChild: false, linkLevel: 0, effects: [], linkCards: [] },
];

export const mockFarEasternCards = [
  { id: 6, name: "Card 6", cost: 2, edition: 1, type: "common", mainType: ["action"], hasChild: false, linkLevel: 0, effects: [], linkCards: [] },
  { id: 7, name: "Card 7", cost: 3, edition: 1, type: "common", mainType: ["action"], hasChild: false, linkLevel: 0, effects: [], linkCards: [] },
  { id: 8, name: "Card 8", cost: 4, edition: 1, type: "common", mainType: ["action"], hasChild: false, linkLevel: 0, effects: [], linkCards: [] },
];

// Global mock for the card module
vi.mock("@heart-of-crown-randomizer/card", () => ({
  Basic: { commons: mockBasicCards },
  FarEasternBorder: { commons: mockFarEasternCards },
}));