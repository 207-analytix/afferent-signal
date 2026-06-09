import { GoogleGenAI, Type } from "npm:@google/genai";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type IntentType = "OUT_OF_STOCK" | "PRODUCT_REQUEST" | "LOCATION_INQUIRY" | "UNCLEAR";

type ExtractedSignal = {
  product_category: string;
  inferred_brand: string;
  specific_item_descriptors: string[];
  intent_type: IntentType;
  urgency_score: number;
};

const schema = {
  type: Type.OBJECT,
  properties: {
    product_category: { type: Type.STRING },
    inferred_brand: { type: Type.STRING },
    specific_item_descriptors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    intent_type: {
      type: Type.STRING,
      enum: ["OUT_OF_STOCK", "PRODUCT_REQUEST", "LOCATION_INQUIRY", "UNCLEAR"],
    },
    urgency_score: { type: Type.INTEGER, minimum: 1, maximum: 5 },
  },
  required: [
    "product_category",
    "inferred_brand",
    "specific_item_descriptors",
    "intent_type",
    "urgency_score",
  ],
};

const systemInstruction = `
You are the inline triage firewall for Afferent Signal, a hyper-local consumer intent platform.
Your job is to convert raw retail shopper text into structured intent signals.

Rules:
- Ignore greetings, filler words, sarcasm unless it changes shopping intent.
- Focus on the highest-value retail meaning in the sentence.
- product_category must be lowercase normalized, e.g. soda, chips, cereal.
- inferred_brand must be capitalized normally, or exactly Unknown if uncertain.
- specific_item_descriptors should capture size, flavor, pack type, attributes, variants.
- intent_type must be one of:
  OUT_OF_STOCK: shopper indicates desired item is unavailable.
  PRODUCT_REQUEST: shopper asks for a product the store should carry.
  LOCATION_INQUIRY: shopper asks where an item is in the store.
  UNCLEAR: insufficient signal or mostly noise.
- urgency_score must be 1 to 5.
  1 = weak / casual
  3 = clear request
  5 = strong frustration, repeat unmet demand, or immediate purchase intent.
- Return only valid JSON matching the schema.
`;

function normalizeOutput(data: Partial<ExtractedSignal>): ExtractedSignal {
  return {
    product_category: String(data.product_category ?? "unknown").trim().toLowerCase() || "unknown",
    inferred_brand: (() => {
      const v = String(data.inferred_brand ?? "Unknown").trim();
      if (!v) return "Unknown";
      if (v.toLowerCase() === "unknown") return "Unknown";
      return v.charAt(0).toUpperCase() + v.slice(1);
    })(),
    specific_item_descriptors: Array.isArray(data.specific_item_descriptors)
      ? data.specific_item_descriptors.map((s) => String(s).trim()).filter(Boolean)
      : [],
    intent_type: (["OUT_OF_STOCK", "PRODUCT_REQUEST", "LOCATION_INQUIRY", "UNCLEAR"] as IntentType[]).includes(data.intent_type as IntentType)
      ? (data.intent_type as IntentType)
      : "UNCLEAR",
    urgency_score: Math.max(1, Math.min(5, Number(data.urgency_score ?? 1) || 1)),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { store_id, raw_input, session_id } = body ?? {};

    if (!store_id || !raw_input || !session_id) {
      return new Response(JSON.stringify({ error: "store_id, raw_input, and session_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (String(raw_input).length > 500) {
      return new Response(JSON.stringify({ error: "raw_input exceeds 500 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const googleApiKey = Deno.env.get("GOOGLE_API_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const ai = new GoogleGenAI({ apiKey: googleApiKey });
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    let extracted: ExtractedSignal | null = null;
    let processing_status = "TRIAGED";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.1,
        },
        contents: [{ role: "user", parts: [{ text: String(raw_input) }] }],
      });

      const parsed = JSON.parse(response.text ?? "{}");
      extracted = normalizeOutput(parsed);
    } catch (_err) {
      processing_status = "PENDING_MANUAL_TRIAGE";
    }

    const insertPayload = {
      store_id: String(store_id),
      raw_input: String(raw_input),
      session_id: String(session_id),
      ai_extracted_category: extracted?.product_category ?? null,
      ai_extracted_brand: extracted?.inferred_brand ?? null,
      ai_descriptors: extracted?.specific_item_descriptors ?? [],
      intent_type: extracted?.intent_type ?? null,
      urgency_score: extracted?.urgency_score ?? null,
      processing_status,
    };

    const { data, error } = await supabase
      .from("intent_signals")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ signal: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unhandled error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
