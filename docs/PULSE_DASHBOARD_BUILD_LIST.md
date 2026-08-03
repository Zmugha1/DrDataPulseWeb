# BUILD LIST: Dr. Data Pulse (Lead Intelligence Dashboard)

Owner: Zubia Mughal, Ed.D. (Dr. Data)
Repo: Zmugha1/drdatadecisionintelligence
Companion to: BUILD_PLAN.md (site funnel). This file covers the self-facing dashboard only.
Model: cloud (Supabase + Netlify functions + Anthropic API), AgentPulse pattern, extended for a networking-driven B2B consultant.
Last updated: 2026-06-30

---

## Legend

- [ ] not started
- [~] in progress
- [x] done
- BLOCKED: waiting on a prerequisite
- READY: buildable once its phase is reached
- CORE: proven from the AgentPulse (Jason) build
- EDGE: capability AgentPulse never had, your differentiator

---

## Working rules (every build session honors these)

1. One file per prompt, one fix per prompt, one commit per change.
2. Diagnose before building, test before shipping, document before closing.
3. Never modify code without explicit per-change authorization.
4. Flag scope expansion rather than building it silently.
5. Session start confirms working dir, branch, last stable commit. Session end updates the five capture files.
6. Every completed change ends with exact git commands and a reported hash. No hash means nothing was done.
7. No em dashes anywhere.

Deploy loop: edits applied in repo, you commit and push, Netlify rebuilds. Nothing ships until you push.

---

## Prerequisites (you create, they hold secrets I cannot generate)

- [ ] Supabase project (free tier). Capture Project URL, anon public key (safe to share), service role key (Netlify env only). Blocks all data phases.
- [ ] Anthropic API key (Netlify env only). Blocks the drafting phase (D5).
- [ ] GA4 Measurement ID (G-XXXXXXXXXX). Blocks the traffic intel item (D6).
- [ ] Scheduler live (decided: cloud). One real event link. Blocks the booking-to-lead item (D1).

Cloud is confirmed as the architecture. This is your own marketing data, not client-confidential data, so cloud does not conflict with the air-gapped client promise.

---

## D0: Foundation

- [ ] BLOCKED Diagnostic first. Read-only inventory of the existing `dashboard-react/` app and `Pulse.tsx` demo page. Confirm what scaffolding, routing, and styling already exist so we extend rather than rebuild. Ends in "Report only."
- [ ] BLOCKED Supabase `leads` table schema (SQL). Fields: id, name, email, phone, message, source, room, zip, vertical, stage, score, created_at, updated_at. Row-level security on.
- [ ] BLOCKED Supabase auth, single user (you).
- [ ] BLOCKED Dashboard shell: gated route or dedicated app entry, reading from `leads`. Design reuses your existing brand system, no new look.

---

## D1: Capture unification (data in)

The funnel's Phase 2 and this phase share the capture endpoint. Build once, both use it.

- [ ] BLOCKED CORE Capture endpoint (Netlify function) writing to `leads`, stamping source, room, zip.
- [ ] BLOCKED CORE Swap site forms (lead modal, STZ assessment, survey) to the endpoint.
- [ ] BLOCKED CORE Scheduler webhook: booked calls auto-create leads.
- [ ] BLOCKED EDGE Import BNI Google Sheet submissions into `leads`.
- [ ] BLOCKED EDGE Import Referral IQ contacts (81) into `leads`.
- [ ] BLOCKED EDGE Manual quick-add, phone-friendly, for someone met in a room.

---

## D2: Core triage view (the dashboard proper)

- [ ] BLOCKED CORE Lead list/table with pipeline stages in your language (discovery, proposal, build, retainer).
- [ ] BLOCKED CORE Hot / warm / cold / missed buckets.
- [ ] BLOCKED CORE Stale-lead flags so no warm contact goes dark.
- [ ] BLOCKED CORE One-click actions: called, emailed, met, proposal sent, not a fit.
- [ ] BLOCKED CORE Lead detail card with editable notes and history.

---

## D3: Scoring (your biggest differentiator)

- [ ] BLOCKED EDGE STZ readiness score 1 to 10 on every lead, run through your framework.
- [ ] BLOCKED EDGE Market / ZIP priority score (the tiering approach from the Marcos plan, applied to your verticals).
- [ ] BLOCKED EDGE Fit flags: vertical, regulated-data signal, air-gapped fit.
- [ ] BLOCKED EDGE Deal-size estimate mapped to your tiers (Spark, Pulse, Vault, Scale).

---

## D4: Room intelligence (nothing in AgentPulse does this)

- [ ] BLOCKED EDGE Referral attribution: which room member sent each lead.
- [ ] BLOCKED EDGE Per-room pipeline: BNI vs MBA vs Referral IQ side by side.
- [ ] BLOCKED EDGE Champion tracking: top referrers, and who is going quiet.
- [ ] BLOCKED EDGE One-on-one prep: a contact's history and referral map before a meeting.

---

## D5: Outreach and drafting (BLOCKED on Anthropic key)

- [ ] BLOCKED CORE Follow-up email, SMS, and call-prep drafts in your voice.
- [ ] BLOCKED EDGE Proposal or next-step draft tied to the lead's tier and vertical.
- [ ] BLOCKED EDGE Post-room follow-up: draft notes to everyone met at a given event.

---

## D6: Brief and reporting

- [ ] BLOCKED CORE Morning Brief: today's priority leads and actions.
- [ ] BLOCKED CORE Traffic and source intel (needs GA4 on the site).
- [ ] BLOCKED EDGE Conversion by source and by room: which room and which content produces clients.
- [ ] BLOCKED CORE Weekly digest email to yourself.

---

## D7: Follow-up cadence and enrichment

- [ ] BLOCKED Reminder cadence per lead so nothing slips.
- [ ] BLOCKED "Owe them something" queue: promised intros, docs, quotes.
- [ ] BLOCKED EDGE Referral loop-back: prompt to thank and update whoever referred a lead.
- [ ] BLOCKED CORE Find-more-about-lead enrichment: web and contact lookup.

---

## Recommended v1 slice

Do not build all of this. The smallest v1 that is already more powerful than Jason's and demos in any room:

1. One lead store (D0 + D1 capture endpoint + site form swap).
2. STZ score 1 to 10 (D3).
3. Hot / warm / cold triage with stages (D2).
4. Referral attribution (D4).
5. Per-room view (D4).
6. Morning Brief (D6).

Everything else is v2 and beyond, added one file at a time after v1 proves out.

---

## Critical path

Prerequisites (you create Supabase) unblock D0.
D0 unblocks D1. D1 (data flowing in) unblocks D2, D3, D4.
D5 also needs the Anthropic key. D6 traffic item also needs GA4.

Nothing in this file starts until Supabase exists and the site funnel (BUILD_PLAN.md Phase 1) is complete. Current active work is site routing, not this.

Next action when we reach it: create the Supabase project, then run the D0 read-only diagnostic on the existing dashboard-react app.
