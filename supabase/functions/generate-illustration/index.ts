import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STYLE_PROMPTS: Record<string, string> = {
  "Flat 2.0": "flat design style with subtle shadows, clean geometric shapes, modern color palette",
  "Isometric": "isometric 3D perspective, geometric precision, clean lines, technical illustration style",
  "3D Clay": "soft 3D claymation style, inflated rounded shapes, pastel colors, playful feel",
  "Glassmorphism": "glass morphism style, frosted glass effect, translucent surfaces, soft blur backgrounds",
  "Retro Revival": "retro vintage style, 1960s-70s inspired, bold colors, groovy shapes, nostalgic feel",
  "Psychedelic": "psychedelic art style, vibrant surreal colors, mind-bending patterns, 60s inspired",
  "Cartoon / Character": "cartoon illustration style, bold outlines, expressive characters, bright colors",
  "Digital Collage": "digital collage style, layered mixed media, cut-and-paste aesthetic, editorial feel",
  "Nature / Eco": "nature-inspired illustration, organic shapes, earthy tones, botanical elements",
  "Hand-drawn / Sketch": "hand-drawn sketch style, pencil or ink feel, organic imperfect lines, artisanal",
  "Doodle / Whimsical": "whimsical doodle style, playful spontaneous lines, fun childlike energy",
  "Folk / Cultural Art": "folk art style, cultural heritage patterns, traditional motifs, handcraft aesthetic",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, style } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.length < 3) {
      return new Response(JSON.stringify({ error: "Prompt is required (min 3 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!style || typeof style !== "string") {
      return new Response(JSON.stringify({ error: "Style is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    // Auth
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const styleHint = STYLE_PROMPTS[style] ?? style;
    const fullPrompt = `Create a professional illustration in ${style} style. ${prompt}. Style details: ${styleHint}. The illustration should be clean, vector-like, suitable for designers and graphic artists. High quality, detailed, with clear composition, no text, no watermark, centered.`;

    // Call Google Gemini directly
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      }
    );

    if (!geminiRes.ok) {
      const t = await geminiRes.text();
      console.error("Gemini error", geminiRes.status, t);
      if (geminiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Gemini API error", details: t.slice(0, 500) }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await geminiRes.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData || p.inline_data);
    const inline = imagePart?.inlineData ?? imagePart?.inline_data;
    if (!inline?.data) {
      console.error("No image in Gemini response:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "Generation failed", details: data }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mime = inline.mimeType ?? inline.mime_type ?? "image/png";
    const b64 = inline.data;
    const ext = (mime.split("/")[1] ?? "png").replace("+xml", "");

    // Decode → upload to storage
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const filename = `${userId}/${crypto.randomUUID()}.${ext}`;
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error: upErr } = await admin.storage
      .from("illustrations")
      .upload(filename, bytes, { contentType: mime, upsert: false });
    if (upErr) throw upErr;

    const { data: pub } = admin.storage.from("illustrations").getPublicUrl(filename);
    const imageUrl = pub.publicUrl;

    const { data: gen, error: insErr } = await userClient
      .from("generations")
      .insert({ user_id: userId, prompt, style, image_url: imageUrl })
      .select()
      .single();
    if (insErr) throw insErr;

    return new Response(
      JSON.stringify({ generation: gen, imageUrl, imageData: b64, mimeType: mime }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-illustration error", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
