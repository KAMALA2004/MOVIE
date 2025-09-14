import * as React from "react";
import { Play, Plus, Star, Calendar } from "lucide-react";
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/lib/omdb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  movie: Movie;
  onWatchTrailer?: () => void;
  onAddToWatchlist?: () => void;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  movie,
  onWatchTrailer,
  onAddToWatchlist,
  className
}) => {
  return (
    <section className={`relative min-h-[70vh] flex items-center ${className}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${getImageUrl(movie.Poster, 'w1280')})`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          {/* Movie Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
            {movie.Title}
          </h1>

          {/* Movie Meta */}
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

            <Badge variant="outline" className="bg-background/50">
              {movie.Rated}
            </Badge>
          </div>

          {/* Movie Overview */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
            {movie.Plot}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
              onClick={onWatchTrailer}
            >
              <Play className="h-5 w-5 mr-2" />
              Watch Trailer
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="bg-background/20 border-border hover:bg-background/30"
              onClick={onAddToWatchlist}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add to Watchlist
            </Button>
          </div>
        </div>
      </div>

      {/* Fade to content */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};