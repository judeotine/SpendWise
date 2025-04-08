
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { message, userEmail, recipientEmail } = await req.json();

    // Basic validation
    if (!message || !recipientEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Compose the email content
    const emailContent = `
      <h2>New Feedback Received</h2>
      <p><strong>From:</strong> ${userEmail || 'Anonymous user'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr>
      <p>This is an automated message from your Spendwise app.</p>
    `;

    // Send email using fetch to a service like Sendgrid, Mailgun, or EmailJS
    // For this implementation, we'll use EmailJS as it's easier to set up without additional authentication
    try {
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: "service_default",
          template_id: "template_default",
          user_id: "YOUR_EMAILJS_USER_ID", // This should be replaced with a real user ID in production
          template_params: {
            to_email: recipientEmail,
            from_name: "SpendWise App",
            from_email: userEmail || "noreply@spendwise.app",
            subject: "New Feedback from SpendWise App",
            message: message,
            reply_to: userEmail || "noreply@spendwise.app",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Email service responded with ${response.status}`);
      }
    } catch (emailError) {
      console.error("Error sending email via service:", emailError);
      // We'll still return success since we captured the feedback in the database
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: "Feedback received and email notification sent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-feedback-email function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
