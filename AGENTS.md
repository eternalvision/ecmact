# ECMact

Handoff and state: `docs/handoff.md` · plans: `docs/plans/` · conventions: `CONTRIBUTING.md`

Tracker: GitHub Issues of `eternalvision/ecmact`. Branches: `feature/<issue number>-<slug>` from `main`.

## Autonomy (owner decision 2026-11-13)

This project is an explicit exception to the global rules "commit and push only when the owner asks" and "stop at the end of every phase":

- When a phase ends, write the handoff, commit, push, and start the next phase in a new session without asking.
- Decide every question yourself except the critical ones: a breaking change of the 3.x API, a tag or npm publish, a new runtime dependency, deleting data.
- Commits stay one-line Conventional Commits with no attribution. Tags still need the owner's explicit request (see Boundaries).

## Gate before a commit

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

When a file under `packages/create-ecmact/template` changes, also `npm run build:all && npm run test:template`.

## Boundaries (never cross)

- The API of 3.x is stable: nothing documented is removed or changes its behaviour within 3.x. A breaking change needs the owner's decision and a new major version.
- A tag `v*` or `create-ecmact-v*` publishes to npm. Never create or push a tag without the owner's explicit request.
- No runtime dependencies in the library.
- Local tests run on Node 22, as CI does. On Node 26 six tests of `create-ecmact` fail for a reason that is not in the code.

## Conventions

- Imports only through the aliases (`@em/...`, `@site/...`, `@tests/...`, `ecmact`), never relative.
- Every function, interface and interface member in `src` has a JSDoc block; tests are exempt.
- Every `src/**/x.ts` has `tests/**/x.test.ts`; coverage is 100% in the library and in the site.
- Named arrow function exports, no default exports.
- The site documentation exists in English and Russian, string for string: a change in `packages/site/src/content/docs/x.ts` needs the same change in `ru/x.ts`.
- A measured number in the documentation comes from `npm run size` or `npm run bench` and says where it was measured.
