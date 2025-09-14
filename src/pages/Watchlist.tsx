import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { MovieCard } from '@/components/ui/movie-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Filter, Heart, Eye, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Watchlist: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { items, isLoading, error, pagination, fetchWatchlist, updateWatchlistItem, removeFromWatchlist } = useWatchlist();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchlist(currentPage, statusFilter === 'all' ? undefined : statusFilter);
    }
  }, [isAuthenticated, currentPage, statusFilter]);

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (itemId: string, newStatus: string) => {
    try {
      await updateWatchlistItem(itemId, { status: newStatus as any });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleRemoveFromWatchlist = async (itemId: string) => {
    try {
      await removeFromWatchlist(itemId);
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'want_to_watch':
        return <Heart className="h-4 w-4" />;
      case 'watching':
        return <Eye className="h-4 w-4" />;
      case 'watched':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'want_to_watch':
        return 'bg-blue-100 text-blue-800';
      case 'watching':
        return 'bg-yellow-100 text-yellow-800';
      case 'watched':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">My Watchlist</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your watchlist.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
          <p className="text-muted-foreground">
            {pagination ? `${pagination.total_items} movies` : '0 movies'} in your watchlist
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Movies</SelectItem>
                <SelectItem value="want_to_watch">Want to Watch</SelectItem>
                <SelectItem value="watching">Watching</SelectItem>
                <SelectItem value="watched">Watched</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your watchlist is empty</h3>
          <p className="text-muted-foreground mb-6">
            Start building your watchlist by adding movies you want to watch.
          </p>
          <Button onClick={() => navigate('/movies')}>Browse Movies</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="relative group">
                <MovieCard
                  movie={{
                    imdbID: item.movie.id,
                    Title: item.movie.title,
                    Year: item.movie.year.toString(),
                    Poster: item.movie.poster || '',
                    imdbRating: item.movie.imdb_rating?.toString() || '0',
                    Rated: '',
                    Released: '',
                    Runtime: '',
                    Genre: '',
                    Director: '',
                    Writer: '',
                    Actors: '',
                    Plot: '',
                    Language: '',
                    Country: '',
                    Awards: '',
                    Ratings: [],
                    Metascore: '',
                    imdbVotes: '',
                    Type: 'movie',
                    DVD: '',
                    BoxOffice: '',
                    Production: '',
                    Website: '',
                    Response: 'True',
                  }}
                />
                
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <Badge className={`${getStatusColor(item.status)} flex items-center gap-1`}>
                    {getStatusIcon(item.status)}
                    {item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col gap-2">
                    <Select
                      value={item.status}
                      onValueChange={(newStatus) => handleStatusUpdate(item.id, newStatus)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="want_to_watch">Want to Watch</SelectItem>
                        <SelectItem value="watching">Watching</SelectItem>
                        <SelectItem value="watched">Watched</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveFromWatchlist(item.id)}
                      className="h-8 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                {item.notes && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="truncate">{item.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.has_prev}
              >
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1))}
                disabled={!pagination.has_next}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Watchlist;
