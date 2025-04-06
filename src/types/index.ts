
export interface Meme {
  id: string;
  user_id: string;
  image_url: string;
  top_text: string;
  bottom_text: string;
  created_at: string;
}

export interface UserUsage {
  user_id: string;
  free_memes_remaining: number;
  total_memes_generated: number;
}

export interface Subscription {
  id: number;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_type: 'basic' | 'premium';
  status: 'active' | 'canceled' | 'past_due';
  current_period_end: string;
}

export interface UserSubscriptionInfo {
  hasFreeUsage: boolean;
  freeRemaining: number;
  hasSubscription: boolean;
  subscription?: Subscription;
}
