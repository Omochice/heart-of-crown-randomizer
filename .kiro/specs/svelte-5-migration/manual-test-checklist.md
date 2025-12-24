# Manual Testing Checklist for Task 2.9

## Build and Type Check Status ✅

- **Build Status**: ✅ SUCCESS (0 errors, 280ms build time)
- **Type Check**: ✅ SUCCESS (0 errors, 0 warnings)
- **svelte-check**: ✅ PASSED
- **Code Quality**: All Svelte 5 syntax validated

## Manual Browser Testing Checklist

### 1. Basic Page Rendering
- [ ] Open `http://localhost:5173` in browser
- [ ] Verify page title "ハートオブクラウンランダマイザー" displays
- [ ] Verify option settings section renders
- [ ] Verify radio buttons for 10/14 cards display

### 2. Card Randomization Function
- [ ] Click "一般カードを引く" button
- [ ] Verify cards are displayed in the results section
- [ ] Verify URL updates with `?card=X&card=Y...` parameters
- [ ] Verify share URL displays at bottom of results
- [ ] Verify cards are sorted by cost within each edition
- [ ] Verify basic cards and far eastern border cards display separately

### 3. Card Addition Function
- [ ] After drawing cards, remove some cards
- [ ] Click "一般カードを追加" button
- [ ] Verify missing cards are added up to the selected total (10 or 14)
- [ ] Verify button shows correct count: "一般カードを追加 (X)"
- [ ] Verify button is disabled when count is full

### 4. Excluded Cards List
- [ ] Verify excluded cards section displays "除外カードはありません" initially
- [ ] Add cards to excluded list (method TBD from Card component)
- [ ] Verify excluded cards appear in the list
- [ ] Click ✕ button on excluded card
- [ ] Verify card is removed from excluded list
- [ ] Click "リストをクリア" button
- [ ] Verify all excluded cards are removed

### 5. URL Sharing
- [ ] Click "URLをコピー" button
- [ ] Verify URL is copied to clipboard (or share dialog appears on mobile)
- [ ] Open copied URL in new browser tab
- [ ] Verify selected cards are restored from URL parameters

### 6. localStorage Persistence
- [ ] Add cards to excluded list
- [ ] Refresh the page (F5 or Cmd+R)
- [ ] Verify excluded cards are restored after page reload
- [ ] Verify localStorage contains "excludedCommons" key with JSON data

### 7. Reactive State (`$state()`)
- [ ] Change number of commons from 10 to 14
- [ ] Verify the display updates reactively
- [ ] Draw cards and verify `selectedCommons` updates in UI
- [ ] Verify "一般カードを追加" button count updates correctly

### 8. Derived Values (`$derived()`)
- [ ] Draw mixed cards (Basic and Far Eastern Border)
- [ ] Verify basic cards section displays only Basic edition cards
- [ ] Verify far eastern cards section displays only Far Eastern Border cards
- [ ] Verify cards within each section are sorted by cost

### 9. Effects (`$effect()`)
- [ ] Open page with URL parameters: `?card=1&card=2&card=3`
- [ ] Verify cards load on initial mount
- [ ] Verify share URL generates on mount
- [ ] Verify localStorage loads on mount

## Test Results Summary

| Category | Status | Notes |
|----------|--------|-------|
| Build | ✅ PASSED | 0 errors, clean build |
| Type Check | ✅ PASSED | 0 errors, 0 warnings |
| svelte-check | ✅ PASSED | Svelte 5 syntax validated |
| Manual Tests | ⏳ PENDING | Requires browser interaction |

## Known Limitations

- Development server cannot run in sandboxed environment due to port permissions
- Manual browser testing must be performed by user
- All automated checks (build, type, syntax) have passed successfully

## Automated Verification Completed

✅ All Svelte 5 migrations verified:
- `$state()` for reactive variables (numberOfCommons, selectedCommons, shareUrl, excludedCommons, swipeState)
- `$derived()` for computed values (basicCards, farEasternCards)
- `$effect()` for side effects (localStorage load, URL params load)
- Event attributes (onclick) instead of on: directives
- No legacy imports
- No run() functions
- TypeScript strict mode compliance
