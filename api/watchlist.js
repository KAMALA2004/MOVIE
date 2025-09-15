const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Watchlist, Movie, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const MovieService = require('../services/movieService');

const router = express.Router();

// Get user's watchlist
router.get('/', authMiddleware, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['want_to_watch', 'watching', 'watched']).withMessage('Invalid status')
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

    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // Build where clause
    const whereClause = { user_id: userId };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: watchlistItems } = await Watchlist.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Movie,
          as: 'movie',
          attributes: ['id', 'title', 'year', 'poster', 'imdb_rating', 'average_rating', 'total_reviews']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      watchlist: watchlistItems,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: count,
        limit: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      error: 'Failed to fetch watchlist',
      message: 'Unable to retrieve watchlist items'
    });
  }
});

// Add movie to watchlist
router.post('/add', authMiddleware, [
  body('imdb_id').matches(/^tt\d{7,8}$/).withMessage('Valid IMDb ID is required'),
  body('status').optional().isIn(['want_to_watch', 'watching', 'watched']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('priority').optional().isInt({ min: 0, max: 5 }).withMessage('Priority must be between 0 and 5')
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

    const { imdb_id, status = 'want_to_watch', notes, priority = 0 } = req.body;
    const userId = req.user.id;

    // Get or create movie by IMDb ID
    const movie = await MovieService.getOrCreateMovieByImdbId(imdb_id);

    // Check if already in watchlist
    const existingItem = await Watchlist.findOne({
      where: { user_id: userId, movie_id: movie.id }
    });

    if (existingItem) {
      return res.status(409).json({
        error: 'Movie already in watchlist',
        message: 'This movie is already in your watchlist'
      });
    }

    // Add to watchlist
    const watchlistItem = await Watchlist.create({
      user_id: userId,
      movie_id: movie.id,
      status,
      notes,
      priority
    });

    // Fetch the created item with movie data
    const watchlistItemWithMovie = await Watchlist.findByPk(watchlistItem.id, {
      include: [
        {
          model: Movie,
          as: 'movie',
          attributes: ['id', 'title', 'year', 'poster', 'imdb_rating', 'average_rating', 'total_reviews']
        }
      ]
    });

    res.status(201).json({
      message: 'Movie added to watchlist successfully',
      watchlistItem: watchlistItemWithMovie
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      error: 'Failed to add to watchlist',
      message: 'Unable to add movie to watchlist'
    });
  }
});

// Update watchlist item
router.put('/:itemId', authMiddleware, [
  body('status').optional().isIn(['want_to_watch', 'watching', 'watched']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('priority').optional().isInt({ min: 0, max: 5 }).withMessage('Priority must be between 0 and 5')
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

    const { itemId } = req.params;
    const userId = req.user.id;

    const watchlistItem = await Watchlist.findByPk(itemId);
    if (!watchlistItem) {
      return res.status(404).json({
        error: 'Watchlist item not found',
        message: 'The requested watchlist item does not exist'
      });
    }

    // Check if user owns this item
    if (watchlistItem.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only edit your own watchlist items'
      });
    }

    await watchlistItem.update(req.body);

    // Fetch updated item with movie data
    const updatedItem = await Watchlist.findByPk(itemId, {
      include: [
        {
          model: Movie,
          as: 'movie',
          attributes: ['id', 'title', 'year', 'poster', 'imdb_rating', 'average_rating', 'total_reviews']
        }
      ]
    });

    res.json({
      message: 'Watchlist item updated successfully',
      watchlistItem: updatedItem
    });
  } catch (error) {
    console.error('Update watchlist item error:', error);
    res.status(500).json({
      error: 'Failed to update watchlist item',
      message: 'Unable to update watchlist item'
    });
  }
});

// Remove movie from watchlist
router.delete('/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const watchlistItem = await Watchlist.findByPk(itemId);
    if (!watchlistItem) {
      return res.status(404).json({
        error: 'Watchlist item not found',
        message: 'The requested watchlist item does not exist'
      });
    }

    // Check if user owns this item
    if (watchlistItem.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own watchlist items'
      });
    }

    await watchlistItem.destroy();

    res.json({
      message: 'Movie removed from watchlist successfully'
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      error: 'Failed to remove from watchlist',
      message: 'Unable to remove movie from watchlist'
    });
  }
});

// Check if movie is in user's watchlist
router.get('/check/:imdbId', authMiddleware, async (req, res) => {
  try {
    const { imdbId } = req.params;
    const userId = req.user.id;

    // Get or create movie by IMDb ID
    const movie = await MovieService.getOrCreateMovieByImdbId(imdbId);

    const watchlistItem = await Watchlist.findOne({
      where: { user_id: userId, movie_id: movie.id }
    });

    res.json({
      inWatchlist: !!watchlistItem,
      watchlistItem: watchlistItem || null
    });
  } catch (error) {
    console.error('Check watchlist error:', error);
    res.status(500).json({
      error: 'Failed to check watchlist',
      message: 'Unable to check if movie is in watchlist'
    });
  }
});

module.exports = router;
