// TTS client utility following hackathon requirements
interface TTSResponse {
  audioBuffer?: ArrayBuffer
  audioUrl?: string
  error?: string
}

export async function generateAudio(text: string): Promise<TTSResponse> {
  const provider = process.env.TTS_PROVIDER || "azure"

  try {
    switch (provider.toLowerCase()) {
      case "azure":
        return await generateAzureTTS(text)
      case "google":
        return await generateGoogleTTS(text)
      default:
        throw new Error(`Unsupported TTS provider: ${provider}`)
    }
  } catch (error) {
    console.error("TTS generation failed:", error)
    return { error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function generateAzureTTS(text: string): Promise<TTSResponse> {
  const apiKey = process.env.AZURE_TTS_KEY
  const endpoint = process.env.AZURE_TTS_ENDPOINT

  if (!apiKey || !endpoint) {
    throw new Error("Azure TTS credentials not set")
  }

  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice name="en-US-AriaNeural">
        <prosody rate="medium" pitch="medium">
          ${text}
        </prosody>
      </voice>
    </speak>
  `

  const response = await fetch(`${endpoint}/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
    },
    body: ssml,
  })

  if (!response.ok) {
    throw new Error(`Azure TTS API error: ${response.statusText}`)
  }

  const audioBuffer = await response.arrayBuffer()
  return { audioBuffer }
}

async function generateGoogleTTS(text: string): Promise<TTSResponse> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY

  if (!apiKey) {
    throw new Error("Google TTS API key not set")
  }

  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: "en-US",
        name: "en-US-Wavenet-D",
        ssmlGender: "NEUTRAL",
      },
      audioConfig: {
        audioEncoding: "MP3",
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Google TTS API error: ${response.statusText}`)
  }

  const data = await response.json()
  const audioBuffer = Buffer.from(data.audioContent, "base64")
  return { audioBuffer: audioBuffer.buffer }
}
