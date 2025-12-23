
import { GoogleGenAI } from "@google/genai";
import { ModelData, SearchResponse, ModelType } from "../types";

export const search3DModels = async (
  query: string, 
  count: number = 10, 
  existingNames: string[] = [],
  modelType: ModelType = 'flash'
): Promise<SearchResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = modelType === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  const thinkingBudget = modelType === 'pro' ? 4000 : 0;

  // 大幅增强搜索源矩阵
  const platforms = [
    'site:sketchfab.com',
    'site:cgtrader.com',
    'site:turbosquid.com',
    'site:artstation.com/marketplace',
    'site:assetstore.unity.com',
    'site:fab.com',
    'site:unrealengine.com/marketplace',
    'site:polyhaven.com',
    'site:renderhub.com',
    'site:3dsky.org',
    'site:free3d.com',
    'site:hum3d.com',
    'site:threedscans.com'
  ];
  
  const enhancedQuery = `${query} 3D model (${platforms.join(' OR ')}) -inurl:search -inurl:category -inurl:tags`;

  try {
    const response = await ai.models.generateContent({
      model: modelName, 
      contents: `Find and analyze exactly ${count} unique and high-quality 3D models for the query: "${query}". 
      You MUST explore various platforms from this list: ${platforms.join(', ')}.
      ${existingNames.length > 0 ? `IMPORTANT: Do not include any of these models you already found: ${existingNames.join(', ')}.` : ''}`,
      config: {
        ...(thinkingBudget > 0 ? { thinkingConfig: { thinkingBudget } } : {}),
        systemInstruction: `You are a Global 3D Asset Scout. Your objective is to find EXACTLY ${count} verified 3D models.

        STRICT AUDIT PROTOCOL:
        1. QUANTITY GUARANTEE: You must return an array of exactly ${count} models in your JSON output.
        2. MANDATORY SOURCE TRUTH: Every 'downloadUrl' MUST exist in the 'googleSearch' grounding data.
        3. NO DUPLICATES: Each model must be unique and not present in the provided exclusion list.
        4. PLATFORM DIVERSITY: Try to pull results from multiple different sites to ensure the count of ${count} is met.
        5. ACCURACY: If the search data is insufficient to reach ${count}, provide the maximum number of unique, verified models you can find, but strive for ${count}.

        OUTPUT SCHEMA:
        {
          "models": [
            {
              "id": "unique_slug",
              "name": { "zh": "名称", "en": "Name" },
              "platform": "Platform Name",
              "domain": "site.com",
              "description": { "zh": "描述", "en": "Description" },
              "visualSummary": { "zh": "视觉摘要", "en": "Visual summary" },
              "downloadUrl": "VERIFIED_URL_FROM_GROUNDING",
              "price": "$Price or Free",
              "format": "FBX/OBJ/GLB/etc",
              "qualityScore": 1-10,
              "technicalSpecs": [{"zh": "技术规格", "en": "Technical spec"}]
            }
          ]
        }`,
        tools: [{ googleSearch: {} }],
        temperature: 0.2, // 稍微提高温度以增加搜索结果的多样性，确保能凑够数量
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title)
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    let models: ModelData[] = [];
    const jsonBlockMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonBlockMatch) {
      try {
        const parsed = JSON.parse(jsonBlockMatch[0]);
        if (parsed.models && Array.isArray(parsed.models)) {
          const verifiedUris = new Set(sources.map(s => s.uri));
          
          models = parsed.models
            .filter((m: any) => {
              if (!m.downloadUrl) return false;
              const knownDomains = [
                'sketchfab.com', 'cgtrader.com', 'turbosquid.com', 'artstation.com',
                'unity.com', 'fab.com', 'unrealengine.com', 'polyhaven.com',
                'renderhub.com', '3dsky.org', 'free3d.com', 'hum3d.com', 'threedscans.com'
              ];
              const urlInGrounding = verifiedUris.has(m.downloadUrl);
              const isKnownPlatform = knownDomains.some(d => m.downloadUrl.includes(d));
              return urlInGrounding || isKnownPlatform;
            })
            .slice(0, count); // 确保不超过请求的数量
        }
      } catch (e) {
        console.warn("Audit Parse failed");
      }
    }

    return { models, groundingSources: sources };
  } catch (error: any) {
    console.error("Gemini Audit Error:", error);
    throw error;
  }
};
