import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code, language, provider, apiKeys, models } = await req.json();

    const prompt = `You are an expert software engineer and AI code analyst.
The user has provided a snippet of code written in ${language}.
Analyze the code and identify areas for improvement based on best practices, performance, safety, and conciseness ("Code DNA").
Provide the refactored code and a short, 1-2 sentence explanation of why this change improves the code.

Return ONLY a JSON object with the following schema:
{
  "suggested": "the complete refactored code snippet",
  "explanation": "short explanation of the improvements"
}

CODE:
\`\`\`${language}
${code}
\`\`\``;

    let responseText = "";

    if (provider === 'gemini' || !provider) {
      const apiKey = apiKeys?.gemini || process.env.GEMINI_API_KEY;
      const modelName = models?.gemini || 'gemini-2.5-flash';
      if (!apiKey) throw new Error("No Gemini API Key available.");
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      responseText = response.text || "{}";
    } else if (provider === 'claude') {
      const apiKey = apiKeys?.claude;
      const modelName = models?.claude || 'claude-3-5-sonnet-20241022';
      if (!apiKey) throw new Error("No Claude API Key provided.");
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      responseText = data.content[0].text;
    } else if (provider === 'openai') {
      const apiKey = apiKeys?.openai;
      const modelName = models?.openai || 'gpt-4o';
      if (!apiKey) throw new Error("No OpenAI API Key provided.");
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      responseText = data.choices[0].message.content;
    } else if (provider === 'mistral') {
      const apiKey = apiKeys?.mistral;
      const modelName = models?.mistral || 'mistral-large-latest';
      if (!apiKey) throw new Error("No Mistral API Key provided.");
      
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      responseText = data.choices[0].message.content;
    } else {
      throw new Error("Unknown provider.");
    }

    const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json({ 
      suggested: data.suggested || code,
      explanation: data.explanation || "No explanation provided."
    });
  } catch (error: any) {
    console.error("Refactor Error:", error);
    return NextResponse.json({ suggested: "Error processing refactoring", explanation: error.message || "Internal AI Engine failure." }, { status: 500 });
  }
}
