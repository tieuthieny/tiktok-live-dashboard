# TikTok Live Dashboard

A real-time comment filtering dashboard for TikTok livestreams built with Next.js, React, Tailwind CSS, and Supabase.

## Features

✨ **Dark Mode UI** - Eye-friendly dark interface designed for extended viewing
📱 **Responsive Layout** - 30/70 split layout with live video on left, comments on right
🔄 **Real-time Updates** - Instant comment updates using Supabase real-time subscriptions
✅ **Smart Highlighting** - New comments highlighted with gradient borders and animations
💬 **Comment Display** - Large, clear text optimized for reading from a distance
🎨 **Modern Design** - Glassmorphism effects with smooth transitions

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Create a table named `tiktok_events` with the following schema:
   ```
   - id: uuid (primary key)
   - event_type: text (e.g., 'comment', 'like', etc.)
   - data: jsonb (contains {nickname, comment, ...})
   - created_at: timestamp (default: now())
   ```

3. Copy your Supabase credentials from project settings

4. Create a `.env.local` file based on `.env.local.example`:
   ```bash
   cp .env.local.example .env.local
   ```

5. Fill in your Supabase URL and anon key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Database Schema

Create the `tiktok_events` table in Supabase:

```sql
CREATE TABLE tiktok_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_event_type ON tiktok_events(event_type);
CREATE INDEX idx_created_at ON tiktok_events(created_at DESC);
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Format

When inserting comments into the database, use this JSON structure:

```json
{
  "event_type": "comment",
  "data": {
    "nickname": "Streamer Name",
    "comment": "Amazing stream! 🔥"
  }
}
```

## How It Works

1. **Initial Load**: Fetches the 50 most recent comments from the database
2. **Real-time Sync**: Listens for new comment INSERT events on the `tiktok_events` table
3. **Highlight Effect**: New comments show with a pink gradient border and scale animation for 3 seconds
4. **Auto-cleanup**: Highlights automatically fade after 3 seconds for cleaner UI

## Layout

- **Left Column (30%)**: TikTok livestream embed from `@thudongxu/live`
- **Right Column (70%)**: Comment feed with "AI Lọc Comment" header and scrollable list

## Customization

### Change the TikTok User

Edit `app/page.tsx` and update the iframe src:

```tsx
src="https://www.tiktok.com/embed/v2/@your_username/live"
```

### Adjust Colors

The design uses Tailwind CSS classes. Key colors:
- Background: `bg-gray-950` (dark gray-black)
- Accent: `text-pink-400`, `border-pink-500`
- Hover: `hover:border-gray-600`

### Modify Highlight Duration

In `app/page.tsx`, change the timeout value (currently 3000ms):

```tsx
setTimeout(() => {
  // Remove highlight
}, 3000); // Change this value
```

## Troubleshooting

- **No comments showing?**
  - Check your database credentials in `.env.local`
  - Ensure the `tiktok_events` table exists
  - Verify data is being inserted with `event_type='comment'`

- **Real-time updates not working?**
  - Enable real-time replication in Supabase for the `tiktok_events` table
  - Check browser console for connection errors

- **Iframe not loading?**
  - TikTok embed URLs sometimes have restrictions
  - Try using the direct TikTok live URL format

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Real-time Subscriptions

## License

MIT
