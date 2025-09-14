const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Review, Movie, User } = require('../models');

const MovieService = require('../services/movieService');

const router = express.Router();

// Submit a new review
router.post('/movies/:imdbId', [
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('review_text')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Review text cannot exceed 2000 characters'),
  body('is_spoiler')
    .optional()
    .isBoolean()
    .withMessage('is_spoiler must be a boolean value')
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

    const { imdbId } = req.params;
    const { rating, review_text, is_spoiler = false } = req.body;
    const userId = req.user.id;

    // Get or create movie by IMDb ID
    const movie = await MovieService.getOrCreateMovieByImdbId(imdbId);

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      where: { user_id: userId, movie_id: movie.id }
    });

    if (existingReview) {
      return res.status(409).json({
        error: 'Review already exists',
        message: 'You have already reviewed this movie'
      });
    }

    // Create review
    const review = await Review.create({
      user_id: userId,
      movie_id: movie.id,
      rating,
      review_text,
      is_spoiler
    });

    // Update movie's average rating and total reviews
    await updateMovieRating(movie.id);

    // Fetch the created review with user data
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profile_picture']
        }
      ]
    });

    res.status(201).json({
      message: 'Review submitted successfully',
      review: reviewWithUser
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      error: 'Failed to submit review',
      message: 'Unable to create review'
    });
  }
});

// Update a review
router.put('/:reviewId', [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('review_text')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Review text cannot exceed 2000 characters'),
  body('is_spoiler')
    .optional()
    .isBoolean()
    .withMessage('is_spoiler must be a boolean value')
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

    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    // Check if user owns this review
    if (review.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only edit your own reviews'
      });
    }

    await review.update(req.body);

    // Update movie's average rating
    await updateMovieRating(review.movie_id);

    // Fetch updated review with user data
    const updatedReview = await Review.findByPk(reviewId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profile_picture']
        }
      ]
    });

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      error: 'Failed to update review',
      message: 'Unable to update review'
    });
  }
});

// Delete a review
router.delete('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    // Check if user owns this review
    if (review.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own reviews'
      });
    }

    const movieId = review.movie_id;
    await review.destroy();

    // Update movie's average rating
    await updateMovieRating(movieId);

    res.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      error: 'Failed to delete review',
      message: 'Unable to delete review'
    });
  }
});

// Get user's reviews
router.get('/user/:userId', [
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

    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { user_id: userId },
      include: [
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
    console.error('Get user reviews error:', error);
    res.status(500).json({
      error: 'Failed to fetch reviews',
      message: 'Unable to retrieve user reviews'
    });
  }
});

// Get user's reviews
router.get('/user/:userId', [
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
    console.error('Get user reviews error:', error);
    res.status(500).json({
      error: 'Failed to fetch user reviews',
      message: 'Unable to retrieve user reviews'
    });
  }
});

// Helper function to update movie rating
async function updateMovieRating(movieId) {
  try {
    const reviews = await Review.findAll({
      where: { movie_id: movieId },
      attributes: ['rating']
    });

    if (reviews.length === 0) {
      await Movie.update(
        { average_rating: 0, total_reviews: 0 },
        { where: { id: movieId } }
      );
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Movie.update(
      { 
        average_rating: Math.round(averageRating * 100) / 100, 
        total_reviews: reviews.length 
      },
      { where: { id: movieId } }
    );
  } catch (error) {
    console.error('Update movie rating error:', error);
  }
}

module.exports = router;
