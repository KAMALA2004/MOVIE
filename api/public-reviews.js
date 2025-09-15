const express = require('express');
const { query, validationResult } = require('express-validator');
const { Review, Movie, User } = require('../models');
const MovieService = require('../services/movieService');

const router = express.Router();

// Get reviews for a specific movie (public endpoint)
router.get('/movies/:imdbId', async (req, res) => {
  try {
    const { imdbId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get or create movie by IMDb ID
    const movie = await MovieService.getOrCreateMovieByImdbId(imdbId);

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { movie_id: movie.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profile_picture']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      reviews,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_reviews: count,
        limit: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });
  } catch (error) {
    console.error('Get movie reviews error:', error);
    res.status(500).json({
      error: 'Failed to fetch reviews',
      message: 'Unable to retrieve movie reviews'
    });
  }
});

// Get recent reviews (public endpoint)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: errors.array()
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profile_picture']
        },
        {
          model: Movie,
          as: 'movie',
          attributes: ['id', 'title', 'year', 'poster', 'imdb_rating']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      reviews,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_reviews: count,
        limit: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });
  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({
      error: 'Failed to fetch reviews',
      message: 'Unable to retrieve recent reviews'
    });
  }
});

module.exports = router;
