// Supabase Edge Function: nexo-ai (Groq AI Relay & Tool Calling Gateway)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Cabeçalho de autorização em falta." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://lkmborjgmznqdzigjzng.supabase.co";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    // Validate JWT token with Supabase Auth to extract auth.uid()
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Sessão inválida ou não autorizada." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Read GROQ_API_KEY from secure server environment ONLY
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY não configurada no ambiente do servidor." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const { messages, tools, systemPrompt } = await req.json();

    const messagesPayload = [
      { role: "system", content: systemPrompt },
      ...(messages || []),
    ];

    // Call Groq API server-side
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: messagesPayload,
        tools: tools,
        temperature: 0.2,
        max_tokens: 512,
      }),
    });

    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: errData?.error?.message || "Erro na API do Groq" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: groqResponse.status,
      });
    }

    const groqData = await groqResponse.json();
    const choice = groqData.choices?.[0]?.message;

    return new Response(JSON.stringify({ message: choice, userId: user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Erro interno no nexo-ai Edge Function" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
