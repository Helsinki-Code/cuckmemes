
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@12.18.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });
  
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  
  if (!webhookSecret) {
    return new Response(
      JSON.stringify({ error: "Webhook secret not found" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }

  try {
    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "No signature found" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Get the body as text
    const body = await req.text();
    
    // Create the event
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        if (session.mode === 'subscription' && session.payment_status === 'paid') {
          const userId = session.client_reference_id;
          const plan = session.metadata?.plan;
          const stripeCustomerId = session.customer;
          const stripeSubscriptionId = session.subscription;
          
          if (userId && plan && stripeCustomerId && stripeSubscriptionId) {
            // Get subscription details from Stripe
            const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
            const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
            
            // Store the subscription information in the database
            const { error } = await supabaseClient
              .from('subscriptions')
              .insert({
                user_id: userId,
                stripe_customer_id: stripeCustomerId,
                stripe_subscription_id: stripeSubscriptionId,
                plan_type: plan,
                status: 'active',
                current_period_end: currentPeriodEnd.toISOString()
              });
              
            if (error) {
              console.error('Error inserting subscription record:', error);
            }
          }
        }
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId) {
          // Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          
          // Update the subscription information in the database
          const { error } = await supabaseClient
            .from('subscriptions')
            .update({
              status: 'active',
              current_period_end: currentPeriodEnd.toISOString()
            })
            .eq('stripe_subscription_id', subscriptionId);
            
          if (error) {
            console.error('Error updating subscription record:', error);
          }
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Update the subscription information in the database
        const { error } = await supabaseClient
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
          
        if (error) {
          console.error('Error updating subscription record:', error);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Update the subscription status to 'canceled' in the database
        const { error } = await supabaseClient
          .from('subscriptions')
          .update({
            status: 'canceled'
          })
          .eq('stripe_subscription_id', subscription.id);
          
        if (error) {
          console.error('Error updating subscription record:', error);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});
