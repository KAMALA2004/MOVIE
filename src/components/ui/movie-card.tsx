import * as React from "react";
import { Play, Star } from "lucide-react";
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/lib/omdb";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Badge } from "./badge";
import { WatchlistButton } from "./watchlist-button";

interface MovieCardProps {
  movie: Movie;
  size?: "sm" | "md" | "lg";
  showOverlay?: boolean;
  className?: string;
  onClick?: () => void;
}

const MovieCard = React.forwardRef<HTMLDivElement, MovieCardProps>(
  ({ 
    movie, 
    size = "md", 
    showOverlay = true, 
    className, 
    onClick
  }, ref) => {
    const sizeClasses = {
      sm: "w-32",
      md: "w-48",
      lg: "w-64"
    };


    return (
      <div
        ref={ref}
        className={cn(
          "group relative cursor-pointer movie-card rounded-lg overflow-hidden",
          sizeClasses[size],
          className
        )}
        onClick={onClick}
      >
        {/* Movie Poster */}
        <div className="poster-aspect relative overflow-hidden">
          <img
            src={getImageUrl(movie.Poster)}
            alt={movie.Title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Overlay */}
          {showOverlay && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-star-filled text-star-filled" />
                    <span className="text-white text-sm font-medium">
                      {movie.imdbRating}
                    </span>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <WatchlistButton
                      imdbId={movie.imdbID}
                      movieTitle={movie.Title}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-white/20 text-white hover:text-white"
                    />
                  </div>
                </div>
                
                <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                  {movie.Title}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-xs">
                    {movie.Year}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white/20"
                  >
                    <Play className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Rating Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/70 text-white border-none">
              <Star className="h-3 w-3 fill-star-filled text-star-filled mr-1" />
              {movie.imdbRating}
            </Badge>
          </div>
        </div>

        {/* Movie Info (always visible) */}
        <div className="p-3 bg-card">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-card-foreground">
            {movie.Title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {movie.Year}
          </p>
        </div>
      </div>
    );
  }
);

MovieCard.displayName = "MovieCard";

export { MovieCard };