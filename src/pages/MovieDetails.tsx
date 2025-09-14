import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Play, Heart, Star, Calendar, Clock, Users, ArrowLeft } from "lucide-react";
import { getMovieDetails, getMovieCredits, mockMovies, getImageUrl } from "@/lib/omdb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRating, setUserRating] = React.useState(0);
  const [reviewText, setReviewText] = React.useState("");

  const movieId = id || '';

  // Fetch movie details
  const { data: movieDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['movie-details', movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: !!movieId,
    retry: false,
  });

  // Fetch movie credits
  const { data: credits, isLoading: creditsLoading } = useQuery({
    queryKey: ['movie-credits', movieId],
    queryFn: () => getMovieCredits(movieId),
    enabled: !!movieId,
    retry: false,
  });

  // Use mock data as fallback
  const movie = movieDetails || mockMovies.find(m => m.imdbID === movieId) || mockMovies[0];
  const cast = credits?.cast ? credits.cast.split(', ').slice(0, 8).map((name, index) => ({ id: index, name, character: '' })) : [];

  const handleSubmitReview = () => {
    if (!userRating) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sign In Required",
      description: "Please sign in to submit reviews.",
    });
  };

  const handleAddToWatchlist = () => {
    toast({
      title: "Sign In Required", 
      description: "Please sign in to add movies to your watchlist.",
    });
  };

  const handleWatchTrailer = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Trailer functionality will be available soon!",
    });
  };

  if (detailsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-96 bg-muted" />
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-muted rounded mb-4" />
            <div className="h-6 bg-muted rounded w-2/3 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(/placeholder-backdrop.jpg)`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Movie Poster */}
            <div className="flex-shrink-0">
              <img
                src={getImageUrl(movie.Poster)}
                alt={movie.Title}
                className="w-48 h-72 object-cover rounded-lg shadow-elegant"
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{movie.Title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-star-filled text-star-filled" />
                  <span className="font-semibold text-lg">{movie.imdbRating}</span>
                  <span className="text-muted-foreground">({movie.imdbVotes} votes)</span>
                </div>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{movie.Year}</span>
                </div>

                {movie.Runtime && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{movie.Runtime}</span>
                  </div>
                )}

                <Badge variant="outline" className="bg-background/50">
                  {movie.Rated}
                </Badge>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {movie.Plot}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={handleWatchTrailer}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Trailer
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="hover:bg-accent/10"
                  onClick={handleAddToWatchlist}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Add to Watchlist
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Cast */}
            {cast.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 gradient-text">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {cast.map((member) => (
                    <div key={member.id} className="text-center">
                      <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 gradient-text">Reviews</h2>
              
              {/* Write Review */}
              <div className="bg-card rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Rating</label>
                    <StarRating
                      rating={userRating}
                      interactive
                      onRatingChange={setUserRating}
                      size="lg"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Review</label>
                    <Textarea
                      placeholder="Share your thoughts about this movie..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <Button onClick={handleSubmitReview} className="bg-gradient-primary hover:opacity-90">
                    Submit Review
                  </Button>
                </div>
              </div>

              {/* Sample Reviews */}
              <div className="space-y-6">
                <div className="bg-card rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-medium">JD</span>
                      </div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-xs text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                    <StarRating rating={4.5} size="sm" />
                  </div>
                  <p className="text-muted-foreground">
                    An absolutely phenomenal film that showcases incredible storytelling and character development. 
                    The cinematography is breathtaking and the performances are top-notch.
                  </p>
                </div>

                <div className="bg-card rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-medium">MS</span>
                      </div>
                      <div>
                        <p className="font-medium">Movie Specialist</p>
                        <p className="text-xs text-muted-foreground">1 week ago</p>
                      </div>
                    </div>
                    <StarRating rating={5} size="sm" />
                  </div>
                  <p className="text-muted-foreground">
                    A masterpiece of cinema! This movie deserves all the acclaim it receives. 
                    Every aspect from direction to acting is executed flawlessly.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Movie Stats */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Movie Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Release Date</span>
                  <span>{movie.Released}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IMDb Rating</span>
                  <span>{movie.imdbRating}/10</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Votes</span>
                  <span>{movie.imdbVotes}</span>
                </div>
                {movie.Runtime && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Runtime</span>
                      <span>{movie.Runtime}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Genres */}
            {movie.Genre && (
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.Genre.split(', ').map((genre: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;