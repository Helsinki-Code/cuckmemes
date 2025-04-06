
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CheckIcon } from "lucide-react";
import { Subscription } from "@/types";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        // Fetch the user's subscription details
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching subscription:", error);
          throw error;
        }
        
        console.log("Subscription data:", data);
        
        if (data) {
          // Type assertion to make TypeScript happy
          setSubscription(data as Subscription);
        }
        
        // Show a success toast when the page loads
        toast({
          title: "Subscription Activated!",
          description: "Thank you for subscribing to our service.",
        });
      } catch (error) {
        console.error("Error checking subscription:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not verify your subscription status.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckIcon className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2 gradient-heading">Subscription Successful!</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Your {subscription?.plan_type || ''} subscription has been activated successfully. 
          You now have access to all premium features.
        </p>
        {subscription && (
          <p className="text-muted-foreground mt-2">
            Your subscription will renew on {formatDate(subscription.current_period_end)}.
          </p>
        )}
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
