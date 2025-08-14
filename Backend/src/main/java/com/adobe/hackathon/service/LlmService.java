package com.adobe.hackathon.service;

import com.adobe.hackathon.model.InsightResponse;
import com.adobe.hackathon.model.Section;
import com.adobe.hackathon.util.HttpHelpers;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LlmService {
    private final String provider = System.getenv().getOrDefault("LLM_PROVIDER","openai");

    public InsightResponse generateInsights(String context) throws JsonProcessingException {
        String prompt = """
      You are a helpful PDF analyst. Return JSON with keys:
      keyInsights[], didYouKnow[], contradictions[], connections[].
      Use concise 1-2 sentence items.
    """ + "\n\nCONTEXT:\n" + context;
        String json = chat(prompt);
        // parse JSON defensively
        return new ObjectMapper().readValue(json, InsightResponse.class);
    }
    public String podcastScript(List<Section> sections){
        String prompt = """
      Write a 2-5 minute narrated script summarizing the current section,
      3 related sections, and insights. Conversational, informative.
    """ + "\n\nCONTEXT:\n" + sections.stream().limit(8).map(s-> s.getText()).collect(Collectors.joining("\n---\n"));
        return chat(prompt);
    }

    private String chat(String prompt){
        switch (provider.toLowerCase()){
            case "azure":   return callAzureOpenAI(prompt);
            case "gemini":  return callGemini(prompt);
            case "ollama":  return callOllama(prompt);
            default:        return callOpenAI(prompt);
        }
    }

    private String callOpenAI(String prompt){
        String apiKey = System.getenv("OPENAI_API_KEY");
        String model  = System.getenv().getOrDefault("OPENAI_MODEL", "gpt-4o");
        // POST https://api.openai.com/v1/chat/completions
        // messages: [{role:'user', content: prompt}]
        // return assistant content
        // (implement with Java HttpClient)
        return HttpHelpers.openAIChat(apiKey, model, prompt);
    }

    private String callAzureOpenAI(String prompt) {
        Map<String, String> env = System.getenv();

        String key = env.get("AZURE_OPENAI_KEY");
        String base = env.get("AZURE_OPENAI_BASE");
        String ver = env.get("AZURE_API_VERSION");
        String dep = env.getOrDefault("AZURE_DEPLOYMENT_NAME", "gpt-4o");

        return HttpHelpers.azureChat(key, base, ver, dep, prompt);
    }

    private String callGemini(String prompt) {
        Map<String, String> env = System.getenv();

        String model = env.getOrDefault("GEMINI_MODEL", "gemini-2.5-flash");

        return HttpHelpers.geminiChat(model, prompt);
    }

    private String callOllama(String prompt) {
        Map<String, String> env = System.getenv();

        String base = env.getOrDefault("OLLAMA_BASE_URL", "http://localhost:11434");
        String model = env.getOrDefault("OLLAMA_MODEL", "llama3");

        return HttpHelpers.ollamaChat(base, model, prompt);
    }
}
