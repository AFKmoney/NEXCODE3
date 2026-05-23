import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, codeContext, provider, apiKeys, settings, models } = await req.json();
    
    const formattedMessages = messages.map((m: any) => `${m.role === 'user' ? 'Utilisateur' : 'Nexus'}: ${m.content}`).join('\n\n');
    
    const systemPrompt = `Tu es Nexus IA, un assistant de pair-programming expert dans l'IDE mobile NexusCode.
Fournisseur d'IA utilisé: ${provider}.
Tu dois adapter ton style de réponse pour correspondre à cet assistant.
Options activées : Mentor Socratique(${settings?.expMentor}), Sagesse multi-repo(${settings?.expCrossRepo}).

Contexte du code actuel du fichier:
\`\`\`
${codeContext}
\`\`\`

Réponds de manière concise, technique et utile, en français. Fournis du code si nécessaire.`;

    const promptText = systemPrompt + "\n\n" + formattedMessages + "\n\nNexus:";

    if (provider === 'gemini' || !provider) {
      const apiKey = apiKeys?.gemini || process.env.GEMINI_API_KEY;
      const modelName = models?.gemini || 'gemini-2.5-flash';
      if (!apiKey) return NextResponse.json({ error: "No Gemini API Key available." }, { status: 400 });
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: promptText,
      });
      return NextResponse.json({ reply: response.text });
      
    } else if (provider === 'claude') {
      const apiKey = apiKeys?.claude;
      const modelName = models?.claude || 'claude-3-5-sonnet-20241022';
      if (!apiKey) return NextResponse.json({ error: "No Claude API Key provided." }, { status: 400 });
      
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
          system: systemPrompt,
          messages: [{ role: 'user', content: formattedMessages }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return NextResponse.json({ reply: data.content[0].text });
      
    } else if (provider === 'openai') {
      const apiKey = apiKeys?.openai;
      const modelName = models?.openai || 'gpt-4o';
      if (!apiKey) return NextResponse.json({ error: "No OpenAI API Key provided." }, { status: 400 });
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: formattedMessages }
          ]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return NextResponse.json({ reply: data.choices[0].message.content });
      
    } else if (provider === 'mistral') {
      const apiKey = apiKeys?.mistral;
      const modelName = models?.mistral || 'mistral-large-latest';
      if (!apiKey) return NextResponse.json({ error: "No Mistral API Key provided." }, { status: 400 });
      
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: formattedMessages }
          ]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return NextResponse.json({ reply: data.choices[0].message.content });
    }

    return NextResponse.json({ error: "Unknown provider selected." }, { status: 400 });
  } catch (error: any) {
    console.error("API Chat Error:", error);
    return NextResponse.json({ error: error.message || "Une erreur est survenue." }, { status: 500 });
  }
}
