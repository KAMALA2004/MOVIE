import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Filter, SlidersHorizontal, Search, X, Calendar, Star, Grid, List, SortAsc, SortDesc } from "lucide-react";
import { getPopularMovies, getTopRatedMovies, discoverMovies, searchMovies, mockMovies } from "@/lib/omdb";
import { MovieGrid } from "@/components/sections/movie-grid";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useWatchlist } from "@/contexts/WatchlistContext";

const genres = [
  { id: "Action", name: "Action" },
  { id: "Adventure", name: "Adventure" },
  { id: "Animation", name: "Animation" },
  { id: "Comedy", name: "Comedy" },
  { id: "Crime", name: "Crime" },
  { id: "Drama", name: "Drama" },
  { id: "Fantasy", name: "Fantasy" },
  { id: "Horror", name: "Horror" },
  { id: "Romance", name: "Romance" },
  { id: "Sci-Fi", name: "Science Fiction" },
  { id: "Thriller", name: "Thriller" },
];

const MoviesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = React.useState(1);
  const [selectedGenre, setSelectedGenre] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState("popularity.desc");
  const [minRating, setMinRating] = React.useState([0]);
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("browse");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  
  const { addToWatchlist, removeFromWatchlist, items: watchlist } = useWatchlist();

  const category = searchParams.get("category") || "popular";

  // Generate year options (last 30 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const queryKey = ['movies', category, page, selectedGenre, sortBy, minRating[0], selectedYear, searchQuery];
  
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => {
      if (searchQuery.trim()) {
        return searchMovies(searchQuery, page);
      } else if (category === "discover") {
        return discoverMovies({
          page,
          genre: selectedGenre || undefined,
          sortBy,
          rating: minRating[0] || undefined,
          year: selectedYear || undefined,
        });
      } else if (category === "top-rated") {
        return getTopRatedMovies(page);
      } else {
        return getPopularMovies(page);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  const movies = data?.results || mockMovies;
  const totalPages = 10; // OMDb doesn't provide total pages, using a reasonable default
  const hasMore = page < totalPages;
  
  // Get watchlist movie IDs for quick lookup
  const watchlistMovieIds = watchlist.map(item => item.movie_id);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleCategoryChange = (newCategory: string) => {
    setSearchParams({ category: newCategory });
    setPage(1);
  };

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenre(prev => prev === genreId ? null : genreId);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedGenre(null);
    setSortBy("popularity.desc");
    setMinRating([0]);
    setSelectedYear(null);
    setSearchQuery("");
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab("search");
      setPage(1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveTab("browse");
    setPage(1);
  };

  const handleWatchlistToggle = async (movieId: string) => {
    try {
      if (watchlistMovieIds.includes(movieId)) {
        await removeFromWatchlist(movieId);
      } else {
        await addToWatchlist(movieId);
      }
    } catch (error) {
      console.error('Watchlist toggle error:', error);
    }
  };

  const getPageTitle = () => {
    switch (category) {
      case "top-rated":
        return "Top Rated Movies";
      case "discover":
        return "Discover Movies";
      default:
        return "Popular Movies";
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort By */}
      <div>
        <label className="text-sm font-medium mb-2 block">Sort By</label>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setPage(1); }}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity.desc">Most Popular</SelectItem>
              <SelectItem value="vote_average.desc">Highest Rated</SelectItem>
              <SelectItem value="release_date.desc">Newest First</SelectItem>
              <SelectItem value="release_date.asc">Oldest First</SelectItem>
              <SelectItem value="title.asc">Title A-Z</SelectItem>
              <SelectItem value="title.desc">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3"
          >
            {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Year Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Release Year</label>
        <Select 
          value={selectedYear?.toString() || undefined} 
          onValueChange={(value) => { 
            setSelectedYear(value === "clear" ? null : parseInt(value)); 
            setPage(1); 
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">Any year</SelectItem>
            {years.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Minimum Rating: {minRating[0]}/10
        </label>
        <Slider
          value={minRating}
          onValueChange={(value) => { setMinRating(value); setPage(1); }}
          max={10}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* Genres */}
      <div>
        <label className="text-sm font-medium mb-2 block">Genres</label>
        <div className="flex flex-wrap gap-2">
          {genres.map(genre => (
            <Badge
              key={genre.id}
              variant={selectedGenre === genre.id ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent/10"
              onClick={() => handleGenreToggle(genre.id)}
            >
              {genre.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Additional Filters */}
      <div>
        <label className="text-sm font-medium mb-2 block">Runtime</label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="short"
              className="rounded"
            />
            <label htmlFor="short" className="text-sm">Under 90 min</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="medium"
              className="rounded"
            />
            <label htmlFor="medium" className="text-sm">90-120 min</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="long"
              className="rounded"
            />
            <label htmlFor="long" className="text-sm">Over 120 min</label>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedGenre || minRating[0] > 0 || selectedYear) && (
        <div>
          <label className="text-sm font-medium mb-2 block">Active Filters</label>
          <div className="space-y-2">
            {selectedGenre && (
              <Badge variant="secondary" className="mr-2">
                {genres.find(g => g.id === selectedGenre)?.name}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setSelectedGenre(null)}
                />
              </Badge>
            )}
            {minRating[0] > 0 && (
              <Badge variant="secondary" className="mr-2">
                Rating: {minRating[0]}+
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setMinRating([0])}
                />
              </Badge>
            )}
            {selectedYear && (
              <Badge variant="secondary" className="mr-2">
                Year: {selectedYear}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setSelectedYear(null)}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      <Button variant="outline" onClick={handleClearFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen pt-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Movies</h1>
          <p className="text-muted-foreground">
            Discover amazing movies from our extensive collection
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 h-12 text-lg bg-card"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="search">Search Results</TabsTrigger>
            </TabsList>

            {activeTab === "browse" && (
              <div className="flex items-center gap-2">
                {/* Category Selector */}
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="top-rated">Top Rated</SelectItem>
                    <SelectItem value="discover">Discover</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mobile Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filter Movies</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>

          <TabsContent value="browse" className="space-y-8">
            <div className="flex gap-8">
              {/* Desktop Filters Sidebar */}
              <div className="hidden md:block w-64 flex-shrink-0">
                <div className="bg-card rounded-lg p-6 sticky top-24">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5" />
                    <h3 className="font-semibold">Filters</h3>
                  </div>
                  <FilterContent />
                </div>
              </div>

              {/* Movies Grid */}
              <div className="flex-1">
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{getPageTitle()}</h2>
                      <p className="text-muted-foreground">
                        {movies.length} movies found
                        {selectedGenre && ` • ${genres.find(g => g.id === selectedGenre)?.name}`}
                        {selectedYear && ` • ${selectedYear}`}
                        {minRating[0] > 0 && ` • ${minRating[0]}+ rating`}
                      </p>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>Avg: {movies.length > 0 ? (movies.reduce((acc, movie) => acc + (parseFloat(movie.imdbRating) || 0), 0) / movies.length).toFixed(1) : '0.0'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Years: {movies.length > 0 ? `${Math.min(...movies.map(m => parseInt(m.Year) || 0))}-${Math.max(...movies.map(m => parseInt(m.Year) || 0))}` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <MovieGrid
                  movies={movies}
                  isLoading={isLoading}
                  hasMore={hasMore}
                  onLoadMore={handleLoadMore}
                  watchlistMovieIds={watchlistMovieIds}
                  onWatchlistToggle={handleWatchlistToggle}
                />

                {error && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      Unable to load movies. Showing sample content.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please check your internet connection or try again later.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-8">
            {searchQuery ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    Search Results for "{searchQuery}"
                  </h2>
                  <p className="text-muted-foreground">
                    {isLoading ? "Searching..." : `Found ${movies.length} ${movies.length === 1 ? 'movie' : 'movies'}`}
                  </p>
                </div>
                
                <MovieGrid
                  movies={movies}
                  isLoading={isLoading}
                  hasMore={hasMore}
                  onLoadMore={handleLoadMore}
                  watchlistMovieIds={watchlistMovieIds}
                  onWatchlistToggle={handleWatchlistToggle}
                />

                {error && movies.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No movies found for "{searchQuery}". Showing sample results.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please check your internet connection or try again later.
                    </p>
                  </div>
                )}

                {!isLoading && movies.length === 0 && !error && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg mb-4">
                      No movies found for "{searchQuery}"
                    </p>
                    <p className="text-muted-foreground">
                      Try searching with different keywords or check your spelling.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Search for Movies</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter a movie title in the search bar above to find your favorite films.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MoviesPage;