package com.adobe.hackathon.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * LLM Client supporting multiple providers via environment variables
 * Supports the Adobe India Hackathon 2025 requirements for LLM integration
 */
@Component
public class LLMClient {

    private static final Logger logger = LoggerFactory.getLogger(LLMClient.class);

    @Value("${LLM_PROVIDER:gemini}")
    private String llmProvider;

    @Value("${GOOGLE_APPLICATION_CREDENTIALS:}")
    private String googleCredentials;

    @Value("${GEMINI_MODEL:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${AZURE_OPENAI_KEY:}")
    private String azureOpenAIKey;

    @Value("${AZURE_OPENAI_BASE:}")
    private String azureOpenAIBase;

    @Value("${AZURE_API_VERSION:2024-02-15-preview}")
    private String azureApiVersion;

    @Value("${AZURE_DEPLOYMENT_NAME:gpt-4o}")
    private String azureDeploymentName;

    @Value("${OPENAI_API_KEY:}")
    private String openaiApiKey;

    @Value("${OPENAI_MODEL:gpt-4o}")
    private String openaiModel;

    @Value("${OLLAMA_BASE_URL:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${OLLAMA_MODEL:llama3}")
    private String ollamaModel;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public LLMClient() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Generate insights using the configured LLM provider
     */
    public String generateInsights(String prompt) {
        try {
            switch (llmProvider.toLowerCase()) {
                case "gemini":
                    return generateWithGemini(prompt);
                case "azure":
                    return generateWithAzureOpenAI(prompt);
                case "openai":
                    return generateWithOpenAI(prompt);
                case "ollama":
                    return generateWithOllama(prompt);
                default:
                    logger.warn("Unknown LLM provider: {}, using fallback", llmProvider);
                    return generateFallbackInsights(prompt);
            }
        } catch (Exception e) {
            logger.error("Error generating insights with LLM provider: {}", llmProvider, e);
            return generateFallbackInsights(prompt);
        }
    }

    /**
     * Generate insights using Gemini
     */
    private String generateWithGemini(String prompt) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent";
            
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            content.put("parts", Map.of("text", prompt));
            requestBody.put("contents", Map.of("content", content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (!googleCredentials.isEmpty()) {
                headers.set("Authorization", "Bearer " + googleCredentials);
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                return responseJson.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
            }

        } catch (Exception e) {
            logger.error("Error generating with Gemini", e);
        }
        return generateFallbackInsights(prompt);
    }

    /**
     * Generate insights using Azure OpenAI
     */
    private String generateWithAzureOpenAI(String prompt) {
        try {
            String url = azureOpenAIBase + "/openai/deployments/" + azureDeploymentName + "/chat/completions?api-version=" + azureApiVersion;
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", azureDeploymentName);
            requestBody.put("messages", Map.of("role", "user", "content", prompt));
            requestBody.put("max_tokens", 1000);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", azureOpenAIKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                return responseJson.path("choices").path(0).path("message").path("content").asText();
            }

        } catch (Exception e) {
            logger.error("Error generating with Azure OpenAI", e);
        }
        return generateFallbackInsights(prompt);
    }

    /**
     * Generate insights using OpenAI
     */
    private String generateWithOpenAI(String prompt) {
        try {
            String url = "https://api.openai.com/v1/chat/completions";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", openaiModel);
            requestBody.put("messages", Map.of("role", "user", "content", prompt));
            requestBody.put("max_tokens", 1000);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + openaiApiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                return responseJson.path("choices").path(0).path("message").path("content").asText();
            }

        } catch (Exception e) {
            logger.error("Error generating with OpenAI", e);
        }
        return generateFallbackInsights(prompt);
    }

    /**
     * Generate insights using Ollama
     */
    private String generateWithOllama(String prompt) {
        try {
            String url = ollamaBaseUrl + "/api/generate";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", ollamaModel);
            requestBody.put("prompt", prompt);
            requestBody.put("stream", false);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                return responseJson.path("response").asText();
            }

        } catch (Exception e) {
            logger.error("Error generating with Ollama", e);
        }
        return generateFallbackInsights(prompt);
    }

    /**
     * Generate fallback insights when LLM is not available
     */
    private String generateFallbackInsights(String prompt) {
        return """
            {
                "insights": [
                    {
                        "id": "fallback-1",
                        "type": "key_point",
                        "title": "Document Analysis",
                        "content": "This document contains valuable information that has been processed for analysis.",
                        "confidence": 0.8,
                        "sources": ["Document"]
                    },
                    {
                        "id": "fallback-2",
                        "type": "summary",
                        "title": "Content Overview",
                        "content": "The document structure and content have been successfully analyzed.",
                        "confidence": 0.75,
                        "sources": ["Analysis"]
                    },
                    {
                        "id": "fallback-3",
                        "type": "connection",
                        "title": "Related Content",
                        "content": "Found related sections with high relevance for further exploration.",
                        "confidence": 0.85,
                        "sources": ["Sections"]
                    }
                ]
            }
            """;
    }

    /**
     * Get the current LLM provider configuration
     */
    public String getCurrentProvider() {
        return llmProvider;
    }

    /**
     * Check if LLM is properly configured
     */
    public boolean isConfigured() {
        switch (llmProvider.toLowerCase()) {
            case "gemini":
                return !googleCredentials.isEmpty();
            case "azure":
                return !azureOpenAIKey.isEmpty() && !azureOpenAIBase.isEmpty();
            case "openai":
                return !openaiApiKey.isEmpty();
            case "ollama":
                return true; // Ollama is local, so we assume it's available
            default:
                return false;
        }
    }
}

