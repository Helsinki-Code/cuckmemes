
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.2.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the API key from environment variables
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);

    // Parse the request body
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      throw new Error("No image provided");
    }

    // Get the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    // Create generation config
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 256,
    };

    // Prepare the image data
    const imageData = {
      mimeType: "image/jpeg", // Adjust based on the image type
      data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
    };

    // Send the prompt with the image
    console.log("Sending prompt to Gemini API...");
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: "Generate a humorous two-part cuckold-themed meme text for this image. Format the response as JSON with 'topText' and 'bottomText' fields. Keep each line under 60 characters and make it funny but not overly offensive." },
            { inlineData: imageData }
          ]
        }
      ],
      generationConfig,
    });

    console.log("Received response from Gemini API");
    const responseText = result.response.text();
    
    try {
      // Try to parse as JSON
      const jsonMatch = responseText.match(/{[\s\S]*}/);
      if (jsonMatch) {
        const jsonResponse = JSON.parse(jsonMatch[0]);
        console.log("Parsed JSON response:", jsonResponse);
        return new Response(JSON.stringify(jsonResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // If no valid JSON found, extract top and bottom text manually
      const lines = responseText.split('\n').filter(line => line.trim());
      const response = {
        topText: lines[0] || "When you think she's just going out with friends",
        bottomText: lines[1] || "But she comes home with another man's scent"
      };
      console.log("Extracted text response:", response);
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      // Fallback to default text if parsing fails
      return new Response(JSON.stringify({
        topText: "When you think she's just going out with friends",
        bottomText: "But she comes home with another man's scent"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error("Error generating meme text:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
