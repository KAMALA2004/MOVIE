const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User, Review, Watchlist, Movie } = require('../models');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Review,
          as: 'reviews',
          limit: 5,
          include: [
            {
              model: Movie,
              as: 'movie',
              attributes: ['id', 'title', 'year', 'poster']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Get user statistics
    const totalReviews = await Review.count({ where: { user_id: req.params.id } });
    const totalWatchlist = await Watchlist.count({ where: { user_id: req.params.id } });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
        bio: user.bio,
        created_at: user.created_at,
        last_login: user.last_login,
        stats: {
          total_reviews: totalReviews,
          total_watchlist: totalWatchlist
        },
        recent_reviews: user.reviews
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch user profile',
      message: 'Unable to retrieve user information'
    });
  }
});

// Update user profile
router.put('/:id', [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
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

    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is updating their own profile or is admin
    if (id !== userId && !req.user.is_admin) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own profile'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Check for duplicate username/email if updating
    if (req.body.username || req.body.email) {
      const whereClause = { id: { [require('sequelize').Op.ne]: id } };
      
      if (req.body.username) {
        whereClause.username = req.body.username;
      }
      if (req.body.email) {
        whereClause.email = req.body.email;
      }

      const existingUser = await User.findOne({ where: whereClause });
      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: existingUser.username === req.body.username ? 'Username already taken' : 'Email already registered'
        });
      }
    }

    await user.update(req.body);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
        bio: user.bio,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'Unable to update user information'
    });
  }
});

// Change password
router.put('/:id/password', [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
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

    const { id } = req.params;
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    // Check if user is changing their own password
    if (id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only change your own password'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    await user.update({ password_hash: newPasswordHash });

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: 'Unable to update password'
    });
  }
});

// Get user's watchlist
router.get('/:id/watchlist', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is accessing their own watchlist
    if (id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own watchlist'
      });
    }

    const watchlist = await Watchlist.findAll({
      where: { user_id: id },
      include: [
        {
          model: Movie,
          as: 'movie',
          attributes: ['id', 'title', 'year', 'poster', 'imdb_rating', 'genre', 'runtime']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ watchlist });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      error: 'Failed to fetch watchlist',
      message: 'Unable to retrieve watchlist'
    });
  }
});

// Add movie to watchlist
router.post('/:id/watchlist', [
  body('movie_id').isUUID().withMessage('Valid movie ID is required'),
  body('status')
    .optional()
    .isIn(['want_to_watch', 'watching', 'watched'])
    .withMessage('Status must be want_to_watch, watching, or watched'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('priority')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Priority must be between 0 and 5')
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

    const { id } = req.params;
    const { movie_id, status = 'want_to_watch', notes, priority = 0 } = req.body;
    const userId = req.user.id;

    // Check if user is adding to their own watchlist
    if (id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only add to your own watchlist'
      });
    }

    // Check if movie exists
    const movie = await Movie.findByPk(movie_id);
    if (!movie) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    // Check if movie is already in watchlist
    const existingWatchlist = await Watchlist.findOne({
      where: { user_id: id, movie_id }
    });

    if (existingWatchlist) {
      return res.status(409).json({
        error: 'Movie already in watchlist',
        message: 'This movie is already in your watchlist'
      });
    }

    const watchlistItem = await Watchlist.create({
      user_id: id,
      movie_id,
      status,
      notes,
      priority
    });

    // Fetch the created watchlist item with movie data
    const watchlistWithMovie = await Watchlist.findByPk(watchlistItem.id, {
      include: [
        {
          model: Movie,
          as: 'movie',
          attributes: ['id', 'title', 'year', 'poster', 'imdb_rating', 'genre', 'runtime']
        }
      ]
    });

    res.status(201).json({
      message: 'Movie added to watchlist successfully',
      watchlist_item: watchlistWithMovie
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      error: 'Failed to add to watchlist',
      message: 'Unable to add movie to watchlist'
    });
  }
});

// Remove movie from watchlist
router.delete('/:id/watchlist/:movieId', async (req, res) => {
  try {
    const { id, movieId } = req.params;
    const userId = req.user.id;

    // Check if user is removing from their own watchlist
    if (id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only remove from your own watchlist'
      });
    }

    const watchlistItem = await Watchlist.findOne({
      where: { user_id: id, movie_id: movieId }
    });

    if (!watchlistItem) {
      return res.status(404).json({
        error: 'Watchlist item not found',
        message: 'This movie is not in your watchlist'
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

// Update watchlist item
router.put('/:id/watchlist/:movieId', [
  body('status')
    .optional()
    .isIn(['want_to_watch', 'watching', 'watched'])
    .withMessage('Status must be want_to_watch, watching, or watched'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('priority')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Priority must be between 0 and 5')
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

    const { id, movieId } = req.params;
    const userId = req.user.id;

    // Check if user is updating their own watchlist
    if (id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own watchlist'
      });
    }

    const watchlistItem = await Watchlist.findOne({
      where: { user_id: id, movie_id: movieId }
    });

    if (!watchlistItem) {
      return res.status(404).json({
        error: 'Watchlist item not found',
        message: 'This movie is not in your watchlist'
      });
    }

    await watchlistItem.update(req.body);

    // Fetch updated watchlist item with movie data
    const updatedWatchlistItem = await Watchlist.findByPk(watchlistItem.id, {
      include: [
        {
          model: Movie,
          as: 'movie',
          attributes: ['id', 'title', 'year', 'poster', 'imdb_rating', 'genre', 'runtime']
        }
      ]
    });

    res.json({
      message: 'Watchlist item updated successfully',
      watchlist_item: updatedWatchlistItem
    });
  } catch (error) {
    console.error('Update watchlist error:', error);
    res.status(500).json({
      error: 'Failed to update watchlist',
      message: 'Unable to update watchlist item'
    });
  }
});

// Get all users (admin only)
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      users,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_users: count,
        limit: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: 'Unable to retrieve users'
    });
  }
});

module.exports = router;
