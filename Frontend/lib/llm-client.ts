// LLM client utility following hackathon requirements
interface LLMResponse {
  content: string
  error?: string
}

export async function callLLM(prompt: string): Promise<LLMResponse> {
  const provider = process.env.LLM_PROVIDER || "openai"

  try {
    switch (provider.toLowerCase()) {
      case "gemini":
        return await callGemini(prompt)
      case "azure":
        return await callAzureOpenAI(prompt)
      case "openai":
        return await callOpenAI(prompt)
      case "ollama":
        return await callOllama(prompt)
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`)
    }
  } catch (error) {
    console.error("LLM call failed:", error)
    return { content: "", error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function callGemini(prompt: string): Promise<LLMResponse> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash"
  const apiKey = process.env.GOOGLE_APPLICATION_CREDENTIALS

  if (!apiKey) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS not set")
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()
  return { content: data.candidates[0]?.content?.parts[0]?.text || "" }
}

async function callAzureOpenAI(prompt: string): Promise<LLMResponse> {
  const apiKey = process.env.AZURE_OPENAI_KEY
  const endpoint = process.env.AZURE_OPENAI_BASE
  const apiVersion = process.env.AZURE_API_VERSION || "2024-02-15-preview"
  const deploymentName = process.env.AZURE_DEPLOYMENT_NAME || "gpt-4o"

  if (!apiKey || !endpoint) {
    throw new Error("Azure OpenAI credentials not set")
  }

  const response = await fetch(
    `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`Azure OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return { content: data.choices[0]?.message?.content || "" }
}

async function callOpenAI(prompt: string): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || "gpt-4o"
  const baseUrl = process.env.OPENAI_API_BASE || "https://api.openai.com/v1"

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set")
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return { content: data.choices[0]?.message?.content || "" }
}

async function callOllama(prompt: string): Promise<LLMResponse> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
  const model = process.env.OLLAMA_MODEL || "llama3"

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`)
  }

  const data = await response.json()
  return { content: data.response || "" }
}
