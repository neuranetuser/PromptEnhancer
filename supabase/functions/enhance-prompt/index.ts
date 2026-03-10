import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { prompt, modelType = "7B", temperature = 0.7 } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required and must be a string" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const enhancedPrompt = enhancePromptSimulation(prompt, modelType, temperature);

    const data = {
      success: true,
      originalPrompt: prompt,
      enhancedPrompt,
      modelType,
      temperature,
    };

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function enhancePromptSimulation(
  prompt: string,
  modelType: string,
  temperature: number
): string {
  const templates = [
    `A highly detailed scene featuring ${prompt}. The composition follows a clear visual hierarchy with meticulous attention to lighting and atmosphere. The foreground presents the main subject with sharp focus and rich textures, while the middle ground provides contextual elements that support the narrative. The background is rendered with appropriate depth and atmospheric perspective. The overall image maintains a cohesive color palette and professional-grade visual quality, suitable for professional image generation.`,

    `${prompt} captured in a professional photography style. The scene is illuminated with carefully balanced lighting that creates depth and dimension. The main subject is positioned according to the rule of thirds, with supporting elements arranged to guide the viewer's eye through the composition. Fine details are preserved throughout, from the intricate textures in the foreground to the subtle gradations in the background. The color grading emphasizes the mood and atmosphere of the scene.`,

    `An immersive visualization of ${prompt}. The image is structured with a clear focal point, surrounded by carefully composed supporting elements. Lighting plays a crucial role, casting realistic shadows and highlights that enhance the three-dimensional quality of the scene. The texture work is highly detailed, from material properties to surface irregularities. The overall aesthetic balances realism with artistic vision, creating a compelling and believable image.`,
  ];

  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

  return selectedTemplate;
}
