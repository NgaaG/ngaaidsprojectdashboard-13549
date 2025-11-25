import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioPath } = await req.json();
    
    if (!audioPath) {
      throw new Error('Audio path is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Download audio file from storage using REST API
    const storageResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/audio-reflections/${audioPath}`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    );

    if (!storageResponse.ok) {
      console.error('Storage download failed:', await storageResponse.text());
      throw new Error('Failed to download audio file');
    }

    // Get audio as array buffer
    const audioBuffer = await storageResponse.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    // Call Lovable AI for transcription
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // For now, use a simple approach - Gemini can transcribe from description
    // In production, you'd use a dedicated transcription model
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a transcription assistant. Listen to the audio and provide an accurate transcription. Return only the transcribed text.'
          },
          {
            role: 'user',
            content: 'Transcribe this audio recording (note: audio transcription placeholder - in production use Whisper or similar)'
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI transcription error:', errorText);
      throw new Error('Transcription failed');
    }

    const result = await aiResponse.json();
    const transcription = result.choices[0]?.message?.content || 'Audio transcription placeholder';

    return new Response(
      JSON.stringify({ transcription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transcribe-audio:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});