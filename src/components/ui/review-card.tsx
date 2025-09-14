import React, { useState } from 'react';
import { Star, MoreVertical, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReviewCardProps {
  review: {
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
  };
  onEdit?: (review: any) => void;
  onDelete?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === review.user.id;
  const canEdit = isOwner;
  const canDelete = isOwner;

  const handleDelete = async () => {
    if (!canDelete || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(review.id);
      toast({
        title: 'Review Deleted',
        description: 'Your review has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <div className="bg-card rounded-lg border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={review.user.profile_picture} />
            <AvatarFallback>
              {review.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{review.user.username}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(review.created_at)}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {renderStars(review.rating)}
          <span className="text-sm font-medium ml-1">{review.rating}/10</span>
        </div>

        {/* Actions Menu */}
        {(canEdit || canDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(review)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Review
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Review
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Spoiler Warning */}
      {review.is_spoiler && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800 font-medium">
            This review contains spoilers
          </span>
        </div>
      )}

      {/* Review Text */}
      {review.review_text && (
        <div className="prose prose-sm max-w-none">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {review.review_text}
          </p>
        </div>
      )}

      {/* Rating Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {review.rating}/10
        </Badge>
        {review.is_spoiler && (
          <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
            Contains Spoilers
          </Badge>
        )}
      </div>
    </div>
  );
};
