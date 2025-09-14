import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Calendar, Star } from "lucide-react";
import { getTrendingMovies, mockMovies, getImageUrl } from "@/lib/omdb";
import { MovieGrid } from "@/components/sections/movie-grid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const TrendingPage: React.FC = () => {
  const navigate = useNavigate();

  // Fetch trending movies for different time periods
  const { data: dailyTrending, isLoading: dailyLoading } = useQuery({
    queryKey: ['trending-daily'],
    queryFn: () => getTrendingMovies('day'),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: false,
  });

  const { data: weeklyTrending, isLoading: weeklyLoading } = useQuery({
    queryKey: ['trending-weekly'],
    queryFn: () => getTrendingMovies('week'),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: false,
  });

  const dailyMovies = dailyTrending?.results || mockMovies;
  const weeklyMovies = weeklyTrending?.results || mockMovies;

  const handleWatchlistToggle = (movieId: string) => {
    // TODO: Implement watchlist functionality
    console.log('Toggle watchlist for movie:', movieId);
  };

  return (
    <div className="min-h-screen pt-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">Trending Movies</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Discover what's popular right now. See the movies that everyone is talking about today and this week.
          </p>
        </div>

        {/* Trending Tabs */}
        <Tabs defaultValue="daily" className="w-full">
          <div className="flex items-center justify-between mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Today
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                This Week
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="daily" className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Trending Today</h2>
                <p className="text-muted-foreground">
                  The most popular movies right now
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                <span>Updated hourly</span>
              </div>
            </div>
            
            <MovieGrid
              movies={dailyMovies}
              isLoading={dailyLoading}
              onWatchlistToggle={handleWatchlistToggle}
              watchlistMovieIds={[]}
            />
          </TabsContent>
          
          <TabsContent value="weekly" className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Trending This Week</h2>
                <p className="text-muted-foreground">
                  Movies that have been popular throughout the week
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Updated daily</span>
              </div>
            </div>
            
            <MovieGrid
              movies={weeklyMovies}
              isLoading={weeklyLoading}
              onWatchlistToggle={handleWatchlistToggle}
              watchlistMovieIds={[]}
            />
          </TabsContent>
        </Tabs>

        {/* Additional Info */}
        <div className="mt-16 bg-card rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">How Trending Works</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Daily Trending</h4>
              <p className="text-muted-foreground text-sm">
                Movies that are gaining popularity today based on searches, views, and social media mentions.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Weekly Trending</h4>
              <p className="text-muted-foreground text-sm">
                Movies that have maintained popularity throughout the week, showing sustained interest.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;
