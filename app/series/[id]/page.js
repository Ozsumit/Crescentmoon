import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import LitePlayer from '@/components/lite/LitePlayer';
import { TV_SERVERS } from '@/lib/config';
import Link from 'next/link';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';

async function getSeries(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey || apiKey === "dummy") return null;
  const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return null;
  return res.json();
}

async function getSeason(id, seasonNum) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey || apiKey === "dummy") return null;
  const url = `https://api.themoviedb.org/3/tv/${id}/season/${seasonNum}?api_key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function LiteSeriesPage({ params, searchParams }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const resolvedSearchParams = await searchParams;
  const s = parseInt(resolvedSearchParams.s || '1');
  const e = parseInt(resolvedSearchParams.e || '1');

  const series = await getSeries(id);
  if (!series) {
    if (process.env.NEXT_PUBLIC_TMDB_API_KEY === "dummy") {
        return <Container sx={{ py: 4 }}><Typography>Running in build/dummy mode. No series data.</Typography></Container>;
    }
    return <Typography>Series not found</Typography>;
  }

  const season = await getSeason(id, s);
  const episodes = season?.episodes || [];

  return (
    <Container sx={{ py: 4 }}>
      <LitePlayer id={id} servers={TV_SERVERS} type="tv" season={s} episode={e} />

      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          {series.name}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Chip label={`Season ${s}`} size="small" variant="outlined" />
          <Chip label={`Episode ${e}`} size="small" color="primary" />
          <Chip label={series.first_air_date?.slice(0, 4)} size="small" variant="outlined" />
          <Chip label={`${series.vote_average?.toFixed(1)} ⭐`} size="small" sx={{ backgroundColor: 'secondary.container' }} />
        </Stack>

        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 4 }}>
          {series.overview}
        </Typography>

        {/* Season Selector */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Seasons
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 2, mb: 4 }}>
          {series.seasons?.filter(season => season.season_number > 0).map((seasonObj) => (
            <Link
              key={seasonObj.id}
              href={`/series/${id}?s=${seasonObj.season_number}&e=1`}
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant={s === seasonObj.season_number ? "contained" : "outlined"}
                size="small"
                sx={{
                    minWidth: 'fit-content',
                    borderRadius: 4,
                    borderColor: s === seasonObj.season_number ? 'primary.main' : 'outline'
                }}
              >
                {seasonObj.name}
              </Button>
            </Link>
          ))}
        </Box>

        {/* Episode Selector */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Episodes
        </Typography>
        <Grid container spacing={1}>
          {episodes.map((ep) => (
            <Grid key={ep.id} size={{ xs: 12, sm: 6 }}>
              <Link
                href={`/series/${id}?s=${s}&e=${ep.episode_number}`}
                style={{ textDecoration: 'none' }}
              >
                <Box sx={{
                  p: 2,
                  borderRadius: 4,
                  backgroundColor: e === ep.episode_number ? 'primary.container' : 'background.paper',
                  border: '1px solid',
                  borderColor: e === ep.episode_number ? 'primary.main' : 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 24, color: e === ep.episode_number ? 'primary.main' : 'text.primary' }}>
                    {ep.episode_number}
                  </Typography>
                  <Typography variant="body2" noWrap sx={{ flexGrow: 1, color: 'text.primary' }}>
                    {ep.name}
                  </Typography>
                </Box>
              </Link>
            </Grid>
          ))}
          {episodes.length === 0 && (
              <Typography variant="body2" color="text.secondary">No episodes found for this season.</Typography>
          )}
        </Grid>
      </Box>
    </Container>
  );
}
