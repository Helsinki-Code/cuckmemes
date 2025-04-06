
import { supabase } from "./supabase";

export interface GeminiResponse {
  topText: string;
  bottomText: string;
}

export async function generateMemeText(imageBase64: string): Promise<GeminiResponse> {
  try {
    console.log("Calling Gemini API through edge function");
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("gemini-generate", {
      body: { imageBase64 },
    });

    if (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }

    console.log("Gemini API response:", data);
    return data as GeminiResponse;
  } catch (error) {
    console.error("Error generating meme text:", error);
    
    // Fallback responses in case of error
    return {
      topText: "When she says she's just going out with friends",
      bottomText: "But comes home with another man's scent"
    };
  }
}
