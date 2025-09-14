import React, { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  imdbId: string;
  movieTitle: string;
  onReviewSubmitted?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    review_text: string;
    is_spoiler: boolean;
  };
  onCancel?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  imdbId,
  movieTitle,
  onReviewSubmitted,
  existingReview,
  onCancel
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [isSpoiler, setIsSpoiler] = useState(existingReview?.is_spoiler || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !token) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to submit a review.',
        variant: 'destructive',
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const url = existingReview 
        ? `http://localhost:8080/api/reviews/${existingReview.id}`
        : `http://localhost:8080/api/reviews/movies/${imdbId}`;
      
      const method = existingReview ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          review_text: reviewText.trim() || undefined,
          is_spoiler: isSpoiler,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      toast({
        title: existingReview ? 'Review Updated' : 'Review Submitted',
        description: `Your review for ${movieTitle} has been ${existingReview ? 'updated' : 'submitted'} successfully.`,
      });

      setRating(0);
      setReviewText('');
      setIsSpoiler(false);
      onReviewSubmitted?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <p className="text-muted-foreground mb-4">
          Please sign in to write a review for {movieTitle}.
        </p>
        <Button onClick={() => window.location.href = '/login'}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="rating" className="text-sm font-medium">
          Your Rating *
        </Label>
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating}/10
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="review" className="text-sm font-medium">
          Your Review
        </Label>
        <Textarea
          id="review"
          placeholder={`Share your thoughts about ${movieTitle}...`}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="mt-2 min-h-[100px]"
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {reviewText.length}/2000 characters
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="spoiler"
          checked={isSpoiler}
          onCheckedChange={setIsSpoiler}
        />
        <Label htmlFor="spoiler" className="text-sm">
          This review contains spoilers
        </Label>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="flex-1"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {existingReview ? 'Update Review' : 'Submit Review'}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
