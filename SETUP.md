# Mila Collections — Setup Guide

This is a Next.js store with Supabase (database, auth, storage) and Paystack (payments).
Follow these steps in order and you'll have it live.

## 1. Install and run locally

```bash
npm install
npm run dev
```

It will build fine, but the site won't work properly until you connect a real
Supabase project and Paystack account below — right now `.env.local` doesn't exist yet.

## 2. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick a region close to
   Nigeria (e.g. Frankfurt or London) for the best speed.
2. Once it's created, open **SQL Editor** → **New query**, paste the entire contents of
   `supabase/schema.sql`, and click **Run**. This creates every table, security rule and
   storage bucket the site needs. It's safe to run more than once.
3. (Optional) Do the same with `supabase/seed.sql` to add 5 starter categories you can
   rename or delete later from the admin panel.
4. Go to **Authentication → Sign In / Providers**:
   - **Email**: already on by default.
   - **Google**: turn it on, follow Supabase's instructions to create a Google OAuth
     client, and paste the Client ID/Secret in. Set the authorized redirect URI Google
     asks for to `https://YOUR-PROJECT.supabase.co/auth/v1/callback`.
5. Go to **Authentication → URL Configuration** and set:
   - **Site URL**: your real domain once you have one (or `http://localhost:3000` for now)
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and, once deployed,
     `https://yourdomain.com/auth/callback`

## 3. Get your Supabase API keys

In your Supabase project → **Settings → API**, you'll need three values:
- **Project URL**
- **anon public** key
- **service_role** key (click "Reveal" — keep this one secret, never put it in
  anything that reaches the browser)

## 4. Create your Paystack account

1. Sign up at [paystack.com](https://paystack.com) and complete business verification
   (you'll need this before you can accept real payments, but test mode works immediately).
2. Go to **Settings → API Keys & Webhooks**. Copy the **Secret Key** (starts with `sk_test_`
   while testing, `sk_live_` once verified).
3. On the same page, add a webhook URL: `https://yourdomain.com/api/paystack/webhook`
   (you can only fill this in once you've deployed — see step 7).

## 5. Fill in your environment file

Copy the example file and fill in the real values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxx
```

Restart `npm run dev` after saving this file.

## 6. Make yourself (or your client) an admin

1. On your running site, sign up for a normal account with the email you want to
   be the admin.
2. In Supabase → **SQL Editor**, run:

```sql
update public.profiles set role = 'admin' where email = 'the-email-you-signed-up-with@example.com';
```

3. Sign out and back in (or just refresh) — you'll now see an **Admin panel** button
   on your account page, and `/admin` will work.

You can promote more people (like your client) the same way, any time.

## 7. Deploy (Vercel is easiest)

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. In **Environment Variables**, add the same five values from `.env.local` above,
   but set `NEXT_PUBLIC_SITE_URL` to your real domain (e.g. `https://milacollections.com`).
4. Deploy.
5. Back in Supabase → **Authentication → URL Configuration**, add your real domain's
   `/auth/callback` URL to the redirect list.
6. Back in Paystack → **Webhooks**, set the webhook URL to
   `https://yourdomain.com/api/paystack/webhook`.
7. Buy your domain and point it at Vercel (Vercel's dashboard walks you through the
   DNS records — usually just one A record and one CNAME).

## 8. Go live with real payments

While `PAYSTACK_SECRET_KEY` starts with `sk_test_`, all payments are fake test
transactions (use card `4084 0840 8408 4081`, any future date, any CVV, OTP `123456`
to test). Once Paystack finishes verifying the business, switch to the `sk_live_` key
in your environment variables and redeploy — real payments start working immediately.

## Day-to-day: using the admin panel

- **Add a category** first (Admin → Categories), e.g. "Chains", "Pendants".
- **Add products** (Admin → Products → Add product): photos, price, description,
  and turn on "Customer uploads their own photos" for anything like a photo pendant.
- **Orders** come in automatically once paid. Tap one to see the customer's uploaded
  photos, download them, and move the order through Received → Preparing → Shipped →
  Delivered.
- **Settings** controls the home page background photo, delivery fee, free-delivery
  threshold, and your WhatsApp/phone/email/social links shown across the site.
- **Messages** holds everything sent through the Contact page.

## Notes

- Delivery is one flat fee you set in Settings, with an optional free-delivery
  threshold — there's no per-state delivery pricing.
- Customer-uploaded photos are private: only the customer and admins can view them
  (enforced at the database level, not just hidden in the UI).
- If anything looks broken after you change data directly in Supabase's table editor,
  it's usually a cache — the storefront refreshes automatically within 2 minutes, or
  instantly whenever you save something from the admin panel.


## Address book (added in the redesign)

Customers can now save delivery addresses. If your Supabase project already exists,
run `supabase/002_addresses.sql` once in the SQL editor. Fresh installs get it from `schema.sql`.

## Pages

Home, Shop (categories are tabs inside it), About us, Contact us, and Account (orders, addresses, details).
Old links such as /category/..., /custom-orders, /cart, /faq redirect automatically (see `next.config.ts`).

## Home page photo

Admin, then Settings, then "Home page background photo". Use a wide landscape image (1600 px or more).
Until one is uploaded the hero shows a gold diamond drawing.
