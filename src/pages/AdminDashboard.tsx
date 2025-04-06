
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminAuth } from "@/components/admin/AdminAuth";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsAuthenticating(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Check if user email matches admin email
          if (session.user.email === "vikky090896@gmail.com") {
            setIsAdmin(true);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(true);
            setIsAdmin(false);
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: "You don't have admin privileges.",
            });
            navigate("/");
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsAuthenticating(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  if (isAuthenticating) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminAuth />;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You don't have permission to access this area.</p>
        <button 
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  return <AdminLayout />;
};

export default AdminDashboard;
