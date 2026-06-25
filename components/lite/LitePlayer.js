"use client";
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

export default function LitePlayer({ id, servers, type = 'movie', season, episode }) {
  const [currentServer, setCurrentServer] = useState(servers[0]);

  const getEmbedUrl = (server) => {
    let baseUrl = server.url;
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }

    if (server.paramStyle === 'path-slash') {
      if (type === 'tv') {
        return `${baseUrl}${id}/${season}/${episode}`;
      }
      return `${baseUrl}${id}`;
    } else if (server.paramStyle === 'query') {
      if (type === 'tv') {
        return `${baseUrl}?id=${id}&s=${season}&e=${episode}`;
      }
      return `${baseUrl}?id=${id}`;
    } else if (server.paramStyle === 'path-hyphen-mapi') {
       if (type === 'tv') {
        return `${baseUrl}${id}-${season}-${episode}`;
      }
      return `${baseUrl}${id}`;
    }

    // Fallback
    return `${baseUrl}${id}`;
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%',
        backgroundColor: '#000',
        borderRadius: 4,
        overflow: 'hidden',
        mb: 2
      }}>
        <iframe
          src={getEmbedUrl(currentServer)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allowFullScreen
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="server-select-label">Source</InputLabel>
          <Select
            labelId="server-select-label"
            value={currentServer.name}
            label="Source"
            onChange={(e) => {
              const selected = servers.find(s => s.name === e.target.value);
              setCurrentServer(selected);
            }}
            sx={{ borderRadius: 3 }}
          >
            {servers.map((server) => (
              <MenuItem key={server.name} value={server.name}>
                {server.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.secondary">
          {currentServer.description}
        </Typography>
      </Box>
    </Box>
  );
}
