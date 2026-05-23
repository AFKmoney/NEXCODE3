import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code, language, provider, apiKeys, models } = await req.json();

    const langMap: Record<string, string> = {
      "js": "JavaScript", "ts": "TypeScript", "py": "Python",
      "rs": "Rust", "go": "Go", "cpp": "C++", "c": "C", "java": "Java",
      "rb": "Ruby", "php": "PHP", "html": "HTML"
    };

    const fullLang = langMap[language?.toLowerCase()] || language || "Text";

    const prompt = `You are a strict, highly accurate code execution engine. 
The user has provided a snippet of code written in ${fullLang}.
Your job is to simulate the compilation and execution of this ${fullLang} code.
If there are syntax errors or missing dependencies, output the realistic ${fullLang} compiler/interpreter error message.
If the code is correct, output EXACTLY the text that would be printed to STDOUT during execution.
Do not wrap your output in markdown code blocks. Do not add any conversational text. 
ONLY output the execution result or error.

CODE:
\`\`\`${fullLang}
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
      responseText = response.text || "No output generated.";
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

    return NextResponse.json({ 
      output: responseText,
      exitCode: responseText.toLowerCase().includes("error") || responseText.toLowerCase().includes("exception") ? 1 : 0
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ output: `Engine error: ${error.message}`, exitCode: -1 }, { status: 500 });
  }
}
