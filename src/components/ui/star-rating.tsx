import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  ({ rating, maxRating = 5, size = "md", interactive = false, onRatingChange, className }, ref) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6"
    };

    const handleClick = (starRating: number) => {
      if (interactive && onRatingChange) {
        onRatingChange(starRating);
      }
    };

    const handleMouseEnter = (starRating: number) => {
      if (interactive) {
        setHoverRating(starRating);
      }
    };

    const handleMouseLeave = () => {
      if (interactive) {
        setHoverRating(0);
      }
    };

    return (
      <div ref={ref} className={cn("flex items-center gap-1", className)}>
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const displayRating = interactive ? (hoverRating || rating) : rating;
          const isFilled = starValue <= displayRating;
          const isPartiallyFilled = starValue - 0.5 <= displayRating && starValue > displayRating;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                "relative transition-all duration-200",
                interactive && "cursor-pointer hover:scale-110",
                !interactive && "cursor-default"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors duration-200",
                  isFilled
                    ? "fill-star-filled text-star-filled"
                    : isPartiallyFilled
                    ? "fill-star-filled/50 text-star-filled"
                    : "fill-star-empty text-star-empty"
                )}
              />
            </button>
          );
        })}
        {!interactive && (
          <span className="ml-2 text-sm text-muted-foreground">
            {rating.toFixed(1)}/5
          </span>
        )}
      </div>
    );
  }
);

StarRating.displayName = "StarRating";

export { StarRating };