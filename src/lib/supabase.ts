
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
    // Check if user has an active subscription first
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
      
    if (subError) {
      console.error('Error fetching subscription:', subError);
    }
    
    console.log("Subscription data:", subscription);
    
    // Set subscription info if active
    if (subscription) {
      response.hasSubscription = true;
      response.subscription = subscription;
      // When user has an active subscription, they don't need free usage
      // but we'll still set hasFreeUsage to true so they can generate memes
      response.hasFreeUsage = true;
      response.freeRemaining = 999; // Unlimited for subscribers
      console.log("User has active subscription, skipping free usage check");
      return response;
    }

    // Only check for free usage if user doesn't have an active subscription
    const { data: freeUsage, error: usageError } = await supabase
      .from('user_usage')
      .select('free_memes_remaining')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (usageError) {
      console.error('Error fetching user usage:', usageError);
    }
    
    console.log("User usage data:", freeUsage);

    // If no usage record exists, create one with default free memes
    if (!freeUsage) {
      console.log("No usage record found, creating one with 5 free memes");
      
      // Insert a new user_usage record with default 5 free memes
      const { error: insertError } = await supabase
        .from('user_usage')
        .insert({
          user_id: userId,
          free_memes_remaining: 5,
          total_memes_generated: 0
        });
        
      if (insertError) {
        console.error('Error creating user usage record:', insertError);
        
        // Even if insertion fails, set default values to allow initial usage
        response.hasFreeUsage = true;
        response.freeRemaining = 5;
      } else {
        response.hasFreeUsage = true;
        response.freeRemaining = 5;
      }
    } else if (freeUsage.free_memes_remaining > 0) {
      response.hasFreeUsage = true;
      response.freeRemaining = 5; // Always return 5 free memes
    }
    
    console.log("Final subscription response:", response);
    return response;
    
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    
    // Return conservative defaults on error, but allow first-time users to have free memes
    return {
      hasFreeUsage: true,
      freeRemaining: 5,
      hasSubscription: false
    };
  }
}

export async function decrementFreeUsage(userId: string) {
  try {
    console.log("Decrementing free usage for user:", userId);
    
    // First check if user has an active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
      
    // If user has an active subscription, no need to decrement free usage
    if (subscription) {
      console.log("User has active subscription, not decrementing free usage");
      
      // Update total memes generated
      const { error: updateError } = await supabase
        .from('user_usage')
        .upsert({
          user_id: userId,
          free_memes_remaining: 5, // Keep at max
          total_memes_generated: supabase.rpc('increment_counter', { row_id: userId })
        }, {
          onConflict: 'user_id'
        });
        
      if (updateError) {
        console.error('Error updating meme count:', updateError);
      }
      
      return true;
    }
    
    // If no subscription, proceed with checking/updating free usage
    const { data: currentUsage, error: fetchError } = await supabase
      .from('user_usage')
      .select('free_memes_remaining, total_memes_generated')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching current usage:', fetchError);
    }
    
    if (!currentUsage) {
      console.log("No usage record found, creating one with 5 free memes remaining");
      const { error: createError } = await supabase
        .from('user_usage')
        .insert({
          user_id: userId,
          free_memes_remaining: 5, // Always keep at 5
          total_memes_generated: 1
        });
        
      if (createError) {
        console.error('Error creating user usage record:', createError);
        return false;
      }
      return true;
    }
    
    console.log("Current usage:", currentUsage);
    
    // Only track meme generation, don't decrement free memes
    const { error: updateError } = await supabase
      .from('user_usage')
      .update({
        free_memes_remaining: 5, // Always keep at 5
        total_memes_generated: (currentUsage.total_memes_generated || 0) + 1
      })
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Error updating meme usage:', updateError);
      return false;
    }
      
    console.log("Successfully updated meme usage");
    return true;
    
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
