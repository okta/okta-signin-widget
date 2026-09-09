# Sign-in Widget PR Risk Guide

This file mirrors the **Sign-in Widget** rows of the CATS/AMP-DIA risk matrix so that PR reviewers and CodeRabbit have a shared, versioned rubric alongside the code. It is a **review-time cache**, not a source of truth.

**Source of truth:** [Risk Assessment Level for AMP - DIA Group](https://oktainc.atlassian.net/wiki/spaces/eng/pages/725257989/Risk+Assessment+Level+for+AMP+-+DIA+Group) (Confluence page 725257989). If this file and Confluence disagree, Confluence wins — please update this file to match.

Only the **Sign-in Widget** matrix is reproduced below. The Okta Verify / Monolith / Frontend matrices on the same Confluence page do not apply to this repo.

---

## Very High / Extreme

**Approvals: 3 (TL + SME + QA)**  ·  **Automatic DDRR, custom test plan and release plan required**

| Details / Examples | Actions |
|---|---|
| Changes to [okta/cloud-configuration](https://github.com/atko-eng/cloud-configuration), especially base properties files. CCS property updates via Cavok. Changes in the widget that tightly depend on monolith changes and break backward compatibility such that either side cannot be rolled back without breaking the login flow. | Isolate very-high-risk changes in their own PR/release. Consider a "double release" to isolate the risky diff. Require Architect review. Automatic DDRR — must attend the release review meeting. Ensure a passing monolith downstream build before merging. Must have a custom test plan and release plan. |

---

## High

**Approvals: 3 (TL + SME + QA)**  ·  **DDN ticket required, monitoring plan required**

| Details / Examples | Actions |
|---|---|
| Code paths in known automated-testing gaps (WebAuthn, Okta Verify, FastPass, Office 365). Changes to major dependencies such as Courage or jQuery. Any version change to auth-flow libraries (e.g. `@okta/okta-auth-js`). Breaking changes: default-value changes, removal of config options, removed / breaking-signature public methods, `engines` bumps. Changes that may break embedded / legacy browsers: polyfill changes, any change to `**/package.json` dependencies, any change to `yarn.lock` resolutions. Major refactors of AuthJS / Courage / jQuery integration. Fixes for critical security vulnerabilities in a production dependency. Removals from `.bacon.yml`, `okta-core/../loginpage_backbone.jsp`, `okta-core/../loginpage_cdn.jsp`. | Isolate high-risk changes in their own PR. Consider a "double release." Breaking changes only in major-version releases and planned well in advance. Polyfill changes require extra QA against embedded browsers and post-release monitoring. Ensure a passing monolith downstream build. Follow the review checklist. Must attend Release Review; consider DDRR. Consider a custom test plan. |

---

## Medium

**Approvals: 2 (SME)**

| Details / Examples | Actions |
|---|---|
| Changes that modify or could modify package output: anything under `src/`, `assets/`, `packages/`, build scripts and config (rollup, webpack, grunt), `.gitattributes`, `.gitignore`, `.npmignore`. Any change to `package.json` that could modify package output — `dependencies` / `devDependencies` updates (for packages that affect auth flow, escalate to High), build/publish `scripts`, `exports`. TypeScript changes. Fixes for security vulnerabilities in a dev dependency. l10n / i18n changes. CSP fixes. | Ensure a passing monolith downstream build before merging. Follow the review checklist. Ensure PR is based on the right branch. Warn if new translations are added (english-leak risk) — not a blocker if behind a feature flag or if it is a proactive incremental change. Consider DDRR. |

---

## Low

**Approvals: 1 (SME)**

| Details / Examples | Actions |
|---|---|
| Tools / config that do not affect package output but may affect CI runs: `playground/**`, `.eslintrc.js`, additions to `.bacon.yml`, `.widgetrc.sample.js` (affects TestCafe). Test changes that do not modify the functional spec (refactors, fixes). Changes to `package.json` that do not affect package output. | Fix forward in affected branches. Publish is not necessary — these changes do not affect package output. Watch for flaky tests, false positives, and missing/inconsistent enforcement of quality checks. |

---

## Very Low

**Approvals: 1 (SME)**  ·  **Doc-quality review only**

| Details / Examples | Actions |
|---|---|
| README / doc updates. Tools / config used only in local development that do **not** affect package output (NPM bundle) and are **not** used in CI, such as `.vscode/**`, and files listed in `.npmignore`. (Changes to `.npmignore` itself are High risk.) | Fix forward in affected branches. Publish is not necessary. Watch for typos, language guidelines, accurate descriptions of product behavior. |

---

## How reviewers should use this file

- Every CodeRabbit comment on this repo is tagged with an `SIW Risk: <tier>` line drawn from the tiers above. If a comment's tier looks wrong, treat that as a signal to double-check both the diff and this file — either the diff is riskier than it looks, or this file is stale relative to Confluence.
- The tier drives the **process** obligations (approvals, DDN, DDRR, custom test plan). It does not by itself decide code correctness.
- When in doubt, escalate one tier up. It is cheaper to over-review than to hotfix.
