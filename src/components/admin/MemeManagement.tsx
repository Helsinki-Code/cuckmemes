
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Image, Search, Download, Eye } from "lucide-react";
import { Meme } from "@/types";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function MemeManagement() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMemes();

    // Set up real-time subscription for new memes
    const channel = supabase
      .channel('admin-memes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'memes' },
        (payload) => {
          console.log('New meme created:', payload);
          // Update memes list when a new meme is created
          setMemes(prevMemes => [payload.new as Meme, ...prevMemes]);
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

  const fetchMemes = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('memes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMemes(data as Meme[]);
    } catch (error) {
      console.error("Error fetching memes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load meme data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleViewMeme = (meme: Meme) => {
    setSelectedMeme(meme);
  };

  const handleDownload = (meme: Meme) => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = meme.image_url;
    link.download = `meme-${meme.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "The meme is being downloaded to your device",
    });
  };

  const filteredMemes = memes.filter(meme => 
    meme.top_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meme.bottom_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meme.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredMemes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedMemes = filteredMemes.slice(startIndex, startIndex + itemsPerPage);

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
          <h1 className="text-3xl font-bold tracking-tight">Meme Management</h1>
          <p className="text-muted-foreground">
            Manage and moderate user-generated memes.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memes</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memes.length}</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +5% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Meme Gallery</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search memes..."
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
                <TableHead>ID</TableHead>
                <TableHead>Top Text</TableHead>
                <TableHead>Bottom Text</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedMemes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No memes found.
                  </TableCell>
                </TableRow>
              ) : (
                displayedMemes.map((meme) => (
                  <TableRow key={meme.id}>
                    <TableCell className="font-medium">
                      {meme.id.substring(0, 6)}...
                    </TableCell>
                    <TableCell>
                      {meme.top_text.length > 20
                        ? `${meme.top_text.substring(0, 20)}...`
                        : meme.top_text}
                    </TableCell>
                    <TableCell>
                      {meme.bottom_text.length > 20
                        ? `${meme.bottom_text.substring(0, 20)}...`
                        : meme.bottom_text}
                    </TableCell>
                    <TableCell>{formatDate(meme.created_at)}</TableCell>
                    <TableCell>{meme.user_id.substring(0, 8)}...</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewMeme(meme)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(meme)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
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

      {/* Meme Detail Dialog */}
      {selectedMeme && (
        <Dialog open={!!selectedMeme} onOpenChange={() => setSelectedMeme(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Meme Details</DialogTitle>
              <DialogDescription>
                Created on {formatDate(selectedMeme.created_at)}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <img
                  src={selectedMeme.image_url}
                  alt="Meme"
                  className="rounded-md object-cover max-h-[400px]"
                />
                <div className="absolute top-0 w-full text-center text-white text-xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] px-4 py-2">
                  {selectedMeme.top_text}
                </div>
                <div className="absolute bottom-0 w-full text-center text-white text-xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] px-4 py-2">
                  {selectedMeme.bottom_text}
                </div>
              </div>
              <div className="w-full">
                <p><strong>User ID:</strong> {selectedMeme.user_id}</p>
                <p><strong>Meme ID:</strong> {selectedMeme.id}</p>
              </div>
              <Button 
                className="w-full" 
                onClick={() => handleDownload(selectedMeme)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Meme
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
