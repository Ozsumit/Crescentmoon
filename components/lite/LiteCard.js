"use client";
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import Link from 'next/link';

export default function LiteCard({ item }) {
  const title = item.title || item.name || "Untitled";
  const posterPath = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : "https://via.placeholder.com/342x513?text=No+Poster";
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const href = `/${mediaType === 'tv' ? 'series' : 'movie'}/${item.id}`;
  const year = (item.release_date || item.first_air_date || '').split('-')[0];

  return (
    <Card sx={{ maxWidth: 345, backgroundColor: 'surface.containerLow', borderRadius: 7 }}>
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
        <CardActionArea>
          <CardMedia
            component="img"
            height="220"
            image={posterPath}
            alt={title}
            loading="lazy"
            sx={{ borderRadius: '28px 28px 12px 12px' }}
          />
          <CardContent sx={{ p: 1.5 }}>
            <Typography gutterBottom variant="subtitle2" component="div" noWrap sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {year}
              </Typography>
              <Typography variant="caption" sx={{
                px: 1,
                py: 0.2,
                borderRadius: 1,
                backgroundColor: 'secondary.container',
                color: 'secondary.onContainer',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {mediaType}
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  );
}
