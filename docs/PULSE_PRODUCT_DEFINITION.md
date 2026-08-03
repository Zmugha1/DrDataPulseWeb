# DR DATA PULSE: Product Definition and Positioning

Owner: Zubia Mughal, Ed.D. (Dr. Data)
Status: definition locked, build starting
Last updated: 2026-07-20

---

## What it is, in one sentence

A private decision-intelligence platform that captures every interaction with the people you meet and turns that accumulated history into strategy. The digital card is the front door. The accumulated decision engine is the product.

---

## What it is NOT

It is not "another digital business card." That market is saturated by funded competitors (V1CE, Popl, Wave, HiHello, Tapni, Mobilo, Linq). Leading with the card means competing on price and hardware, where there is no edge. The card is the wedge, not the pitch.

---

## The two genuine differentiators

Both are things every competitor lacks:

1. The accumulated-data decision engine. Competitors capture a contact and stop at "here is your lead, go follow up." They push data into Salesforce or HubSpot and end there. The frontier, which nobody owns, is accumulating every interaction over time and running AI over that history to decide what to do next. That is the product.

2. Privacy of the accumulated layer. Every competitor is cloud-first and CRM-sync-first by design, so the data lives in someone else's cloud. None are private or client-controlled. For confidentiality-bound buyers (attorneys, clinicians, therapists, contractors with hard-won pricing), that is a dealbreaker. Only Dr Data Pulse serves them honestly.

---

## Architecture: public in, private later

The privacy line is drawn precisely, so every claim stays honest.

Public layer (cloud, Supabase, automated). Everything public-facing or public-data:
- Digital vCard (save contact)
- Google review flow
- Book-a-meeting (Google Appointment Schedule)
- Contact enrichment (find more about who you just met)

All of this is public information or a public action. Nobody's privacy is at stake when a stranger scans a QR and saves a contact. Cloud is correct here, not a compromise.

Private layer (later). Once data accumulates in the database, the AI decision layer runs strategy over the history. This runs against a database the user controls. For most buyers that is a private Supabase project they own. For compliance-bound buyers, a local option (the existing Tauri + SQLite pattern) can serve those who cannot have data on AWS at all.

---

## Honest privacy claims (do not overreach)

- TRUE: "The public parts are automated and cloud-fast. The intelligence built from your accumulated data stays private and under your control."
- TRUE (accumulated layer): "Your own private database that you control, never shared, never sold, never used to train anyone's model. The AI strategy runs against your data alone."
- NOT TRUE for this product, do not claim: "Your data never leaves your building" / "air-gapded." Supabase is cloud (AWS). The air-gapped claim belongs only to the future local-first tier.

The buyer set (attorneys, clinicians) thinks about exactly this. A claim the architecture cannot back destroys credibility. Every clause above is defensible.

---

## Target market

Primary: the confidentiality-bound, referral-driven solo and small operators already in the Dr. Data catalog. Coaches, therapists, attorneys, clinics, contractors, consultants. People who live on relationships and cannot casually put client data in someone else's cloud.

Why this niche, not "any business": the card-alone-for-anyone market is a commodity fight against funded competitors where the two real advantages (decision engine, privacy) would be de-emphasized. The uniqueness lives in the niche. Broad reach can come later; own the niche first.

Two-tier future offering:
- Cloud-private (Supabase project the client owns) for most.
- Local-private (Tauri + SQLite) for the compliance-bound who cannot use AWS.

---

## Go-to-market

- Dogfood first. Dr. Data runs it on her own business. The live site and Pulse dashboard ARE the demo. Every sales conversation opens with "here is mine, running my actual business."
- Lead with the decision engine and the privacy of the accumulated layer, never with the card.
- The card + review + booking is the day-one wedge (instant value), which quietly accumulates the data that powers the decision engine (the moat).

---

## Data -> Decisions -> AI framing

- Data: capture every event in the public layer (card opened, vCard saved, form/booking submitted, meeting booked, business done, review requested, review left), each with source and card ID.
- Decisions: lead scoring, stage transitions (shared -> contacted -> booked -> done -> reviewed), the conversion rule (a booked meeting is the clean auto-tracked conversion; raw calls marked by hand), the trigger that fires the review ask only after "done," and source performance.
- AI (later, private): draft the follow-up on contact, draft the review reply, and a conversational dashboard over the accumulated lead and review data for private strategy building.

---

## Build order (one file, one commit each)

Foundation shared with the Pulse dashboard:
1. Supabase schema: extend leads, add an events table, add the stages above. RLS on. This is the public capture layer, designed so the private AI layer can read it later.
2. /card route + vCard (.vcf) function, reusing the existing brand system.
3. Booking-to-lead function using the Google Calendar scope and a scheduled function.
4. Review-request page + Google Business Profile responder function (Content Studio pattern).

Deferred for v1: Apple/Google Wallet passes (no cert, no APNs). Web card + QR only.

---

## Working rules for this build

One file per prompt, one fix per prompt, one commit per change. Diagnose before building. No code changes without explicit per-change approval. No push without "approve push." Specific git adds, never git add dot. npm run build with zero TypeScript errors before every commit. No em dashes.
