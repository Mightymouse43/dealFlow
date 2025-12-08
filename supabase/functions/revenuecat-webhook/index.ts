import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RevenueCatWebhookEvent {
  event: {
    type: string;
    app_user_id: string;
    product_id: string;
    purchased_at_ms: number;
    expiration_at_ms: number | null;
    period_type: string;
    store: string;
    entitlements: string[];
  };
  api_version: string;
}

const REVENUECAT_AUTHORIZATION_HEADER = Deno.env.get("REVENUECAT_WEBHOOK_SECRET") || "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || authHeader !== `Bearer ${REVENUECAT_AUTHORIZATION_HEADER}`) {
      console.error("Unauthorized webhook request");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookData: RevenueCatWebhookEvent = await req.json();
    const { event } = webhookData;

    console.log(`Received RevenueCat webhook event: ${event.type}`);
    console.log(`User ID: ${event.app_user_id}`);
    console.log(`Product ID: ${event.product_id}`);

    const userId = event.app_user_id;
    const hasPro = event.entitlements && event.entitlements.includes("DealFlow Pro");

    let subscriptionTier: "free" | "pro" = "free";
    let subscriptionExpires: string | null = null;

    switch (event.type) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "UNCANCELLATION":
        if (hasPro) {
          subscriptionTier = "pro";
          if (event.expiration_at_ms) {
            subscriptionExpires = new Date(event.expiration_at_ms).toISOString();
          }
        }
        break;

      case "CANCELLATION":
        if (event.expiration_at_ms) {
          subscriptionExpires = new Date(event.expiration_at_ms).toISOString();
        }
        subscriptionTier = "pro";
        break;

      case "EXPIRATION":
      case "BILLING_ISSUE":
        subscriptionTier = "free";
        subscriptionExpires = null;
        break;
    }

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        subscription_tier: subscriptionTier,
        subscription_expires: subscriptionExpires,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update user profile" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Updated user ${userId} subscription: ${subscriptionTier}`);

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});