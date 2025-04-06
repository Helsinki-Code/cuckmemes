
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Meme } from "@/types";
import { CircleCheckIcon } from "lucide-react";

interface RecentMemesProps {
  userId: string;
  onSelectMeme?: (meme: Meme) => void;
}

const RecentMemes: React.FC<RecentMemesProps> = ({ userId, onSelectMeme }) => {
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
            }`}
            onClick={() => onSelectMeme && onSelectMeme(meme)}
          >
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img 
                  src={meme.image_url} 
                  alt="Generated meme"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/3a3a55/FFFFFF?text=Meme';
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentMemes;
