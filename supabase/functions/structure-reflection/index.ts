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
    const { brainDumpText, currentMode } = await req.json();
    
    if (!brainDumpText) {
      throw new Error('Brain dump text is required');
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = currentMode === 'personal' 
      ? `You are a reflection structuring assistant. Analyze the brain dump text and extract structured information.

Return a JSON object with:
{
  "mood": "calm|anxious|focused|overwhelmed|energized",
  "thoughtsWhatIThink": "What the person thinks/feels (subjective perspective)",
  "thoughtsWhatIsTrue": "Objective truth/reality separate from feelings",
  "contingencyPlan": "Actionable plan if things don't go as expected",
  "todoList": ["task 1", "task 2", "task 3"]
}

Focus on:
- Detecting emotional state from tone and word choice
- Separating subjective thoughts from objective reality
- Identifying concrete action items
- Creating a practical contingency plan`
      : `You are a lecture reflection structuring assistant. Analyze the sprint reflection and extract structured information.

Return a JSON object with:
{
  "mood": "calm|anxious|focused|overwhelmed|energized",
  "thoughtsWhatIThink": "Summary of what was accomplished this sprint",
  "thoughtsWhatIsTrue": "Challenges faced and how they were solved",
  "contingencyPlan": "Next steps and action items for the next sprint",
  "todoList": ["task 1", "task 2", "task 3"]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Brain dump:\n\n${brainDumpText}` }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI structuring error:', errorText);
      throw new Error('Failed to structure reflection');
    }

    const result = await aiResponse.json();
    const structuredData = JSON.parse(result.choices[0]?.message?.content || '{}');

    return new Response(
      JSON.stringify(structuredData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in structure-reflection:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});