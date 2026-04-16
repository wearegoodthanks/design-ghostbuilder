// Cloudflare Pages Function - handles design generation + lifestyle mockups

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

const MOCKUP_SCENES: Record<string, string[]> = {
  tee: [
    "worn by a person standing casually in an urban street setting, professional product photography, natural lighting",
    "laid flat on a concrete surface, styled with accessories, overhead shot, studio lighting",
    "worn by a person in a creative studio space, candid lifestyle shot, warm lighting",
    "hanging on a wooden hanger against a textured wall, clean product photography, soft shadows",
  ],
  hoodie: [
    "worn by a person in a city street at dusk, lifestyle photography, moody lighting",
    "laid flat on a dark wooden surface with coffee and accessories, overhead flat lay",
    "worn by a person leaning against a brick wall, urban lifestyle, natural light",
    "folded neatly on a shelf in a premium retail store display",
  ],
  crew: [
    "worn by a person in a minimalist cafe setting, lifestyle photography, warm tones",
    "laid flat on linen fabric, styled overhead shot, soft natural lighting",
    "worn casually tucked into jeans, street style photography",
    "displayed on a mannequin in a boutique store setting",
  ],
  cap: [
    "worn by a person outdoors, street style portrait, shallow depth of field",
    "placed on a dark surface next to sunglasses, styled product shot",
    "worn backwards by a person in an urban setting, lifestyle shot",
    "displayed on a cap stand against a textured background",
  ],
};

// Only 3 AI variations now (design #1 is the user's original logo)
const DESIGN_VARIATIONS = [
  { name: "Graphic", prompt: "graphic logo mark with icon and text, illustrated emblem style" },
  { name: "Badge", prompt: "circular or shield badge design, vintage badge aesthetic with brand name" },
  { name: "Abstract", prompt: "abstract modern graphic design, contemporary art influence with brand name integrated" },
];

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

async function generateImage(apiKey: string, contentParts: any[]): Promise<{ image: string | null; error: string | null }> {
  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: contentParts }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    });

    if (!response.ok) {
      return { image: null, error: `API error: ${response.status}` };
    }

    const data = await response.json() as any;
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));

    if (imagePart?.inlineData?.data) {
      return {
        image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
        error: null,
      };
    }

    return { image: null, error: "No image in response" };
  } catch (err) {
    return { image: null, error: String(err) };
  }
}

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
      color: string;
      logoBase64?: string;
      logoMimeType?: string;
    };

    const { brandName, style, product, color = "charcoal", logoBase64, logoMimeType } = body;
    const hasLogo = Boolean(logoBase64 && logoMimeType);

    if (!brandName || !style || !product) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
    }

    const apiKey = context.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), { status: 500, headers });
    }

    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.streetwear;
    const productContext = PRODUCT_CONTEXT[product] || PRODUCT_CONTEXT.tee;
    const scenes = MOCKUP_SCENES[product] || MOCKUP_SCENES.tee;

    const logoContext = hasLogo
      ? `I have attached the brand's existing logo. Use this logo as a reference - incorporate its style, colors, and visual identity into the design. The design should feel like it belongs to the same brand.`
      : ``;

    const colorNames: Record<string, string> = {
      black: "black",
      charcoal: "dark charcoal grey",
      white: "white",
      navy: "navy blue",
      forest: "forest green",
      maroon: "maroon burgundy",
    };
    const garmentColor = colorNames[color] || "dark charcoal grey";
    
    // Determine if design should use light or dark elements based on garment
    const lightGarment = color === "white";
    const designColorInstruction = lightGarment
      ? "The design elements must use DARK colors (black, dark grey, dark accents) so they contrast on the light garment."
      : "The design elements must use WHITE, light colors, or bright accent colors so they contrast on the dark garment.";

    const productNames: Record<string, string> = {
      tee: `${garmentColor} heavyweight premium t-shirt`,
      hoodie: `${garmentColor} heavyweight pullover hoodie`,
      crew: `${garmentColor} crew neck sweatshirt`,
      cap: `${garmentColor} structured snapback cap`,
    };

    // STEP 1: If user uploaded a logo, create mockup of original logo first
    let originalMockup: { name: string; design: string | null; mockup: string | null; error: string | null } | null = null;
    
    if (hasLogo) {
      const logoDataUrl = `data:${logoMimeType};base64,${logoBase64}`;
      const scene = scenes[0];
      const mockupPrompt = `Place this logo/design onto a ${productNames[product] || "charcoal t-shirt"}.
Use a ${garmentColor} colored garment.
Show the product ${scene}.
The design should be clearly visible, properly scaled and centered on the product.
Photorealistic, professional product photography.
Do NOT add any text, watermarks, or labels. Just the product with the design.`;

      const mockupResult = await generateImage(apiKey, [
        { text: mockupPrompt },
        { inlineData: { mimeType: logoMimeType, data: logoBase64 } },
      ]);

      originalMockup = {
        name: "Your Design",
        design: logoDataUrl,
        mockup: mockupResult.image,
        error: mockupResult.error,
      };
    }

    // STEP 2: Generate 3 new design variations in parallel
    const designPromises = DESIGN_VARIATIONS.map(async (variation) => {
      const prompt = `Create a professional apparel graphic design for a brand called "${brandName}". 
${logoContext}
Style: ${stylePrompt}. 
Design type: ${variation.prompt}. 
The design should look like it belongs ${productContext}.
Create ONLY the graphic design artwork on a plain solid dark background (#111111). 
No mockup, no product, just the design/artwork itself. 
${designColorInstruction}
High quality, print-ready, professional brand design.
The brand name "${brandName}" should be clearly visible in the design.`;

      const contentParts: any[] = [{ text: prompt }];
      if (hasLogo) {
        contentParts.push({ inlineData: { mimeType: logoMimeType, data: logoBase64 } });
      }

      return generateImage(apiKey, contentParts);
    });

    const designResults = await Promise.all(designPromises);

    // STEP 3: Generate lifestyle mockups for the new designs
    const mockupPromises = designResults.map(async (design, i) => {
      if (!design.image) {
        return { name: DESIGN_VARIATIONS[i].name, design: null, mockup: null, error: design.error };
      }

      const base64Match = design.image.match(/^data:([^;]+);base64,(.+)$/);
      if (!base64Match) {
        return { name: DESIGN_VARIATIONS[i].name, design: design.image, mockup: null, error: "Invalid design data" };
      }

      const [, mimeType, b64Data] = base64Match;
      // Offset scene index by 1 since original logo uses scene[0]
      const scene = scenes[(i + 1) % scenes.length];

      const mockupPrompt = `Place this graphic design onto a ${productNames[product] || "charcoal t-shirt"}.
Use a ${garmentColor} colored garment.
Show the product ${scene}.
The design should be clearly visible, properly scaled and centered on the product.
Photorealistic, professional product photography.
Do NOT add any text, watermarks, or labels. Just the product with the design.`;

      const mockupResult = await generateImage(apiKey, [
        { text: mockupPrompt },
        { inlineData: { mimeType, data: b64Data } },
      ]);

      return {
        name: DESIGN_VARIATIONS[i].name,
        design: design.image,
        mockup: mockupResult.image,
        error: mockupResult.error,
      };
    });

    const variationResults = await Promise.all(mockupPromises);

    // Combine: original logo mockup first, then variations
    const allDesigns = originalMockup
      ? [originalMockup, ...variationResults]
      : variationResults;

    return new Response(JSON.stringify({ designs: allDesigns }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
