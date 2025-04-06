
import { createClient } from '@supabase/supabase-js';
import { UserSubscriptionInfo } from '@/types';

const supabaseUrl = 'https://fxpdgbvveojnrygkmaug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4cGRnYnZ2ZW9qbnJ5Z2ttYXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNDY3ODgsImV4cCI6MjA1ODcyMjc4OH0.vhIwwChuMik6oGWqmEKAoUiItPOd5Hww8wr8sRnoW-I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUserSubscription(userId: string): Promise<UserSubscriptionInfo> {
  console.log("Fetching subscription info for user:", userId);
  
  // Initialize default response
  let response: UserSubscriptionInfo = {
    hasFreeUsage: false,
    freeRemaining: 0,
    hasSubscription: false
  };
  
  try {
    // Check if user has remaining free memes
    const { data: freeUsage, error: usageError } = await supabase
      .from('user_usage')
      .select('free_memes_remaining')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (usageError) {
      console.error('Error fetching user usage:', usageError);
    }

    // Check if user has an active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
      
    if (subError) {
      console.error('Error fetching subscription:', subError);
    }
    
    console.log("User usage data:", freeUsage);
    console.log("Subscription data:", subscription);

    // If no usage record exists, create one with default free memes
    if (!freeUsage) {
      console.log("No usage record found, creating one with 5 free memes");
      const { error: createError } = await supabase
        .from('user_usage')
        .insert({
          user_id: userId,
          free_memes_remaining: 5,
          total_memes_generated: 0
        });
        
      if (createError) {
        console.error('Error creating user usage record:', createError);
      } else {
        response.hasFreeUsage = true;
        response.freeRemaining = 5;
      }
    } else if (freeUsage.free_memes_remaining > 0) {
      response.hasFreeUsage = true;
      response.freeRemaining = freeUsage.free_memes_remaining;
    }

    // Set subscription info if active
    if (subscription) {
      response.hasSubscription = true;
      response.subscription = subscription;
    }
    
    console.log("Final subscription response:", response);
    return response;
    
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    
    // Return conservative defaults on error
    return {
      hasFreeUsage: false,
      freeRemaining: 0,
      hasSubscription: false
    };
  }
}

export async function decrementFreeUsage(userId: string) {
  try {
    console.log("Decrementing free usage for user:", userId);
    
    const { data: currentUsage, error: fetchError } = await supabase
      .from('user_usage')
      .select('free_memes_remaining')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching current usage:', fetchError);
      return false;
    }
    
    if (!currentUsage) {
      console.log("No usage record found, creating one with 4 free memes remaining");
      const { error: createError } = await supabase
        .from('user_usage')
        .insert({
          user_id: userId,
          free_memes_remaining: 4, // Start with 5, minus 1 for current usage
          total_memes_generated: 1
        });
        
      if (createError) {
        console.error('Error creating user usage record:', createError);
        return false;
      }
      return true;
    }
    
    // Only decrement if user has remaining free memes
    if (currentUsage.free_memes_remaining > 0) {
      const { error: updateError } = await supabase
        .from('user_usage')
        .update({
          free_memes_remaining: currentUsage.free_memes_remaining - 1,
          total_memes_generated: supabase.rpc('increment_counter', { row_id: userId })
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('Error decrementing free memes:', updateError);
        return false;
      }
      
      console.log("Successfully decremented free usage");
      return true;
    }
    
    console.log("No free memes remaining to decrement");
    return false;
    
  } catch (error) {
    console.error('Error in decrementFreeUsage:', error);
    return false;
  }
}

export async function saveMeme(userId: string, imageUrl: string, topText: string, bottomText: string) {
  try {
    console.log("Saving meme for user:", userId);
    
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
    
    console.log("Meme saved successfully:", data[0]);
    return data[0];
  } catch (error) {
    console.error('Error in saveMeme:', error);
    return null;
  }
}
