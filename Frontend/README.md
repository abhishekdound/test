# Adobe Learn

An intelligent PDF learning platform powered by AI that provides document analysis, related content discovery, and podcast generation capabilities.

## Features

- **PDF Upload & Management**: Bulk upload and manage multiple PDF documents
- **Related Sections Engine**: AI-powered content discovery with >80% accuracy
- **LLM Insights**: Generate key insights, summaries, and connections using multiple LLM providers
- **Podcast Mode**: Convert documents to narrated audio overviews using TTS
- **Adobe PDF Embed**: High-fidelity PDF rendering with zoom/pan interactions

## Quick Start

### Using Docker (Recommended)

1. **Build the Docker image:**
   \`\`\`bash
   docker build --platform linux/amd64 -t adobe-learn .
   \`\`\`

2. **Run with environment variables:**
   \`\`\`bash
   docker run \
     -e LLM_PROVIDER=gemini \
     -e GOOGLE_APPLICATION_CREDENTIALS=<PATH_TO_CREDS> \
     -e GEMINI_MODEL=gemini-2.5-flash \
     -e TTS_PROVIDER=azure \
     -e AZURE_TTS_KEY=<TTS_KEY> \
     -e AZURE_TTS_ENDPOINT=<TTS_ENDPOINT> \
     -p 8080:8080 \
     adobe-learn
   \`\`\`

3. **Access the application:**
   Open http://localhost:8080/ in your browser

### Local Development

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set environment variables:**
   Create a `.env.local` file with your API keys:
   \`\`\`env
   LLM_PROVIDER=openai
   OPENAI_API_KEY=your_openai_key
   TTS_PROVIDER=azure
   AZURE_TTS_KEY=your_azure_tts_key
   AZURE_TTS_ENDPOINT=your_azure_tts_endpoint
   \`\`\`

3. **Run development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

## Environment Variables

### LLM Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `LLM_PROVIDER` | LLM provider to use | `gemini`, `azure`, `openai`, `ollama` |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.5-flash` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Google credentials | `/path/to/creds.json` |
| `AZURE_OPENAI_KEY` | Azure OpenAI API key | `your_azure_key` |
| `AZURE_OPENAI_BASE` | Azure OpenAI endpoint | `https://your-resource.openai.azure.com/` |
| `AZURE_API_VERSION` | Azure API version | `2024-02-15-preview` |
| `AZURE_DEPLOYMENT_NAME` | Azure deployment name | `gpt-4o` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `OPENAI_MODEL` | OpenAI model name | `gpt-4o` |
| `OPENAI_API_BASE` | OpenAI API base URL | `https://api.openai.com/v1` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model name | `llama3` |

### TTS Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `TTS_PROVIDER` | TTS provider to use | `azure`, `google` |
| `AZURE_TTS_KEY` | Azure TTS subscription key | `your_azure_tts_key` |
| `AZURE_TTS_ENDPOINT` | Azure TTS endpoint | `https://your-region.tts.speech.microsoft.com/` |
| `GOOGLE_TTS_API_KEY` | Google TTS API key | `your_google_tts_key` |

## Docker Deployment Examples

### Using Gemini + Azure TTS
\`\`\`bash
docker run \
  -e LLM_PROVIDER=gemini \
  -e GOOGLE_APPLICATION_CREDENTIALS=<PATH_TO_CREDS> \
  -e GEMINI_MODEL=gemini-2.5-flash \
  -e TTS_PROVIDER=azure \
  -e AZURE_TTS_KEY=<TTS_KEY> \
  -e AZURE_TTS_ENDPOINT=<TTS_ENDPOINT> \
  -p 8080:8080 \
  adobe-learn
\`\`\`

### Using Azure OpenAI + Azure TTS
\`\`\`bash
docker run \
  -e LLM_PROVIDER=azure \
  -e AZURE_OPENAI_KEY=<AZURE_API_KEY> \
  -e AZURE_OPENAI_BASE=<AZURE_API_BASE> \
  -e AZURE_API_VERSION=<AZURE_API_VERSION> \
  -e AZURE_DEPLOYMENT_NAME=gpt-4o \
  -e TTS_PROVIDER=azure \
  -e AZURE_TTS_KEY=<TTS_KEY> \
  -e AZURE_TTS_ENDPOINT=<TTS_ENDPOINT> \
  -p 8080:8080 \
  adobe-learn
\`\`\`

### Using OpenAI + Azure TTS
\`\`\`bash
docker run \
  -e LLM_PROVIDER=openai \
  -e OPENAI_API_KEY=<OPENAI_API_KEY> \
  -e OPENAI_MODEL=gpt-4o \
  -e TTS_PROVIDER=azure \
  -e AZURE_TTS_KEY=<TTS_KEY> \
  -e AZURE_TTS_ENDPOINT=<TTS_ENDPOINT> \
  -p 8080:8080 \
  adobe-learn
\`\`\`

## Architecture

- **Frontend**: Next.js 14 with React 18
- **PDF Processing**: PDF.js for text extraction
- **AI Integration**: Multi-provider LLM support (Gemini, OpenAI, Azure, Ollama)
- **TTS**: Azure Cognitive Services Speech and Google TTS
- **Styling**: Tailwind CSS with Adobe-inspired dark theme
- **Deployment**: Docker with standalone Next.js output

## Performance Requirements

- Related sections analysis: ≤10 seconds (CPU-based)
- Navigation between sections: <2 seconds
- Insights generation: Variable (LLM-dependent)
- Podcast generation: 30-60 seconds for 2-5 minute audio

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

Private - Adobe India Hackathon 2025
