
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, Recipe } from "../types";

const API_KEY = process.env.API_KEY || "";

export const analyzeIngredients = async (base64Image: string): Promise<AnalysisResult> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please ensure the environment is configured correctly.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    Analyze the uploaded image and identify all food ingredients shown.
    Based on the detected ingredients, propose 3 authentic Chinese dishes.
    Aim for 3 distinct styles: e.g., one stir-fry, one braised/stewed, and one soup/steamed.
    
    If the image does not contain clear food ingredients, start your response with "No food ingredients detected."

    Format your response exactly like this structure:
    Detected Ingredients:
    - [Ingredient 1]
    - [Ingredient 2]
    
    Recipe 1: [Name]
    Cooking Style: [Style]
    Instructions: [Provide the steps here]
    
    Recipe 2: [Name]
    Cooking Style: [Style]
    Instructions: [Provide the steps here]
    
    Recipe 3: [Name]
    Cooking Style: [Style]
    Instructions: [Provide the steps here]

    Use your search grounding capability to ensure these are authentic Chinese recipes.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1]
              }
            }
          ]
        }
      ],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text;
    if (!text) throw new Error("Received empty response from AI");

    if (text.toLowerCase().includes("no food ingredients detected")) {
      return { 
        ingredients: [], 
        recipes: [], 
        error: "No clear food ingredients were detected in this image. Please try a different photo!" 
      };
    }

    // Parsing ingredients
    const ingredientsMatch = text.match(/Detected Ingredients:([\s\S]*?)(?=Recipe 1:|$)/i);
    const ingredients = ingredientsMatch 
      ? ingredientsMatch[1].trim().split('\n').map(i => i.replace(/^- /, '').trim()).filter(Boolean)
      : [];

    const recipes: Recipe[] = [];
    // Split by "Recipe [Number]:"
    const recipeBlocks = text.split(/Recipe \d:/i).slice(1);

    recipeBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n');
      const name = lines[0].trim();
      
      const styleLine = lines.find(l => l.toLowerCase().includes('cooking style:'));
      const style = styleLine ? styleLine.split(':')[1]?.trim() : 'Traditional';
      
      // Improved instructions parsing
      const instructionsLineIndex = lines.findIndex(l => l.toLowerCase().startsWith('instructions:'));
      let instructions = '';
      
      if (instructionsLineIndex !== -1) {
        // Start with whatever is on the same line as "Instructions:"
        const firstLine = lines[instructionsLineIndex].replace(/instructions:/i, '').trim();
        // Add any subsequent lines in this block
        const remainingLines = lines.slice(instructionsLineIndex + 1).join(' ').trim();
        instructions = (firstLine + ' ' + remainingLines).trim();
      }

      recipes.push({
        id: index + 1,
        name,