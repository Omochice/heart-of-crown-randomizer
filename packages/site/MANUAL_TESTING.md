# Manual Testing Guide - Randomizer Package Integration

This document provides manual testing steps to verify that the randomizer package integration works correctly and maintains the same user experience.

## Prerequisites

1. Start the development server:

   ```bash
   pnpm dev
   ```

2. Open your browser to `http://localhost:5173` (or the port shown in the terminal)

## Test Cases

### 1. Basic Card Selection

**Objective**: Verify that clicking "一般カードを引く" (Draw Common Cards) generates 10 random cards.

**Steps**:

1. Open the application
2. Ensure "10枚" (10 cards) is selected
3. Click "一般カードを引く" button
4. Verify 10 cards are displayed

**Expected Result**:

- Exactly 10 cards are shown
- Cards are from Basic and/or Far Eastern Border sets
- Cards are sorted by ID
- URL updates with `?card=X&card=Y...` parameters

### 2. 14-Card Selection

**Objective**: Verify that 14-card mode works correctly.

**Steps**:

1. Select "14枚" (14 cards) radio button
2. Click "一般カードを引く" button
3. Verify 14 cards are displayed

**Expected Result**:

- Exactly 14 cards are shown
- URL updates with 14 card parameters

### 3. Card Exclusion

**Objective**: Verify that excluded cards are not selected.

**Steps**:

1. Draw 10 cards
2. Swipe a card left or right to remove it
3. Click the "✕" button on the removed card in the excluded cards list
4. The card should reappear in the excluded list
5. Draw cards again
6. Verify the excluded card is not in the new selection

**Expected Result**:

- Excluded cards appear in "除外カードリスト" (Excluded Cards List)
- Excluded cards are not selected when drawing new cards
- Excluded cards persist after page reload (stored in localStorage)

### 4. Add Missing Cards

**Objective**: Verify that "一般カードを追加" (Add Common Cards) fills to the target count.

**Steps**:

1. Draw 10 cards
2. Remove 3 cards by swiping
3. Click "一般カードを追加" button
4. Verify 3 new cards are added

**Expected Result**:

- Cards are added to reach the target count (10 or 14)
- Added cards are different from existing cards and excluded cards
- Button shows correct number of cards to add: "一般カードを追加 (3)"

### 5. URL Restoration

**Objective**: Verify that sharing and restoring card selections via URL works.

**Steps**:

1. Draw 10 cards
2. Copy the "共有URL" (Share URL) shown at the bottom
3. Open a new browser tab
4. Paste the URL and navigate to it
5. Verify the exact same 10 cards are displayed

**Expected Result**:

- Same cards appear in the same order
- URL parameter format: `?card=1&card=2&card=3...`
- Browser back/forward buttons update the displayed cards (note: this is a known bug in tests but may work in browser)

### 6. Clear Excluded List

**Objective**: Verify clearing the excluded cards list.

**Steps**:

1. Add some cards to the excluded list
2. Click "リストをクリア" (Clear List) button
3. Verify the excluded list is empty
4. Reload the page
5. Verify the excluded list remains empty

**Expected Result**:

- All excluded cards are removed
- localStorage is cleared
- Excluded cards can be selected again

### 7. Share Functionality

**Objective**: Verify URL sharing works on mobile and desktop.

**Steps**:

1. Draw some cards
2. Click "URLをコピー" (Copy URL) button
3. On mobile: Verify native share sheet appears
4. On desktop: Verify URL is copied to clipboard
5. Paste the URL somewhere to confirm it was copied

**Expected Result**:

- Mobile: Native share dialog opens
- Desktop: URL is copied to clipboard
- Shared URL contains all card IDs

## Regression Checks

### Compare with Previous Version

If you have access to the previous version (before randomizer package integration):

1. Draw cards multiple times on both versions
2. Verify the card distribution feels similar (randomness)
3. Verify all UI interactions work the same way
4. Verify performance is similar (no noticeable slowdown)

## Known Issues

The following issues exist in the current test suite and may or may not affect manual testing:

1. **URL reactivity with browser back/forward**: Tests show that URL changes via browser back/forward don't update displayed cards (marked as "BUG" in tests). Manually verify if this works in the browser.

2. **Test environment**: Some tests fail with "document is not defined" - this is a test configuration issue, not a runtime bug.

## Performance Check

While using the application:

1. Card selection should feel instant (< 100ms)
2. No visible lag when clicking buttons
3. Smooth animations when swiping cards
4. Page loads quickly

## Success Criteria

All of the following must be true:

- ✅ Card selection works correctly (10 or 14 cards)
- ✅ Excluded cards are never selected
- ✅ URL restoration works perfectly
- ✅ Add missing cards fills to the correct count
- ✅ Sharing URLs works on mobile and desktop
- ✅ Excluded list persists across reloads
- ✅ All animations and interactions are smooth
- ✅ No console errors in browser DevTools

## Troubleshooting

If issues are found:

1. Check browser console for errors
2. Verify localStorage has `excludedCommons` key (if cards were excluded)
3. Check URL parameters are correctly formatted
4. Try in a different browser
5. Clear localStorage and try again
