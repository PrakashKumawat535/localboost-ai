# LocalBoost AI

LocalBoost AI is a Vite + React application for generating marketing posters, captions, and hashtags for local businesses. It uses Supabase for authentication and data storage, Google Gemini for AI generation, and Cloudinary for image/logo uploads.

## Features

- AI-assisted poster, caption, and hashtag generation
- Image upload, crop, edit, and export flow
- Supabase Auth for user accounts
- Saved generation history
- Responsive UI for desktop and mobile
- Template library for fast content creation

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase
- Google Gemini API
- Motion
- Lucide React

## Requirements

- Node.js 18 or later
- npm
- Supabase project
- Google Gemini API key
- Cloudinary account with an unsigned upload preset

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env.local
```

3. Add your keys to `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_KEY=your_paid_ai_api_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

4. Apply the database schema from [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL editor, then enable RLS policies for the created tables.

Uploads do not require a separate `/api/upload` backend anymore. The app uploads images and logos directly to Cloudinary using the env vars above.

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Preview Build

```bash
npm run preview
```

## Deploy to Vercel

1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Add the required environment variables in Vercel.
4. Deploy the app.

For SPA routing, Vercel should serve `index.html` for client-side routes.

## Project Structure

```text
src/
  components/
  contexts/
  lib/
  pages/
  services/
  constants/
  types.ts
  App.tsx
  main.tsx
  index.css
supabase/
  schema.sql
```

## Notes

- History and onboarding features depend on the Supabase tables defined in `supabase/schema.sql`.
- If you only want to run the UI locally, you still need the required environment variables.
- The app is designed to build cleanly with `npm run build` before deployment.
