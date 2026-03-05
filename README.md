# PerfectModel

Community-driven ratings and reviews for AI language models. Think Letterboxd, but for LLMs.

---

## What This Is

PerfectModel lets users discover and evaluate AI models through structured community reviews. Every model is rated across 7 meaningful dimensions, tagged by use case, and organized into community lists.

**Core features built in this MVP:**

- Model profiles with aggregate dimension scorecards
- 7-dimension star reviews (Output Quality, Instruction Following, Consistency, Speed, Cost Efficiency, Personality/Tone, Use Case Fit)
- Use-case tagging (coding, writing, research, customer support, etc.)
- Community lists ("Best models for solo founders", etc.)
- User accounts and profile pages
- Version history tracking
- Automatic score aggregation via database triggers

---

## Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Framework | Next.js 14 (App Router)        |
| Database  | Supabase (PostgreSQL)          |
| Auth      | Supabase Auth                  |
| Styling   | Tailwind CSS                   |
| Language  | TypeScript                     |
| Hosting   | Vercel (recommended)           |

---

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/perfectmodel.git
cd perfectmodel
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the Supabase dashboard, open **SQL Editor**
3. Paste and run the entire contents of `supabase/schema.sql`
   - This creates all tables, policies, triggers, and seeds 7 initial models
4. Go to **Project Settings → API** and copy your keys

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
perfectmodel/
├── app/
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout + nav
│   ├── globals.css               # Tailwind + global styles
│   ├── models/
│   │   ├── page.tsx              # Model browser (search + filters)
│   │   └── [id]/page.tsx         # Model profile page
│   ├── reviews/
│   │   └── new/page.tsx          # Write a review
│   ├── lists/
│   │   ├── page.tsx              # Browse all lists
│   │   ├── new/page.tsx          # Create a list
│   │   └── [id]/page.tsx         # View a list
│   ├── profile/page.tsx          # User profile + review history
│   └── auth/
│       ├── login/page.tsx
│       ├── signup/page.tsx
│       └── callback/route.ts     # Supabase auth callback
├── components/
│   ├── Navigation.tsx            # Top nav bar
│   ├── ModelCard.tsx             # Model card (used in grids)
│   ├── DimensionScorecard.tsx    # 7-dimension bar chart
│   ├── ReviewCard.tsx            # Individual review display
│   └── StarRating.tsx            # Interactive star input
├── lib/
│   ├── types.ts                  # All TypeScript types
│   ├── supabase.ts               # Supabase client factories
│   ├── database.types.ts         # Generated DB types
│   └── utils.ts                  # Helper functions
└── supabase/
    └── schema.sql                # Full DB schema + seed data
```

---

## Database Schema Overview

| Table                  | Purpose                                        |
|------------------------|------------------------------------------------|
| `profiles`             | User profile (extends auth.users)              |
| `models`               | AI model catalog with aggregate scores         |
| `model_versions`       | Version history per model                      |
| `reviews`              | 7-dimension reviews with use-case tags         |
| `lists`                | User-curated model collections                 |
| `list_models`          | Many-to-many: lists ↔ models                  |
| `review_helpful_votes` | Thumbs-up voting on reviews                    |

Aggregate scores on `models` are automatically recalculated via PostgreSQL triggers whenever a review is inserted, updated, or deleted.

---

## Deploying to Vercel

1. Push your code to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add your environment variables in Vercel's project settings
4. Deploy — Vercel auto-detects Next.js

In Supabase, update **Authentication → URL Configuration**:
- Site URL: `https://yourdomain.vercel.app`
- Redirect URL: `https://yourdomain.vercel.app/auth/callback`

---

## Roadmap (Post-MVP)

- [ ] Helpful votes on reviews (UI connected to `review_helpful_votes`)
- [ ] Model comparison page (side-by-side 7-dimension radar chart)
- [ ] B2B vertical filtering (enterprise, marketing, legal use cases)
- [ ] Email notifications when followed users post reviews
- [ ] Version-aware reviews (flag if reviewing a deprecated model version)
- [ ] API for embedding model scores in third-party tools
- [ ] Admin panel for adding new models

---

## Contributing

PRs welcome. To add a new model, add a row to `supabase/schema.sql` seed section or insert directly in the Supabase dashboard.
