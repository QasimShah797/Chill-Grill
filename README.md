# Chill & Grill

Online ordering site and restaurant desk for Chill & Grill, Rawalpindi.

## Run

```bash
npm install
npm run dev
```

Open the site at the URL Vite prints (usually http://127.0.0.1:5173).

- Customer menu: `/`
- Admin login: `/admin/login`

Without Supabase, demo admin is `admin@chillandgrill.pk` / `ChillGrill#Admin` and demo staff is `staff@chillandgrill.pk` / `ChillGrill#Staff`. Staff can manage orders, customers, and product availability. Sales and settings stay with admin.

Menu prices come from the printed Chill & Grill menu. The cart stays in this browser. Orders, the menu, and admin login stay in the browser until Supabase is configured.

## Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings → API). Use the anon key only. Never put the service-role key in this app.
3. Open the SQL editor and run `supabase/schema.sql`.
4. Authentication → Users → Add user, and turn on Auto Confirm.
5. In the SQL editor, set that user as admin:

```sql
update public.profiles set role = 'ADMIN' where email = 'you@restaurant.com';
```

6. Restart `npm run dev`.

The first admin login publishes the printed menu. Guests can still order. Customers can also create an account at `/login` or continue with Google. Signed-in customers see their own orders. Staff and admin see live orders after login.

If you already ran the SQL, run `supabase/schema.sql` again so customer accounts are allowed.

### Google sign-in

1. In Google Cloud, create an OAuth client (Web) and add the Supabase callback URL shown under Authentication → Providers → Google.
2. In Supabase, enable the Google provider and paste the client ID and secret.
3. Authentication → URL configuration: set Site URL to your site (for local dev, `http://127.0.0.1:5173`) and add `http://127.0.0.1:5173/account` as a redirect URL.
4. New Google users are customers. Promote a restaurant owner with the `profiles` update above.
