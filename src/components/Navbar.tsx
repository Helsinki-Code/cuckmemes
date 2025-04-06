
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-sm bg-background/90">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-theme-purple to-theme-pink">
              CuckoldMemeGen
            </span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/generator" className="text-sm font-medium hover:text-primary transition-colors">
            Meme Generator
          </Link>
          <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
