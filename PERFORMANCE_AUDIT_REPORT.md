# Performance Optimization Audit Report

## Issues Found & Why They Caused Extra Requests/Performance Issues

### 1. Redundant Data Fetching in Detail Pages
**Issue:** Metadata generation (`generateMetadata`) and page component rendering were performing identical TMDB API requests for the same resource ID.
**Why:** Next.js Server Components call `generateMetadata` first, followed by the page component. Without deduplication, this results in two separate network requests to TMDB for every page hit.

### 2. Client-Side Waterfall Fetches (Hydration Delay)
**Issue:** Movie, TV Series, and Episode detail pages relied on `useEffect` to fetch critical data (credits, recommendations, reviews) after the component mounted on the client.
**Why:** This caused a "waterfall" effect where the UI would first render partially, then trigger multiple client-side API requests, leading to increased layout shift, higher latency before the page was interactive, and excessive API load on the client.

### 3. Home Page Mount Fetching
**Issue:** The `HomeDisplay` component performed a client-side fetch for trending data on initial mount, despite the data already being fetched on the server in `app/page.js`.
**Why:** The server-fetched data was being passed as a prop but wasn't effectively used to initialize the client state, causing an immediate redundant network request as soon as the user landed on the home page.

### 4. Excessive Spotlight Carousel Trailer Requests
**Issue:** The Spotlight Carousel fetched YouTube trailer metadata for all 10 items in a serial loop on initial load.
**Why:** This pre-fetched data for items that the user might never see, increasing initial page weight and making 10 additional API calls to TMDB for every home page load.

### 5. Redundant Database Queries in Admin Actions
**Issue:** Admin server actions performed raw SQL queries directly instead of using the optimized library functions that incorporate `unstable_cache`.
**Why:** This bypassed the application's caching layer, resulting in unnecessary database hits for frequently accessed configuration data.

## Changes Made

### Detail Routes (Movie, Series, Episode)
- **Files Modified:** `app/movie/[id]/page.js`, `app/series/[id]/page.js`, `app/series/[id]/season/[seasonid]/[epid]/page.js`
- **Optimization:** Implemented `React.cache()` to wrap data fetching functions, deduplicating requests between metadata and page components.
- **Optimization:** Leveraged TMDB's `append_to_response` to fetch credits, recommendations, and reviews in a single server-side request.
- **Components Modified:** `components/info/MovieInfo.js`, `components/info/TvInfo.js`, `components/info/EpisodeInfo.js`
- **Optimization:** Refactored components to accept data via props and removed redundant `useEffect` client-side fetches.

### Home Page
- **Files Modified:** `app/page.js`, `components/display/HomeDisplay.js`
- **Optimization:** Passed server-fetched trending data to `HomeDisplay` as `initialData`. Updated client-side state to initialize with this data and skip the first fetch cycle on mount.

### Spotlight Carousel
- **File Modified:** `components/display/carausel.js`
- **Optimization:** Replaced the upfront 10-item trailer fetch loop with a lazy-loading mechanism that only fetches the current and next adjacent trailers based on the active slide.

### Admin Panel
- **File Modified:** `app/abmin/action.js`
- **Optimization:** Refactored server actions to use functions from `lib/video-sources.js`, which are wrapped in `unstable_cache`.

## Estimated Reduction in Requests

- **Movie/Series Detail Pages:** Reduced from ~4-5 requests (2 server + 3 client) to **1 single request** (server-side, cached).
- **Episode Detail Pages:** Reduced from ~4 requests to **1 single request**.
- **Home Page (Initial Load):** Reduced from 12+ requests (server + client mount + 10 trailers) to ~3 requests (server-side + 2 lazy-loaded trailers).
- **Admin Configuration:** Database hits reduced significantly due to `unstable_cache` (1 hour default revalidation).

## Manual Review Recommendations
- Ensure that `unstable_cache` tags are correctly invalidated across all deployment environments (e.g., Cloudflare Workers).
- Monitor TMDB API usage to confirm the expected drop in request volume.
