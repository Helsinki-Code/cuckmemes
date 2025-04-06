
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = async (plan: "basic" | "premium") => {
    const session = await supabase.auth.getSession();
    
    if (!session.data.session) {
      toast({
        title: "Login required",
        description: "Please login to subscribe",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    setLoading(plan);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Error subscribing:", error);
      toast({
        title: "Subscription error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  return (
    <div className="container py-16 px-4">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 gradient-heading">Upgrade Your Meme Game</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that's right for you and start creating unlimited cuckold memes
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Basic Plan */}
        <Card className="relative overflow-hidden border-2 hover:border-theme-purple transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-theme-purple to-theme-pink"></div>
          <CardHeader>
            <CardTitle className="text-2xl">Basic Plan</CardTitle>
            <CardDescription>Perfect for casual meme creators</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$19.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "Unlimited meme generations",
                "Access to AI text generation",
                "High-quality downloads",
                "Basic customization options",
                "Save meme history",
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleSubscribe("basic")}
              disabled={loading !== null}
            >
              {loading === "basic" ? "Processing..." : "Subscribe Now"}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Premium Plan */}
        <Card className="relative overflow-hidden border-2 border-theme-purple">
          <div className="absolute -rotate-45 bg-theme-pink text-white text-xs font-bold py-1 px-6 -right-8 top-4">
            POPULAR
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-theme-pink to-theme-purple"></div>
          <CardHeader>
            <CardTitle className="text-2xl">Premium Plan</CardTitle>
            <CardDescription>For the serious meme enthusiast</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$49.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "Everything in Basic plan",
                "Priority AI processing",
                "Advanced text customization",
                "Multiple text placements",
                "Custom font options",
                "Premium image effects",
                "Batch meme generation",
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-theme-pink hover:bg-pink-700" 
              onClick={() => handleSubscribe("premium")}
              disabled={loading !== null}
            >
              {loading === "premium" ? "Processing..." : "Get Premium"}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          All plans include a 7-day money-back guarantee. No questions asked.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
