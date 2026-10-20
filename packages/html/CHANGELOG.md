# @m2d/html

## 1.1.11

### Patch Changes

- 32cb0bd: Prevent hard failure when parsing content with invalid html tags

## 1.1.10

### Patch Changes

- 08eefc3: fix text alignment

## 1.1.9

### Patch Changes

- 518385c: Fix: fix an edge case where build might fail if the mermaid or similar plugin comes before htmlPlugin

## 1.1.8

### Patch Changes

- 4a811aa: Fix HTML parsing issues in case of empty tags.

## 1.1.7

### Patch Changes

- dcd39bd: fix: td or th tags should be lowercase

## 1.1.6

### Patch Changes

- 30ad346: Fix tags

## 1.1.5

### Patch Changes

- f6be10c: fix: INPUT element style parsing

## 1.1.4

### Patch Changes

- bfbe9e0: fix: Extract styles in createFragmentWithParentNodes as well to avoid misleading data.

## 1.1.3

### Patch Changes

- bb24517: fix: Improve HTML Input element handling
- 735f6d1: Update types

## 1.1.2

### Patch Changes

- 24e6e16: fix advanced table handling

## 1.1.1

### Patch Changes

- 54e4c92: fix: empty HTML table cells

## 1.1.0

### Minor Changes

- b656cd7: Support block node inside table cells. Add tag to data for easy JSX creation

## 1.0.3

### Patch Changes

- 951e9a8: chore: update core package

## 1.0.2

### Patch Changes

- 97bb9d1: Upgrade core package to v1

## 1.0.1

### Patch Changes

- 114454a: fix: Fix inline tag extraction logic
- 2cc7d49: fix: Improve inline tag list. 2. Remove extra spacings.
- 5964742: Fix: fix form styles
- 0d71109: fix: Fix nested inline html tags
- 06a4f14: Fix: handle block and inline nodes in preprocess.

## 1.0.0

### Major Changes

- 8d05567: Export svg node in place of image node. The raw svg will be processed by the imagePlugin.

### Patch Changes

- 6dff43a: Update dependencies

## 0.0.4

### Patch Changes

- 0fa47b9: remove extra console.log and add unit test to assert no residual console.log
