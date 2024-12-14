// pages/api/genres.js
import axios from 'axios';

export default async function handler(req, res) {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/genre/movie/list', {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: 'en-US'
      }
    });

    // Return only the first 5 genres to prevent overwhelming the UI
    const genres = response.data.genres.slice(0, 5);
    res.status(200).json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ 
      error: 'Failed to fetch genres', 
      details: error.message 
    });
  }
}

// pages/api/recommended-movies.js
import axios from 'axios';

export default async function handler(req, res) {
  const { genres } = req.query;

  try {
    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
      params: {
        api_key: process.env.TMDB_API_KEY,
        with_genres: genres,
        sort_by: 'popularity.desc',
        page: 1,
        language: 'en-US'
      }
    });

    // Return only the first 10 movies to prevent performance issues
    const movies = response.data.results.slice(0, 10);
    res.status(200).json(movies);
  } catch (error) {
    console.error('Error fetching recommended movies:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recommended movies', 
      details: error.message 
    });
  }
}