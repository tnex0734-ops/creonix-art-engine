import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STYLE_PROMPTS: Record<string, string> = {
  "Flat 2.0": "modern flat 2.0 illustration, clean vector shapes, subtle gradients, soft shadows, professional design",
  "Isometric": "isometric illustration, 30-degree projection, geometric perspective, clean vector style, vibrant colors",
  "3D Clay": "3D clay render illustration, soft matte surfaces, rounded shapes, claymation aesthetic, soft studio lighting",
  "Glassmorphism": "glassmorphism illustration, frosted translucent glass elements, blurred backgrounds, vibrant gradients, soft glow",
  "Retro Revival": "retro 70s revival illustration, warm muted palette, grainy texture, vintage poster aesthetic",
  "Psychedelic": "psychedelic illustration, swirling shapes, vivid trippy colors, 60s poster art, kaleidoscopic patterns",
  "Cartoon / Character": "expressive cartoon character illustration, bold outlines, exaggerated features, vibrant cel-shaded colors",
  "Digital Collage": "digital collage illustration, cutout magazine aesthetic, layered torn paper, mixed media, eclectic composition",
  "Nature / Eco": "nature eco illustration, organic botanical elements, earthy palette, leafy textures, sustainable mood",
  "Hand-drawn / Sketch": "hand-drawn sketch illustration, pencil and ink lines, loose strokes, artistic crosshatching, paper texture",
  "Doodle / Whimsical": "whimsical doodle illustration, playful hand-drawn icons, scattered marks, marker style, joyful and quirky",
  "Folk / Cultural Art": "folk cultural art illustration, traditional ornamental patterns, symbolic motifs, rich heritage palette",
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    // Get user from JWT
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
    const fullPrompt = `${styleHint}. Subject: ${prompt}. High quality illustration, no text, no watermark, centered composition, white background.`;

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
      console.error("AI error", aiRes.status, t);
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
    if (!dataUrl) throw new Error("No image returned from AI");

    // dataUrl looks like: data:image/png;base64,XXXX
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

    // Insert generation row (using user-scoped client respects RLS)
    const { data: gen, error: insErr } = await userClient
      .from("generations")
      .insert({ user_id: userId, prompt, style, image_url: imageUrl })
      .select()
      .single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ generation: gen, imageUrl }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-illustration error", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
