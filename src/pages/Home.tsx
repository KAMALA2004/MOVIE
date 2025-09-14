import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getTrendingMovies, getPopularMovies, getTopRatedMovies, mockMovies, getImageUrl } from "@/lib/omdb";
import { HeroSection } from "@/components/sections/hero-section";
import { MovieGrid } from "@/components/sections/movie-grid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch trending movies for hero
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useQuery({
    queryKey: ['trending-movies'],
    queryFn: () => getTrendingMovies('day'),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: false,
  });

  // Debug logging
  React.useEffect(() => {
    console.log('Trending data:', trendingData);
    console.log('Trending loading:', trendingLoading);
    console.log('Trending error:', trendingError);
  }, [trendingData, trendingLoading, trendingError]);

  // Fetch popular movies
  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ['popular-movies'],
    queryFn: () => getPopularMovies(),
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  // Fetch top rated movies
  const { data: topRatedData, isLoading: topRatedLoading } = useQuery({
    queryKey: ['top-rated-movies'],
    queryFn: () => getTopRatedMovies(),
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  const heroMovie = trendingData?.results?.[0] || mockMovies[0];
  const trendingMovies = trendingData?.results?.slice(1, 13) || mockMovies;
  const popularMovies = popularData?.results?.slice(0, 12) || mockMovies;
  const topRatedMovies = topRatedData?.results?.slice(0, 12) || mockMovies;

  const handleWatchTrailer = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Trailer functionality will be available soon!",
    });
  };

  const handleAddToWatchlist = () => {
    toast({
      title: "Sign In Required",
      description: "Please sign in to add movies to your watchlist.",
    });
  };

  const handleWatchlistToggle = (movieId: number) => {
    toast({
      title: "Sign In Required",
      description: "Please sign in to manage your watchlist.",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {heroMovie && (
        <HeroSection
          movie={heroMovie}
          onWatchTrailer={handleWatchTrailer}
          onAddToWatchlist={handleAddToWatchlist}
        />
      )}

      {/* Movie Sections */}
      <div className="space-y-16 pb-16">
        {/* Trending Movies */}
        <MovieGrid
          title="Trending Now"
          movies={trendingMovies}
          isLoading={trendingLoading}
          onWatchlistToggle={handleWatchlistToggle}
        />

        {/* Tabbed Sections */}
        <section className="container mx-auto px-4">
          <Tabs defaultValue="popular" className="w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold gradient-text">Discover Movies</h2>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="popular" className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {popularMovies.map((movie) => (
                  <div key={movie.imdbID} className="movie-card rounded-lg overflow-hidden cursor-pointer"
                       onClick={() => navigate(`/movie/${movie.imdbID}`)}>
                    <div className="poster-aspect relative overflow-hidden">
                      <img
                        src={getImageUrl(movie.Poster)}
                        alt={movie.Title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3 bg-card">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-card-foreground">
                        {movie.Title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {movie.Year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {!popularLoading && (
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate('/movies?category=popular')}
                  >
                    View All Popular Movies
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="top-rated" className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {topRatedMovies.map((movie) => (
                  <div key={movie.imdbID} className="movie-card rounded-lg overflow-hidden cursor-pointer"
                       onClick={() => navigate(`/movie/${movie.imdbID}`)}>
                    <div className="poster-aspect relative overflow-hidden">
                      <img
                        src={getImageUrl(movie.Poster)}
                        alt={movie.Title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3 bg-card">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-card-foreground">
                        {movie.Title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {movie.Year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {!topRatedLoading && (
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate('/movies?category=top-rated')}
                  >
                    View All Top Rated Movies
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
};

export default HomePage;