# youreview

Personal Top 10 for movies, music, and books. Search → pick → rank → share.

## Environment

Public (client):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Server (never expose to browser):

- SUPABASE_SERVICE_ROLE_KEY
- TMDB_TOKEN
- YOUTUBE_API_KEY
- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET
- NAVER_ID
- NAVER_SECRET
- GOOGLE_BOOKS_KEY
- (optional) NEXT_PUBLIC_BASE_URL

## Database migration

Apply in order (SQL editor or CLI):

- `sql/migrations/20250810_youreview_fix.sql`
- `sql/migrations/20250810_b_category_top10.sql`
- `sql/migrations/20250810_reorder_deferrable.sql`
- `sql/migrations/20250810_profile_policy.sql`
- `sql/migrations/20250810_step2_rpc.sql` ← adds `get_or_create_top10_list`, list-based `reorder_top10`, and DEFERRABLE `(list_id, rank)`

After applying migrations via Supabase, reload PostgREST schema:

```sql
select pg_notify('pgrst','reload schema');
```

## Development

Install deps and run:

```bash
npm i
npm run dev
```

ㅞ
Build:

```bash
npm run build
```

## Notes

- All write/update operations to Supabase are executed on the server using `SUPABASE_SERVICE_ROLE_KEY` via `src/lib/supabase/serverAdmin.ts`.
- Client side uses anon key only for reads.
- Reordering is list-centered via RPC `reorder_top10(list_id, ids[], ranks[])`.

## Self-review

- Verified search proxies and providers map to `UnifiedResult` consistently
- Ensured server-side writes use service role client and server runtime
- Added migration for indexes/unique/trigger/RLS and reorder RPC
- Category filtering uses media join (A plan)
  This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
