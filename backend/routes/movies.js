const express = require('express');
const { Op } = require('sequelize');
const { body, query, validationResult } = require('express-validator');
const { Movie, Review, User } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all movies with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
  query('genre').optional().isLength({ min: 1, max: 50 }).withMessage('Genre must be between 1 and 50 characters'),
  query('year').optional().isInt({ min: 1888, max: new Date().getFullYear() + 5 }).withMessage('Invalid year'),
  query('min_rating').optional().isFloat({ min: 0, max: 10 }).withMessage('Min rating must be between 0 and 10'),
  query('sort_by').optional().isIn(['title', 'year', 'imdb_rating', 'average_rating', 'total_reviews', 'created_at']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC')
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

    const {
      page = 1,
      limit = 20,
      search,
      genre,
      year,
      min_rating,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    
    if (search) {
      whereClause.title = {
        [Op.like]: `%${search}%`
      };
    }
    
    if (genre) {
      whereClause.genre = {
        [Op.like]: `%${genre}%`
      };
    }
    
    if (year) {
      whereClause.year = year;
    }
    
    if (min_rating) {
      whereClause.average_rating = {
        [Op.gte]: parseFloat(min_rating)
      };
    }

    // Get movies with pagination
    const { count, rows: movies } = await Movie.findAndCountAll({
      where: whereClause,
      order: [[sort_by, sort_order]],
      limit: parseInt(limit),

      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      movies,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_movies: count,
        limit: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      error: 'Failed to fetch movies',
      message: 'Unable to retrieve movies',
      details: error.message
    });
  }
});

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id, {
      include: [
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profile_picture']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!movie) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    res.json({ movie });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({
      error: 'Failed to fetch movie',
      message: 'Unable to retrieve movie details'
    });
  }
});

// Get movie by IMDb ID
router.get('/imdb/:imdbId', async (req, res) => {
  try {
    const movie = await Movie.findOne({
      where: { imdb_id: req.params.imdbId },
      include: [
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profile_picture']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!movie) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    res.json({ movie });
  } catch (error) {
    console.error('Get movie by IMDb ID error:', error);
    res.status(500).json({
      error: 'Failed to fetch movie',
      message: 'Unable to retrieve movie details'
    });
  }
});

// Add new movie (admin only)
router.post('/', authMiddleware, adminMiddleware, [
  body('imdb_id').matches(/^tt\d{6,8}$/).withMessage('Invalid IMDb ID format'),
  body('title').notEmpty().withMessage('Title is required'),
  body('year').optional().custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    const num = parseInt(value);
    return !isNaN(num) && num >= 1888 && num <= new Date().getFullYear() + 5;
  }).withMessage('Invalid year'),
  body('imdb_rating').optional().custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 10;
  }).withMessage('IMDb rating must be between 0 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array()
      });
    }

    // Check if movie already exists
    const existingMovie = await Movie.findOne({
      where: { imdb_id: req.body.imdb_id }
    });

    if (existingMovie) {
      return res.status(409).json({
        error: 'Movie already exists',
        message: 'A movie with this IMDb ID already exists'
      });
    }

    const movie = await Movie.create(req.body);

    res.status(201).json({
      message: 'Movie added successfully',
      movie
    });
  } catch (error) {
    console.error('Add movie error:', error);
    res.status(500).json({
      error: 'Failed to add movie',
      message: 'Unable to create movie record'
    });
  }
});

// Update movie (admin only)
router.put('/:id', authMiddleware, adminMiddleware, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('year').optional().isInt({ min: 1888, max: new Date().getFullYear() + 5 }).withMessage('Invalid year'),
  body('imdb_rating').optional().isFloat({ min: 0, max: 10 }).withMessage('IMDb rating must be between 0 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array()
      });
    }

    const movie = await Movie.findByPk(req.params.id);
    if (!movie) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    await movie.update(req.body);

    res.json({
      message: 'Movie updated successfully',
      movie
    });
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({
      error: 'Failed to update movie',
      message: 'Unable to update movie record'
    });
  }
});

// Delete movie (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    await movie.destroy();

    res.json({
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({
      error: 'Failed to delete movie',
      message: 'Unable to delete movie record'
    });
  }
});

// Get movie reviews
router.get('/:id/reviews', [
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

    const movie = await Movie.findByPk(req.params.id);
    if (!movie) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { movie_id: req.params.id },
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

module.exports = router;
