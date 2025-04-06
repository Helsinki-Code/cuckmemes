
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Meme } from "@/types";
import { CircleCheckIcon } from "lucide-react";

interface RecentMemesProps {
  userId: string;
  onSelectMeme?: (meme: Meme) => void;
  selectedMemeId?: string;
}

const RecentMemes: React.FC<RecentMemesProps> = ({ userId, onSelectMeme, selectedMemeId }) => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentMemes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('memes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(4);
          
        if (error) throw error;
        
        console.log("Recent memes loaded:", data?.length);
        setMemes(data || []);
      } catch (error) {
        console.error('Error fetching recent memes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchRecentMemes();
    }
    
    // Listen for new memes being created
    const memesSubscription = supabase
      .channel('public:memes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'memes',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('New meme detected:', payload);
        fetchRecentMemes();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(memesSubscription);
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Recent Memes</h3>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (memes.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2">Recent Memes</h3>
      <div className="grid grid-cols-4 gap-2">
        {memes.map((meme) => (
          <Card 
            key={meme.id} 
            className={`overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all ${
              onSelectMeme ? 'hover:shadow-md' : ''
            } ${selectedMemeId === meme.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => onSelectMeme && onSelectMeme(meme)}
          >
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img 
                  src={meme.image_url} 
                  alt="Generated meme"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Use a different placeholder that matches the design
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300/1f2937/FFFFFF?text=Meme';
                  }}
                />
                {selectedMemeId === meme.id && (
                  <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                    <CircleCheckIcon className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentMemes;
