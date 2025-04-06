
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUserSubscription(userId: string) {
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
        bottom_text: bottomText,
        created_at: new Date()
      }
    ])
    .select();
    
  if (error) {
    console.error('Error saving meme:', error);
    return null;
  }
  
  return data[0];
}
