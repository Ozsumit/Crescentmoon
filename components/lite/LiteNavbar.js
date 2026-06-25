"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { useRouter, usePathname } from 'next/navigation';
import Paper from '@mui/material/Paper';
import { Home, Search, Film, Tv as TvLucide } from 'lucide-react';

export default function LiteNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const getValue = () => {
    if (pathname === '/') return 0;
    if (pathname.includes('/search')) return 1;
    if (pathname.includes('/movie')) return 2;
    if (pathname.includes('/series')) return 3;
    return 0;
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        backgroundColor: '#25232A'
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getValue()}
        sx={{
          backgroundColor: 'transparent',
          height: 80,
          '& .MuiBottomNavigationAction-root': {
            color: '#938F99',
          },
          '& .Mui-selected': {
            color: '#D0BCFF !important',
            '& .MuiBottomNavigationAction-label': {
              fontWeight: 700,
            }
          },
        }}
      >
        <BottomNavigationAction
          label="Home"
          icon={<Home size={24} />}
          onClick={() => router.push('/')}
        />
        <BottomNavigationAction
          label="Search"
          icon={<Search size={24} />}
          onClick={() => router.push('/search')}
        />
        <BottomNavigationAction
          label="Movies"
          icon={<Film size={24} />}
          onClick={() => router.push('/movie')}
        />
        <BottomNavigationAction
          label="Series"
          icon={<TvLucide size={24} />}
          onClick={() => router.push('/series')}
        />
      </BottomNavigation>
    </Paper>
  );
}
