<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics for the Cmoon streaming platform. The project already had a solid PostHog foundation; the wizard verified, standardised, and extended it.

**What was done:**

- Standardised the PostHog public token env var from `NEXT_PUBLIC_POSTHOG_KEY` to `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` across `app/providers.jsx` and `lib/posthog-server.js`, and wrote both `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.local` with the correct values.
- Added the three missing PostHog capture calls in `components/info/EpisodeInfo.js`: `content_favorited`, `content_unfavorited` (in `toggleFav`), and `content_shared` (in `copyLink`) — matching the same event schema already in use on the movie side.
- Confirmed the reverse proxy (`/ingest/*` → PostHog), `skipTrailingSlashRedirect`, and the `PostHogProvider` initialization in `app/providers.jsx` are all correctly in place.
- Confirmed server-side tracking via `lib/posthog-server.js` + `getPostHogClient()` is wired up in `action.js` for `feedback_submitted`.

| Event | Description | File |
|---|---|---|
| `movie_viewed` | User opens a movie detail/watch page — top of content funnel | `components/info/MovieInfo.js` |
| `episode_viewed` | User opens a TV episode watch page — top of TV content funnel | `components/info/EpisodeInfo.js` |
| `video_source_changed` | User switches video source/server while watching a movie | `components/info/MovieInfo.js` |
| `video_source_changed` | User switches video source/server while watching a TV episode | `components/info/EpisodeInfo.js` |
| `content_favorited` | User adds a movie to their saved library | `components/info/MovieInfo.js` |
| `content_unfavorited` | User removes a movie from their saved library | `components/info/MovieInfo.js` |
| `content_shared` | User copies the movie link to share it | `components/info/MovieInfo.js` |
| `content_favorited` | User saves a TV series to their library from the episode page | `components/info/EpisodeInfo.js` |
| `content_unfavorited` | User removes a TV series from their library from the episode page | `components/info/EpisodeInfo.js` |
| `content_shared` | User copies the episode link to share it | `components/info/EpisodeInfo.js` |
| `content_searched` | User submits an explicit search query on the search page | `app/search/page.js` |
| `feedback_submitted` | User successfully submits developer feedback (server-side) | `action.js` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/122537/dashboard/1682022)
- [Content Views Trend (wizard)](https://us.posthog.com/project/122537/insights/X7H4byuN) — Daily movies + episodes viewed
- [Library Engagement (wizard)](https://us.posthog.com/project/122537/insights/ULx3Bxxc) — Content saved vs removed from libraries
- [Search Activity (wizard)](https://us.posthog.com/project/122537/insights/avDAnA4W) — How often users search for content
- [Video Source Switching (wizard)](https://us.posthog.com/project/122537/insights/DKmhmRMr) — How often users switch video sources
- [Content Sharing & Feedback (wizard)](https://us.posthog.com/project/122537/insights/WFJjRqdw) — Content shares and feedback submissions

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
