# Legacy InventoryOS folders

The original **InventoryOS** prototype used a Vite React client and a standalone Express server:

| Folder | Stack | Status |
|--------|-------|--------|
| `client/` | Vite + React Router | **Deprecated** — use `apps/frontend` |
| `server/` | Express (duplicate of migrated API) | **Deprecated** — use `apps/backend` |

All active development happens under `apps/frontend` and `apps/backend`.

You may delete `client/` and `server/` once you no longer need reference code from the old UI.
