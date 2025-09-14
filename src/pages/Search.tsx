import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, X } from "lucide-react";
import { searchMovies, mockMovies } from "@/lib/omdb";
import { MovieGrid } from "@/components/sections/movie-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("q") || "");
  const [page, setPage] = React.useState(1);

  const query = searchParams.get("q") || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ['search-movies', query, page],
    queryFn: () => searchMovies(query, page),
    enabled: !!query,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  const movies = data?.results || [];
  const totalPages = 10; // OMDb doesn't provide total pages, using a reasonable default
  const hasMore = page < totalPages;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      setPage(1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="min-h-screen pt-8">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-center mb-8 gradient-text">
            Search Movies
          </h1>
          
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 h-14 text-lg bg-card"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Search Results */}
        {query && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              Search Results for "{query}"
            </h2>
            <p className="text-muted-foreground">
              {isLoading ? "Searching..." : `Found ${movies.length} ${movies.length === 1 ? 'movie' : 'movies'}`}
            </p>
          </div>
        )}

        {/* Results */}
        {query ? (
          <>
            <MovieGrid
              movies={movies}
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              watchlistMovieIds={[]}
            />

            {error && movies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No movies found for "{query}". Showing sample results.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please check your internet connection or try again later.
                </p>
              </div>
            )}

            {!isLoading && movies.length === 0 && !error && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No movies found for "{query}"
                </p>
                <p className="text-muted-foreground">
                  Try searching with different keywords or check your spelling.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Search for Movies</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Discover your next favorite film by searching through our extensive movie database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;