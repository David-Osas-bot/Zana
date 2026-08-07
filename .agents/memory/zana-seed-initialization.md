---
name: Zana seed initialization
description: Concurrency constraint for the initial seeded workspace data.
---

The Zana API receives several independent first-load requests at once from the dashboard. Initial workspace setup must be single-flight or idempotent so concurrent requests cannot both attempt the first user insert.

**Why:** React Query loads the current user, overview, and project list in parallel; a naive “check then insert” initializer caused transient 500 responses on a cold start.

**How to apply:** Preserve the in-process initialization guard when changing seed data or adding first-load routes. If initialization moves to a separate process, replace it with a database-level idempotent transaction or unique-conflict-safe seed operation.