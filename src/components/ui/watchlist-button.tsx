import React, { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WatchlistButtonProps {
  imdbId: string;
  movieTitle: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({
  imdbId,
  movieTitle,
  variant = 'outline',
  size = 'sm',
  className = '',
}) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [watchlistItem, setWatchlistItem] = useState<any>(null);
  const { addToWatchlist, removeFromWatchlist, checkInWatchlist } = useWatchlist();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && imdbId) {
      checkWatchlistStatus();
    }
  }, [isAuthenticated, imdbId]);

  const checkWatchlistStatus = async () => {
    try {
      const result = await checkInWatchlist(imdbId);
      setIsInWatchlist(result.inWatchlist);
      setWatchlistItem(result.watchlistItem);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to add movies to your watchlist.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isInWatchlist && watchlistItem) {
        await removeFromWatchlist(watchlistItem.id);
        setIsInWatchlist(false);
        setWatchlistItem(null);
        toast({
          title: 'Removed from Watchlist',
          description: `${movieTitle} has been removed from your watchlist.`,
        });
      } else {
        await addToWatchlist(imdbId);
        setIsInWatchlist(true);
        toast({
          title: 'Added to Watchlist',
          description: `${movieTitle} has been added to your watchlist.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update watchlist',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleWatchlist}
      disabled={isLoading}
      className={`${className} ${isInWatchlist ? 'text-red-500 hover:text-red-600' : ''}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${isInWatchlist ? 'fill-current' : ''}`} />
      )}
      <span className="ml-2">
        {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
      </span>
    </Button>
  );
};
