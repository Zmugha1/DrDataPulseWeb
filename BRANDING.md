# Dr. Data Decision Intelligence — Brand & Design System

**Reference this file for all site styling, new pages, and components to maintain visual integrity.**

---

## Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| **Warm cream** | `#F5EDD8` | Page background, light sections |
| **Primary teal** | `#2DD4BF` | Headings, accents, icons, section labels, links |
| **Coral CTA** | `#F87171` | Primary buttons, featured accents |
| **Dark navy** | `#1E2A3A` | Dark sections, footer, governance cards |
| **White** | `#FFFFFF` | Cards, content surfaces |
| **Muted gray** | `#6B7280` | Secondary text, muted cards |

### Usage Rules

- **Backgrounds:** Cream for light sections, navy for dark sections, white for cards
- **Headings:** Teal or navy (depending on section background)
- **Primary CTA:** Coral button
- **Secondary CTA:** Outlined white on dark sections
- **Accents:** Teal for positive/featured, coral for alerts or alternate emphasis

---

## Typography

### Font Stack

```
font-family: 'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

- **Display/headings:** Space Grotesk (400, 500, 600, 700)
- **Body:** Inter (400, 500, 600, 700)

### Weights

- 400: Body copy
- 500: Emphasized body
- 600: Subheadings, labels, small caps
- 700: Headlines, CTAs

### Section Labels

- Small caps, teal, letter-spacing
- Example: "WHAT CHANGES", "THE FRAMEWORK", "THE WORKSHOP SERIES"

---

## Components

### Cards

- White background
- Rounded corners (12px–16px)
- Soft shadow: `0 4px 20px rgba(0,0,0,0.08)` or similar
- Optional left border accent: teal or coral (4px solid)

### Buttons

- **Primary (.btn-primary):** Coral background, white text, rounded
- **Secondary (.btn-secondary):** Outlined white on dark, or outlined teal on light

### Dark Sections

- Background: `#1E2A3A`
- Text: White
- Accents: Teal

---

## Assets

| Asset | Path | Usage |
|-------|------|-------|
| Dr. Data mascot | `/mascot-hero.png` | Hero sections, branding |
| Favicon | `/favicon.png`, `/favicon-16x16.png`, `/favicon-48x48.png` | Browser tab |
| Service icons | `/service-icons.png` | Services section |

---

## Content Guidelines

- **No em dashes** — Use commas or short sentences instead
- **No QR codes** on any page
- **No pricing** on workshop or landing pages unless explicitly required
- **No session timing or duration** on workshop pages unless explicitly required

---

## Contact (Canonical)

- **Email:** zubiamL4L@gmail.com
- **Phone:** 414-544-7777
- **Website:** drdatadecisionintelligence.com
- **Location:** Milwaukee, WI
- **Legal:** Dr. Data Decision Intelligence LLC

---

## CTA Links (Single Source of Truth)

All "Book a Discovery Call" / "BOOK A DISCOVERY CALL" buttons must use:

- **Discovery call (primary CTA):** `https://calendly.com/zubiaml4l/15min`
- **Phone:** `tel:+14145447777`
- **Email (contact only, not for booking):** `mailto:zubiamL4L@gmail.com`
- **Homepage:** `https://drdatadecisionintelligence.com`

---

## Implementation Notes

- Reuse existing CSS variables and utility classes from the site stylesheet
- Do not introduce new fonts or color values not in this document
- Mobile-first: all sections stack cleanly at 375px viewport
- New pages should feel like they belong on drdatadecisionintelligence.com, not like a separate product
