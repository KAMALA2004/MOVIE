import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Film, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Film className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Movie Not Found</h2>
          <p className="text-muted-foreground mb-8">
            Looks like this page got lost in the cinema. The movie you're looking for doesn't exist in our database.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-gradient-primary hover:opacity-90">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/search">
              <Search className="h-4 w-4 mr-2" />
              Search Movies
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
