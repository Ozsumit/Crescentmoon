"use client";
import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';
import LiteCard from '@/components/lite/LiteCard';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import { Search as SearchIcon } from 'lucide-react';
import { useDebounce } from 'use-debounce';

export default function LiteSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery] = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      handleSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const handleSearch = async (q) => {
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 800 }}>
        Search
      </Typography>

      <TextField
        fullWidth
        placeholder="Search movies & shows..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{
          mb: 4,
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#25232A'
          }
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon size={20} color="#938F99" />
              </InputAdornment>
            ),
          },
        }}
      />

      {loading ? (
        <Typography>Searching...</Typography>
      ) : (
        <Grid container spacing={2}>
          {results.filter(i => i.media_type !== 'person').map((item) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={item.id}>
              <LiteCard item={item} />
            </Grid>
          ))}
          {results.length === 0 && debouncedQuery.length > 2 && (
            <Typography sx={{ mt: 2, ml: 2 }}>No results found.</Typography>
          )}
        </Grid>
      )}
    </Container>
  );
}
