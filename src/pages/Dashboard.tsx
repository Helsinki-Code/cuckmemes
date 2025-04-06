
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase, getUserSubscription } from "@/lib/supabase";
import { Meme, UserSubscriptionInfo } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import { Image, Plus, Zap } from "lucide-react";

const Dashboard = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<UserSubscriptionInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        
        // Get user's memes
        const { data: memesData, error: memesError } = await supabase
          .from('memes')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (memesError) throw memesError;
        
        // Get subscription info
        const subInfo = await getUserSubscription(session.user.id);
        
        setMemes(memesData || []);
        setSubscriptionInfo(subInfo);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="container py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage your memes and subscription</p>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* Usage Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Usage</CardTitle>
            <CardDescription>Your meme generation usage</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading usage data...</p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Free memes remaining:</span>
                  <span className="font-medium">
                    {subscriptionInfo?.freeRemaining || 0}/5
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subscription status:</span>
                  <span className={`font-medium ${subscriptionInfo?.hasSubscription ? 'text-green-500' : 'text-yellow-500'}`}>
                    {subscriptionInfo?.hasSubscription ? 'Active' : 'Not Subscribed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total memes created:</span>
                  <span className="font-medium">{memes.length}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Create and manage memes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/generator">
                <Plus className="mr-2 h-4 w-4" />
                Create New Meme
              </Link>
            </Button>
            {!subscriptionInfo?.hasSubscription && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/pricing">
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
        
        {/* Subscription Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Subscription</CardTitle>
            <CardDescription>Your current plan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading subscription data...</p>
            ) : subscriptionInfo?.hasSubscription ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium capitalize">
                    {subscriptionInfo.subscription?.plan_type || 'Basic'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-green-500 capitalize">
                    {subscriptionInfo.subscription?.status || 'Active'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Renewal date:</span>
                  <span className="font-medium">
                    {subscriptionInfo.subscription?.current_period_end 
                      ? formatDate(subscriptionInfo.subscription.current_period_end)
                      : 'N/A'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p>You are not currently subscribed to any plan.</p>
                <Button asChild className="w-full">
                  <Link to="/pricing">Subscribe Now</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Meme History */}
      <Tabs defaultValue="recent">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Memes</h2>
          <TabsList>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="all">All Memes</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="recent">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : memes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {memes.slice(0, 6).map((meme) => (
                <Card key={meme.id} className="overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={meme.image_url} 
                      alt="Meme" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback for demo purposes
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/3a3a55/FFFFFF?text=Meme+Preview';
                      }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Created {formatDate(meme.created_at)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No memes yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any memes yet. Get started now!
              </p>
              <Button asChild>
                <Link to="/generator">Create Your First Meme</Link>
              </Button>
            </div>
          )}
          
          {memes.length > 6 && (
            <div className="text-center mt-6">
              <Button variant="outline" onClick={() => document.getElementById('all-memes-tab')?.click()}>
                View All Memes
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" id="all-memes-tab">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : memes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {memes.map((meme) => (
                <Card key={meme.id} className="overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={meme.image_url} 
                      alt="Meme" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback for demo purposes
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/3a3a55/FFFFFF?text=Meme+Preview';
                      }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Created {formatDate(meme.created_at)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No memes yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any memes yet. Get started now!
              </p>
              <Button asChild>
                <Link to="/generator">Create Your First Meme</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
