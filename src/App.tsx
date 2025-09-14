import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MovieProvider } from "./contexts/MovieContext";
import { Header } from "./components/navigation/header";
import HomePage from "./pages/Home";
import MovieDetailsPage from "./pages/MovieDetails";
import MoviesPage from "./pages/Movies";
import TrendingPage from "./pages/Trending";
import TopRatedPage from "./pages/TopRated";
import SearchPage from "./pages/Search";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MovieProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/movies" element={<MoviesPage />} />
                  <Route path="/trending" element={<TrendingPage />} />
                  <Route path="/top-rated" element={<TopRatedPage />} />
                  <Route path="/movie/:id" element={<MovieDetailsPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </MovieProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
