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
    const { prompt, style, transparent } = await req.json();
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
    const bgInstruction = transparent
      ? "The illustration MUST have a fully transparent background (no background color, no scenery, no backdrop) — only the subject on transparent. Output as PNG with alpha channel."
      : "Include a clean, complementary background.";
    const fullPrompt = `Create a professional illustration in ${style} style. ${prompt}. Style details: ${styleHint}. ${bgInstruction} The illustration should be clean, vector-like, suitable for designers and graphic artists. High quality, detailed, with clear composition, no text, no watermark, centered.`;

    // Lovable AI Gateway — Nano Banana 2 (fast, pro-quality image gen)
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [{ role: "user", content: fullPrompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const dataUrl: string | undefined = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!dataUrl) {
      console.error("No image in AI response:", JSON.stringify(aiData).slice(0, 500));
      throw new Error("No image returned from AI");
    }

    const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image data");
    const mime = match[1];
    const ext = mime.split("/")[1].replace("+xml", "");
    const b64 = match[2];

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
