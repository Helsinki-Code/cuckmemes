
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, UserPlus, Search, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserData {
  id: string;
  user_id: string;
  free_memes_remaining: number;
  total_memes_generated: number;
  has_subscription?: boolean;
  subscription_type?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      // Fetch user usage data
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*');

      if (usageError) throw usageError;

      // Fetch subscription data
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active');

      if (subError) throw subError;

      // Combine the data
      const combinedData = usageData.map(user => {
        const subscription = subscriptions.find(s => s.user_id === user.user_id);
        return {
          id: user.user_id, // Set id to be the same as user_id 
          user_id: user.user_id,
          free_memes_remaining: user.free_memes_remaining,
          total_memes_generated: user.total_memes_generated,
          has_subscription: !!subscription,
          subscription_type: subscription ? subscription.plan_type : null
        };
      });

      setUsers(combinedData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFreeCredits = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_usage')
        .update({ free_memes_remaining: 5 })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Free credits have been reset",
      });

      // Update local state
      setUsers(users.map(user => {
        if (user.user_id === userId) {
          return { ...user, free_memes_remaining: 5 };
        }
        return user;
      }));
    } catch (error) {
      console.error("Error resetting credits:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset free credits",
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage your users and their permissions.
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Free Memes</TableHead>
                <TableHead>Memes Generated</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                displayedUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>{user.user_id.substring(0, 10)}...</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.free_memes_remaining}</TableCell>
                    <TableCell>{user.total_memes_generated}</TableCell>
                    <TableCell>
                      {user.has_subscription ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          {user.subscription_type}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                          Free
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleResetFreeCredits(user.user_id)}>
                            Reset Free Credits
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Memes</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
