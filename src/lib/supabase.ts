
import { createClient } from '@supabase/supabase-js';
import { UserSubscriptionInfo } from '@/types';

const supabaseUrl = 'https://fxpdgbvveojnrygkmaug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4cGRnYnZ2ZW9qbnJ5Z2ttYXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNDY3ODgsImV4cCI6MjA1ODcyMjc4OH0.vhIwwChuMik6oGWqmEKAoUiItPOd5Hww8wr8sRnoW-I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUserSubscription(userId: string): Promise<UserSubscriptionInfo> {
  // Check if user has remaining free memes
  const { data: freeUsage } = await supabase
    .from('user_usage')
    .select('free_memes_remaining')
    .eq('user_id', userId)
    .single();

  if (freeUsage && freeUsage.free_memes_remaining > 0) {
    return {
      hasFreeUsage: true,
      freeRemaining: freeUsage.free_memes_remaining,
      hasSubscription: false
    };
  }

  // Check if user has an active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  return {
    hasFreeUsage: false,
    freeRemaining: 0,
    hasSubscription: !!subscription,
    subscription
  };
}

export async function decrementFreeUsage(userId: string) {
  const { data, error } = await supabase.rpc('decrement_free_memes', {
    user_id: userId
  });
  
  if (error) {
    console.error('Error decrementing free memes:', error);
    return false;
  }
  
  return true;
}

export async function saveMeme(userId: string, imageUrl: string, topText: string, bottomText: string) {
  const { data, error } = await supabase
    .from('memes')
    .insert([
      { 
        user_id: userId, 
        image_url: imageUrl, 
        top_text: topText, 
        bottom_text: bottomText
      }
    ])
    .select();
    
  if (error) {
    console.error('Error saving meme:', error);
    return null;
  }
  
  return data[0];
}
