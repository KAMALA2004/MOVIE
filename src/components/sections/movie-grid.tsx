import * as React from "react";
import { Movie } from "@/types/movie";
import { MovieCard } from "@/components/ui/movie-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MovieGridProps {
  movies: Movie[];
  title?: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onWatchlistToggle?: (movieId: string) => void;
  watchlistMovieIds?: string[];
  className?: string;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  title,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onWatchlistToggle,
  watchlistMovieIds = [],
  className = ""
}) => {
  const navigate = useNavigate();

  const handleMovieClick = (movieId: string) => {
    navigate(`/movie/${movieId}`);
  };

  if (isLoading && movies.length === 0) {
    return (
      <section className={`py-12 ${className}`}>
        {title && (
          <div className="container mx-auto px-4 mb-8">
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
        )}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="poster-aspect bg-muted rounded-lg mb-3" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 ${className}`}>
      {title && (
        <div className="container mx-auto px-4 mb-8">
          <h2 className="text-3xl font-bold gradient-text">{title}</h2>
        </div>
      )}
      
      <div className="container mx-auto px-4">
        {movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No movies found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  onClick={() => handleMovieClick(movie.imdbID)}
                  onWatchlistToggle={onWatchlistToggle}
                  isInWatchlist={watchlistMovieIds.includes(movie.imdbID)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onLoadMore}
                  disabled={isLoading}
                  className="min-w-32"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};