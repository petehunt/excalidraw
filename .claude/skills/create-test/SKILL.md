---
name: create-test
description: Create new Bang On It! test plan(s). Pass a description of what to test as $ARGUMENTS, or omit to auto-generate from git changes.
tools: Bash, Read, Write, Glob, Grep
---

# Create Test Plan

Create new Bang On It! test plan files.

**What to test:** $ARGUMENTS

## Instructions

### Step 0: Determine what to test

- If $ARGUMENTS is provided, use it as the description of what to test.
- If $ARGUMENTS is empty, auto-discover from git changes:
  1. Run `git log master..HEAD --oneline` and `git diff master...HEAD --stat` to see what changed on this branch.
  2. If no branch divergence, run `git diff HEAD --stat` and `git diff HEAD` for uncommitted changes.
  3. If still nothing, run `git log -1 --format="%H %s"` and `git show HEAD --stat` for the latest commit.
  4. Analyze the changes and create test plan(s) covering them. Bug fixes get regression tests, new features get acceptance tests.
  5. Skip changes that are already covered by existing test plans, pure refactors, docs, CI, or dependency updates.

### Step 1: Determine which directory the test belongs in
   - `testplans/smoke/` — Quick sanity checks (app loads, critical path works). Keep smoke tests minimal — they run on every commit so they must be fast. Only add here if it tests truly fundamental functionality. Prefer acceptance/ for most tests.
   - `testplans/acceptance/` — Core user journeys and happy paths. This is the default for most new tests.
   - `testplans/regression/` — Bug fixes and edge cases. Use when the description references a bug or issue.

2. Read existing test plans in that directory to understand conventions:
   ```bash
   ls testplans/smoke/ testplans/acceptance/ testplans/regression/
   ```

3. Read the codebase to understand what UI elements and flows are involved. Look at routes, components, and pages relevant to the test.

4. Create the test plan file:
   - Filename: kebab-case, e.g. `password-reset.md`
   - Use this format:

   ```markdown
   ---
   name: Descriptive test name
   retries: 1
   ---

   ## Steps
   1. Navigate to the relevant page
   2. Perform the action being tested
   3. Verify the expected outcome
   ```

5. Keep steps concise and actionable. Write from the user's perspective — describe what to click, type, and verify. Don't reference CSS selectors or implementation details.

6. Output the path to the created file.
