import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewCard } from './review-card';
import { ReviewForm } from './review-form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  review_text?: string;
  is_spoiler: boolean;
  created_at: string;
  user: {
    id: string;
    username: string;
    profile_picture?: string;
  };
}

interface ReviewsSectionProps {
  imdbId: string;
  movieTitle: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  imdbId,
  movieTitle
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_reviews: 0,
    has_next: false,
    has_prev: false,
  });
  const { user, token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fetchReviews = async (page = 1) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/reviews/movies/${imdbId}?page=${page}&limit=10`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.reviews);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    fetchReviews(pagination.current_page);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      setReviews(reviews.filter(review => review.id !== reviewId));
      setPagination(prev => ({
        ...prev,
        total_reviews: prev.total_reviews - 1,
      }));
    } catch (error) {
      throw error;
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchReviews(newPage);
  };

  useEffect(() => {
    fetchReviews();
  }, [imdbId]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const userReview = reviews.find(review => review.user.id === user?.id);

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reviews
          </h3>
          <p className="text-sm text-muted-foreground">
            {pagination.total_reviews} review{pagination.total_reviews !== 1 ? 's' : ''}
            {averageRating > 0 && ` • Average: ${averageRating}/10`}
          </p>
        </div>

        {isAuthenticated && !userReview && (
          <Button onClick={() => setShowReviewForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Write Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-muted/50 rounded-lg p-6">
          <h4 className="font-medium mb-4">
            {editingReview ? 'Edit Review' : 'Write a Review'}
          </h4>
          <ReviewForm
            imdbId={imdbId}
            movieTitle={movieTitle}
            existingReview={editingReview}
            onReviewSubmitted={handleReviewSubmitted}
            onCancel={() => {
              setShowReviewForm(false);
              setEditingReview(null);
            }}
          />
        </div>
      )}

      {/* User's Review */}
      {userReview && !editingReview && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Your Review</h4>
          <ReviewCard
            review={userReview}
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
          />
        </div>
      )}

      {/* Other Reviews */}
      {!userReview && reviews.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Community Reviews</h4>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        </div>
      )}

      {userReview && reviews.length > 1 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Other Reviews</h4>
          <div className="space-y-4">
            {reviews
              .filter(review => review.id !== userReview.id)
              .map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                />
              ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* No Reviews */}
      {!isLoading && reviews.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No reviews yet. Be the first to review this movie!</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={!pagination.has_prev}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground px-4">
            Page {pagination.current_page} of {pagination.total_pages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={!pagination.has_next}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
