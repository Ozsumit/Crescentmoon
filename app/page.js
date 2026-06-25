import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import LiteCard from '@/components/lite/LiteCard';
import Box from '@mui/material/Box';

async function getTrending() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey || apiKey === "dummy") return [];
  try {
    const resp = await fetch(
        `https://api.themoviedb.org/3/trending/all/day?language=en-US&api_key=${apiKey}`,
        {
          next: {
            revalidate: 3600,
          },
        }
      );

      if (!resp.ok) {
        return [];
      }
      const data = await resp.json();
      return data.results || [];
  } catch (e) {
      return [];
  }
}

export default async function LiteHome() {
  const trending = await getTrending();

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.main' }}>
          Cmoon Lite
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Minimalist, fast streaming experience.
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Trending Now
      </Typography>

      <Grid container spacing={2}>
        {trending.map((item) => (
          <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={item.id}>
            <LiteCard item={item} />
          </Grid>
        ))}
        {trending.length === 0 && (
            <Typography>No content available at the moment.</Typography>
        )}
      </Grid>
    </Container>
  );
}
