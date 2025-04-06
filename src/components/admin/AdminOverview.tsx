
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, CreditCard, ImageIcon, TrendingUp, DollarSign, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DashboardStats {
  totalUsers: number;
  totalMemes: number;
  activeSubscriptions: number;
  revenue: number;
  recentUsers: any[];
  recentMemes: any[];
  recentSubscriptions: any[];
  userGrowth: any[];
  memeGeneration: any[];
}

export function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMemes: 0,
    activeSubscriptions: 0,
    revenue: 0,
    recentUsers: [],
    recentMemes: [],
    recentSubscriptions: [],
    userGrowth: [],
    memeGeneration: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // Fetch total users from user_usage instead of auth.users
        const { count: userCount, error: userError } = await supabase
          .from('user_usage')
          .select('*', { count: 'exact', head: true });

        if (userError) throw userError;

        // Fetch total memes
        const { count: memeCount, error: memeError } = await supabase
          .from('memes')
          .select('*', { count: 'exact', head: true });

        if (memeError) throw memeError;

        // Fetch active subscriptions
        const { count: subscriptionCount, error: subError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        if (subError) throw subError;

        // Fetch recent users using user_usage table
        const { data: recentUsers, error: recentUserError } = await supabase
          .from('user_usage')
          .select('user_id, free_memes_remaining, total_memes_generated')
          .order('user_id', { ascending: false })
          .limit(5);

        if (recentUserError) throw recentUserError;

        // Fetch recent memes
        const { data: recentMemes, error: recentMemeError } = await supabase
          .from('memes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentMemeError) throw recentMemeError;

        // Fetch recent subscriptions
        const { data: recentSubscriptions, error: recentSubError } = await supabase
          .from('subscriptions')
          .select('*')
          .order('id', { ascending: false })
          .limit(5);

        if (recentSubError) throw recentSubError;

        // Generate mock data for charts (in a real app, this would come from analytics)
        const userGrowth = [
          { name: 'Jan', users: 50 },
          { name: 'Feb', users: 80 },
          { name: 'Mar', users: 120 },
          { name: 'Apr', users: 150 },
          { name: 'May', users: 200 },
          { name: 'Jun', users: 240 }
        ];

        const memeGeneration = [
          { name: 'Mon', memes: 45 },
          { name: 'Tue', memes: 52 },
          { name: 'Wed', memes: 68 },
          { name: 'Thu', memes: 75 },
          { name: 'Fri', memes: 90 },
          { name: 'Sat', memes: 120 },
          { name: 'Sun', memes: 95 }
        ];

        setStats({
          totalUsers: userCount || 0,
          totalMemes: memeCount || 0,
          activeSubscriptions: subscriptionCount || 0,
          revenue: subscriptionCount ? subscriptionCount * 9.99 : 0,
          recentUsers,
          recentMemes,
          recentSubscriptions,
          userGrowth,
          memeGeneration
        });

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard statistics",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Set up real-time subscription for memes
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'memes' },
        (payload) => {
          console.log('New meme created:', payload);
          // Update stats when a new meme is created
          setStats(prevStats => ({
            ...prevStats,
            totalMemes: prevStats.totalMemes + 1,
            recentMemes: [payload.new, ...prevStats.recentMemes.slice(0, 4)]
          }));
          toast({
            title: "New Meme Created",
            description: "A user just created a new meme"
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your application statistics and performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              +4% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memes</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMemes}</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +7% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={stats.userGrowth}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Weekly Meme Generation</CardTitle>
                <CardDescription>
                  Memes created per day of the current week
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.memeGeneration}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="memes"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>
                  Latest user registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead className="text-right">Memes Generated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">{user.user_id.substring(0, 8)}...</TableCell>
                        <TableCell className="text-right">{user.total_memes_generated}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Memes</CardTitle>
                <CardDescription>
                  Latest memes created by users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Text</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentMemes.map((meme) => (
                      <TableRow key={meme.id}>
                        <TableCell className="font-medium">{meme.id.substring(0, 6)}...</TableCell>
                        <TableCell>{meme.top_text?.substring(0, 10)}...</TableCell>
                        <TableCell className="text-right">
                          {new Date(meme.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Subscriptions</CardTitle>
                <CardDescription>
                  Latest subscription purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Renewal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentSubscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.plan_type}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {sub.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {new Date(sub.current_period_end).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analytics content will be displayed here. Detailed metrics about user behavior, subscriptions, and meme generation.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generated reports and exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reports content will be displayed here. Export data about users, subscriptions, and meme generation.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
