import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AnalysisResult {
  needsModelGeneration: boolean;
  needsJewelryGeneration: boolean;
  reasoning: string;
  jewelryCategory?: string;
  suggestedModelPrompt?: string;
  suggestedJewelryPrompt?: string;
}

/**
 * Analyzes the request using OpenAI to determine what needs to be generated
 */
export async function analyzeRequest(
  prompt: string,
  referenceImages: string[] = []
): Promise<AnalysisResult> {
  const analysisPrompt = `
  CONTEXT-AWARE JEWELRY TRY-ON REQUEST ANALYSIS
  
  User Request: "${prompt}"
  Reference images provided: ${referenceImages.length}
  
  TASK: Extract and utilize ALL context from the user's request to inform decision-making and prompt generation for virtual jewelry try-on.
  
  DECISION FRAMEWORK - Use user request context to determine:
  1. Generate new model/person image (if no suitable person image provided OR user specifies model preferences)
  2. Generate jewelry image (if no jewelry reference provided OR user describes specific jewelry requirements)
  3. Utilize provided reference images directly
  
  COMPREHENSIVE JEWELRY CATEGORIES & CONTEXT MAPPING:
  - rings: Wedding bands, engagement rings, solitaire, eternity, statement, cocktail, signet, class rings, mood rings
    * Context extraction: Ring style, finger placement, hand pose, materials (gold/silver/platinum), gemstones, occasion
  - necklaces: Chains, chokers, statement pieces, layered styles, pearl strands, collar necklaces, lariats, rivières
    * Context extraction: Chain length (choker/princess/matinee/opera), pendant presence, neckline compatibility, layering
  - earrings: Studs, hoops, dangles, drops, chandeliers, huggies, crawlers, cuffs, threaders, jackets
    * Context extraction: Ear coverage, size preference, style (minimalist/statement), materials, comfort requirements
  - bracelets: Tennis, bangles, charm, cuff, link, beaded, wrap, bolo, medical alert
    * Context extraction: Wrist size, stacking preferences, bracelet width, closure type, daily wear vs special occasion
  - pendants: Lockets, charms, medallions, gemstone drops, crosses, hearts, initials, birthstones
    * Context extraction: Pendant size, personal significance, chain compatibility, symbolic meaning
  - watches: Dress, sport, dive, pilot, smartwatches, vintage, luxury, fashion watches
    * Context extraction: Use case (daily/sports/formal), band material, face size, tech features, brand preferences
  - anklets: Chain, beaded, charm, tennis, rope, slave anklets
    * Context extraction: Ankle size, style preference, beach/casual wear, layering with other accessories
  
  CONTEXT-DRIVEN MODEL PROMPT GENERATION:
  Extract and use from user request:
  - Demographics: Age range, gender identity, ethnicity (if specified)
  - Physical attributes: Skin tone, hair color/style, facial features, body type (if mentioned)
  - Style context: Professional, casual, elegant, bohemian, modern, vintage, edgy, romantic
  - Pose requirements based on jewelry category and user preferences
  - Setting/environment: Studio, outdoor, home, office, special event
  - Lighting preferences: Natural, dramatic, soft, professional
  - User's specific aesthetic goals or inspiration references
  
  CONTEXT-DRIVEN JEWELRY PROMPT GENERATION:
  Extract and use from user request:
  - Exact jewelry descriptions, brand references, style inspirations
  - Material specifications: Metal types, gemstones, finishes, textures
  - Size and fit requirements: Dimensions, weight preferences, comfort factors
  - Occasion context: Wedding, everyday wear, formal events, gift-giving, professional settings
  - Personal significance: Symbolic meaning, cultural relevance, emotional connection
  - Technical details: Settings, clasps, movement types (for watches), certification requirements
  - Budget or value tier implications: Luxury, mid-range, fashion jewelry
  
  UTILIZE USER'S EXACT LANGUAGE: Incorporate the user's specific terminology, brand mentions, style descriptors, and emotional language throughout all generated prompts.
  
  Respond with JSON in this exact format:
  {
    "needsModelGeneration": boolean,
    "needsJewelryGeneration": boolean,
    "reasoning": "comprehensive analysis using extracted user context, including detected jewelry category, specific user preferences, and contextual factors influencing decisions",
    "jewelryCategory": "rings|necklaces|earrings|bracelets|pendants|watches|anklets|other",
    "suggestedModelPrompt": "if needed: detailed portrait prompt incorporating user's demographic, style, and pose preferences with category-appropriate positioning",
    "suggestedJewelryPrompt": "if needed: comprehensive jewelry description using user's exact specifications, materials, style references, and contextual requirements"
  }
  `;

  console.log("Analyzing request with OpenAI...");

  const analysisResponse = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an expert AI assistant specializing in virtual jewelry try-on applications with deep knowledge of jewelry categories, fashion styling, and contextual image generation.

CORE EXPERTISE:
- Comprehensive jewelry categorization and styling knowledge across all major jewelry types
- Advanced prompt engineering for AI image generation models
- Context extraction and utilization from natural language requests
- Fashion and styling principles for jewelry presentation
- Cultural and demographic considerations in jewelry styling

ANALYSIS METHODOLOGY:
1. CONTEXT EXTRACTION: Parse user requests to identify explicit and implicit preferences, requirements, and contextual factors
2. DECISION LOGIC: Make intelligent choices about image generation needs based on available references and user intent
3. PROMPT ENGINEERING: Create detailed, context-aware prompts that reflect user specifications and aesthetic goals
4. CATEGORY EXPERTISE: Apply specialized knowledge for each jewelry category's unique requirements and styling considerations

JEWELRY DOMAIN KNOWLEDGE:
- Technical specifications: Materials, settings, cuts, clarity, carat weights, band widths, chain lengths
- Style classifications: Traditional, contemporary, vintage, minimalist, statement, bohemian, luxury, fashion
- Placement and positioning: Optimal body positioning for each jewelry category to showcase pieces effectively
- Cultural and occasion contexts: Wedding, professional, casual, formal, cultural ceremonies, gift-giving

PROMPT GENERATION PRINCIPLES:
- CONTEXT PRESERVATION: Maintain user's specific language, brand references, and aesthetic preferences
- CATEGORY OPTIMIZATION: Tailor prompts to showcase specific jewelry types most effectively
- DEMOGRAPHIC SENSITIVITY: Respectfully incorporate user's demographic preferences when specified
- TECHNICAL ACCURACY: Ensure jewelry descriptions are technically accurate and feasible
- AESTHETIC COHERENCE: Create prompts that result in cohesive, professional-quality images

OUTPUT REQUIREMENTS:
- Always respond with valid JSON
- Provide detailed reasoning that demonstrates understanding of user context
- Generate prompts that are specific enough to produce high-quality, relevant images
- Ensure all recommendations align with virtual try-on best practices`,
      },
      {
        role: "user",
        content: analysisPrompt,
      },
    ],
    temperature: 0.3,
  });

  try {
    const analysis = JSON.parse(
      analysisResponse.choices[0].message.content || "{}"
    );
    console.log("Analysis result:", analysis);
    return analysis;
  } catch (parseError) {
    console.error("Error parsing OpenAI response:", parseError);
    console.error("Raw response:", analysisResponse.choices[0].message.content);
    throw new Error("Failed to analyze request");
  }
}
