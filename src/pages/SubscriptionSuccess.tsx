
import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CheckIcon } from "lucide-react";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    
    checkAuth();
    
    // Show a success toast when the page loads
    toast({
      title: "Subscription Activated!",
      description: "Thank you for subscribing to our service.",
    });
  }, [navigate, toast]);

  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckIcon className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2 gradient-heading">Subscription Successful!</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Your subscription has been activated successfully. You now have access to all premium features.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>
            Here's what you can do now with your new subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <CheckIcon className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">Create Unlimited Memes</h3>
                <p className="text-sm text-muted-foreground">
                  Generate as many memes as you want without limitations
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <CheckIcon className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">Advanced Customization</h3>
                <p className="text-sm text-muted-foreground">
                  Access premium features for meme customization
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <CheckIcon className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">AI Text Generation</h3>
                <p className="text-sm text-muted-foreground">
                  Generate perfect meme text using our AI
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <CheckIcon className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">Premium Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get priority support for any issues
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild className="flex-1">
              <Link to="/generator">Create Your First Meme</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
