# Copilot Instructions

## Keeping the project spec up to date

`PROJECT_SPEC.md` is the single source of truth for this project's architecture, data structures, components, and test suite.

**After every change that modifies any of the following, update `PROJECT_SPEC.md` before finishing:**

- File structure (new or removed files)
- TypeScript interfaces or union types (`Consonant`, `TonalRule`, `FlashcardItem`, etc.)
- Data arrays (`CONSONANTS`, `TONAL_RULES`, or any new deck)
- Component hierarchy or props (`App`, `FlashcardDeck`, `Card`, or any new component)
- State variables or derived values
- UI screens, buttons, or navigation flow
- Test groups, test counts, or test assertions
- New design decisions worth documenting

Keep the spec accurate and self-contained — a developer reading only `PROJECT_SPEC.md` should be able to understand the entire codebase.

---

## Running tests after every change

**After every code change, run the full CI suite before finishing:**

```bash
npm run ci
```

This runs `tsc --noEmit` (type check) followed by the Vitest test suite. Both must pass before the task is considered complete.

- If the type check fails, fix the type errors before finishing.
- If any test fails, fix it as part of the same task — do not leave the suite in a failing state.
- **Any change to logic, data, or behaviour must include corresponding test additions or updates.** Do not ship logic changes without test coverage.
- If new behaviour is added, add tests for it. If existing behaviour changes, update the tests that cover it. If behaviour is removed, delete the tests for it.
