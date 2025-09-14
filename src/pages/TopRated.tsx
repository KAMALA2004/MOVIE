import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Star, Award, TrendingUp } from "lucide-react";
import { getTopRatedMovies, mockMovies, getImageUrl } from "@/lib/omdb";
import { MovieGrid } from "@/components/sections/movie-grid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TopRatedPage: React.FC = () => {
  const [page, setPage] = React.useState(1);

  // Fetch top rated movies
  const { data: topRatedData, isLoading } = useQuery({
    queryKey: ['top-rated-movies', page],
    queryFn: () => getTopRatedMovies(page),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: false,
  });

  const movies = topRatedData?.results || mockMovies;

  const handleWatchlistToggle = (movieId: string) => {
    // TODO: Implement watchlist functionality
    console.log('Toggle watchlist for movie:', movieId);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  // Get top 3 movies for featured section
  const topThreeMovies = movies.slice(0, 3);

  return (
    <div className="min-h-screen pt-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">Top Rated Movies</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Discover the highest-rated movies of all time. These critically acclaimed films have earned their place among cinema's greatest achievements.
          </p>
        </div>

        {/* Top 3 Featured Movies */}
        {topThreeMovies.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Top 3 Movies
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {topThreeMovies.map((movie, index) => (
                <Card key={movie.imdbID} className="group cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={getImageUrl(movie.Poster)}
                      alt={movie.Title}
                      className="w-full h-64 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                        #{index + 1}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-black/70 text-white border-none">
                        <Star className="h-3 w-3 fill-star-filled text-star-filled mr-1" />
                        {movie.imdbRating}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{movie.Title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{movie.Year}</span>
                      <span>{movie.Runtime}</span>
                      <span>{movie.Rated}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {movie.Plot}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-star-filled text-star-filled" />
                        <span className="font-medium">{movie.imdbRating}</span>
                        <span className="text-xs text-muted-foreground">({movie.imdbVotes})</span>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Top Rated Movies */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">All Top Rated Movies</h2>
              <p className="text-muted-foreground">
                Complete list of the highest-rated movies
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Sorted by IMDb rating</span>
            </div>
          </div>
        </div>
        
        <MovieGrid
          movies={movies}
          isLoading={isLoading}
          onWatchlistToggle={handleWatchlistToggle}
          watchlistMovieIds={[]}
          hasMore={true}
          onLoadMore={handleLoadMore}
        />

        {/* Rating Information */}
        <div className="mt-16 bg-card rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">About IMDb Ratings</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                Rating Scale
              </h4>
              <p className="text-muted-foreground text-sm">
                IMDb uses a 10-point rating scale where 10 is the highest possible rating.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Calculation
              </h4>
              <p className="text-muted-foreground text-sm">
                Ratings are calculated using a weighted average of user votes to ensure accuracy.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Criteria
              </h4>
              <p className="text-muted-foreground text-sm">
                Only movies with a minimum number of votes are included in the top rated list.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopRatedPage;
