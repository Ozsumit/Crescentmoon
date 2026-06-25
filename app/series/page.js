import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import LiteCard from '@/components/lite/LiteCard';

async function getSeries() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey || apiKey === "dummy") return [];
  try {
    const url = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

export default async function LiteSeriesPage() {
  const series = await getSeries();

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 800 }}>
        Popular Series
      </Typography>

      <Grid container spacing={2}>
        {series.map((item) => (
          <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={item.id}>
            <LiteCard item={{...item, media_type: 'tv'}} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
