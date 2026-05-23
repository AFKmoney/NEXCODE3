import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { codeToExplain, provider, apiKeys } = await req.json();

    const prompt = `En tant qu'assistant Nexus IA (fournisseur ${provider}), explique concrètement et techniquement ce bloc de code. 
Sois direct, pédagogique et concis (3 à 4 phrases maximum). Réponds en français.

Code à expliquer :
\`\`\`
${codeToExplain}
\`\`\`
`;

    if (provider === 'gemini' || !provider) {
      const apiKey = apiKeys?.gemini || process.env.GEMINI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "No Gemini API Key available." }, { status: 400 });
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return NextResponse.json({ explanation: response.text });
      
    } else if (provider === 'claude') {
      const apiKey = apiKeys?.claude;
      if (!apiKey) return NextResponse.json({ error: "No Claude API Key provided." }, { status: 400 });
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return NextResponse.json({ explanation: data.content[0].text });
      
    } else if (provider === 'openai') {
      const apiKey = apiKeys?.openai;
      if (!apiKey) return NextResponse.json({ error: "No OpenAI API Key provided." }, { status: 400 });
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return NextResponse.json({ explanation: data.choices[0].message.content });
      
    } else if (provider === 'mistral') {
      const apiKey = apiKeys?.mistral;
      if (!apiKey) return NextResponse.json({ error: "No Mistral API Key provided." }, { status: 400 });
      
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'open-mixtral-8x7b',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return NextResponse.json({ explanation: data.choices[0].message.content });
    }

    return NextResponse.json({ error: "Unknown provider selected." }, { status: 400 });
  } catch (error: any) {
    console.error("API Explain Error:", error);
    return NextResponse.json({ error: error.message || "Une erreur est survenue." }, { status: 500 });
  }
}
