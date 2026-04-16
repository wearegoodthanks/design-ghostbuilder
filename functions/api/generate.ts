// Cloudflare Pages Function - handles AI design generation
// This runs server-side so API keys stay safe

interface Env {
  GOOGLE_AI_API_KEY: string;
}

const STYLE_PROMPTS: Record<string, string> = {
  streetwear: "urban streetwear aesthetic, bold typography, graffiti influence, oversized graphic, hip hop culture, skate brand vibes",
  vintage: "retro vintage aesthetic, distressed worn-in look, 70s 80s 90s nostalgia, faded colors, classic americana, old school typography",
  minimal: "minimalist clean design, simple elegant typography, negative space, monochrome, scandinavian design influence, less is more",
  bold: "bold graphic design, eye-catching colors, large scale illustration, pop art influence, maximalist, attention grabbing",
  luxury: "luxury premium aesthetic, gold accents, sophisticated serif typography, high fashion influence, refined elegant, exclusive feel",
  sports: "athletic sports aesthetic, dynamic energy, performance branding, team sport influence, bold numbers and lettering, competition ready",
};

const PRODUCT_CONTEXT: Record<string, string> = {
  tee: "on a premium heavyweight cotton t-shirt, front chest placement",
  hoodie: "on a heavyweight pullover hoodie, front center placement",
  crew: "on a crew neck sweatshirt, front chest placement",
  cap: "on a structured snapback cap, front panel embroidery style",
};

const DESIGN_VARIATIONS = [
  { name: "Wordmark", prompt: "typographic wordmark logo design, brand name prominently featured as the main design element" },
  { name: "Graphic", prompt: "graphic logo mark with icon and text, illustrated emblem style" },
  { name: "Badge", prompt: "circular or shield badge design, vintage badge aesthetic with brand name" },
  { name: "Abstract", prompt: "abstract modern graphic design, contemporary art influence with brand name integrated" },
];

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body = await context.request.json() as {
      brandName: string;
      style: string;
      product: string;
    };

    const { brandName, style, product } = body;

    if (!brandName || !style || !product) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers,
      });
    }

    const apiKey = context.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers,
      });
    }

    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.streetwear;
    const productContext = PRODUCT_CONTEXT[product] || PRODUCT_CONTEXT.tee;

    // Generate 4 designs in parallel
    const designPromises = DESIGN_VARIATIONS.map(async (variation) => {
      const prompt = `Create a professional apparel graphic design for a brand called "${brandName}". 
Style: ${stylePrompt}. 
Design type: ${variation.prompt}. 
The design should look like it belongs ${productContext}.
Create ONLY the graphic design artwork on a plain solid dark background (#111111). 
No mockup, no product, just the design/artwork itself. 
High quality, print-ready, professional brand design.
The brand name "${brandName}" should be clearly visible in the design.`;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseModalities: ["IMAGE", "TEXT"],
                responseMimeType: "image/png",
              },
            }),
          }
        );

        if (!response.ok) {
          console.error(`Gemini API error: ${response.status}`);
          return { name: variation.name, image: null, error: `API error: ${response.status}` };
        }

        const data = await response.json() as any;
        
        // Extract image data from response
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));
        
        if (imagePart?.inlineData?.data) {
          return {
            name: variation.name,
            image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
            error: null,
          };
        }

        return { name: variation.name, image: null, error: "No image in response" };
      } catch (err) {
        console.error(`Generation error for ${variation.name}:`, err);
        return { name: variation.name, image: null, error: String(err) };
      }
    });

    const results = await Promise.all(designPromises);

    return new Response(JSON.stringify({ designs: results }), {
      status: 200,
      headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers,
    });
  }
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
