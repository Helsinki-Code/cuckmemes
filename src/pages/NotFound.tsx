
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="bg-theme-purple/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-theme-purple" />
          </div>
          <h1 className="text-4xl font-bold mb-4 gradient-heading">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Button asChild size="lg">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
