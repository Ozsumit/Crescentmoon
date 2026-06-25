import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import LitePlayer from '@/components/lite/LitePlayer';
import { MOVIE_SERVERS } from '@/lib/config';

async function getMovie(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function LiteMoviePage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const movie = await getMovie(id);

  if (!movie) return <Typography>Movie not found</Typography>;

  return (
    <Container sx={{ py: 4 }}>
      <LitePlayer id={id} servers={MOVIE_SERVERS} type="movie" />

      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          {movie.title}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Chip label={movie.release_date?.slice(0, 4)} size="small" variant="outlined" />
          <Chip label={`${movie.vote_average?.toFixed(1)} ⭐`} size="small" sx={{ backgroundColor: 'secondary.container' }} />
          {movie.genres?.map((g) => (
            <Chip key={g.id} label={g.name} size="small" variant="filled" />
          ))}
        </Stack>

        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          {movie.overview}
        </Typography>
      </Box>
    </Container>
  );
}
