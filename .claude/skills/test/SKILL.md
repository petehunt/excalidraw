---
name: test
description: Run Bang On It! E2E tests locally. Pass test plan files or a filter as $ARGUMENTS (e.g. "testplans/smoke/" or "-t login"). With no arguments, runs all test plans.
tools: Bash, Read
---

# Run E2E Tests

Run Bang On It! end-to-end tests locally.

**Arguments:** $ARGUMENTS

## Instructions

1. If $ARGUMENTS is empty, run all test plans:
   ```bash
   boi run --record
   ```

2. If $ARGUMENTS contains file paths or directories, run those:
   ```bash
   boi run $ARGUMENTS --record
   ```

3. If $ARGUMENTS contains a filter (e.g. "login", "checkout"), run with filter:
   ```bash
   boi run -t $ARGUMENTS --record
   ```

4. Wait for tests to complete. Report results and recording paths.

5. If tests fail, read the test plan file and the output to diagnose the failure. Suggest whether the test plan needs updating or there's a real bug.
