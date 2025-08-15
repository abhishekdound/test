package com.adobe.hackathon.util;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.List;

public class HttpHelpers {
    static HttpClient client = HttpClient.newHttpClient();



    public static String openAIChat(String apiKey, String model, String prompt) {
        try {
            ObjectMapper mapper = new ObjectMapper();

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", new Object[]{
                            Map.of("role", "user", "content", prompt)
                    }
            );

            String requestBody = mapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // Parse JSON to extract the assistant's message
            Map<String, Object> jsonResponse = mapper.readValue(response.body(), Map.class);
            var choices = (java.util.List<Map<String, Object>>) jsonResponse.get("choices");
            if (!choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return message.get("content").toString();
            }
            return "";

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Error calling OpenAI API", e);
        }
    }

    public static String geminiChat(String model, String prompt) {
        try {
            // Get Gemini API key from environment or use a default for testing
            String apiKey = System.getenv("GEMINI_API_KEY");
            if (apiKey == null || apiKey.isEmpty()) {
                apiKey = "AIzaSyBvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQ"; // Fallback for testing
            }
            
            String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + model + ":generateContent?key=" + apiKey;

            String requestBody = "{ \"contents\": [{ \"parts\":[{\"text\": \""
                    + escapeJson(prompt) + "\"}]}] }";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            // Parse the Gemini response to extract the text content
            if (response.statusCode() == 200) {
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, Object> jsonResponse = mapper.readValue(response.body(), Map.class);
                    
                    if (jsonResponse.containsKey("candidates") && jsonResponse.get("candidates") instanceof List) {
                        List<Map<String, Object>> candidates = (List<Map<String, Object>>) jsonResponse.get("candidates");
                        if (!candidates.isEmpty()) {
                            Map<String, Object> candidate = candidates.get(0);
                            if (candidate.containsKey("content") && candidate.get("content") instanceof Map) {
                                Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                                if (content.containsKey("parts") && content.get("parts") instanceof List) {
                                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                                    if (!parts.isEmpty() && parts.get(0).containsKey("text")) {
                                        return parts.get(0).get("text").toString();
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error parsing Gemini response: " + e.getMessage());
                }
            }
            
            // Return raw response if parsing fails
            return response.body();
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    public static String ollamaChat(String baseUrl, String model, String prompt) {
        try {
            String url = baseUrl + "/api/generate";
            String requestBody = "{ \"model\": \"" + model + "\", \"prompt\": \"" + escapeJson(prompt) + "\" }";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    private static String escapeJson(String text) {
        return text.replace("\"", "\\\"");
    }

    public static String azureChat(String apiKey, String baseUrl, String apiVersion, String deploymentName, String prompt) {
        try {
            // Construct API endpoint
            String url = baseUrl + "openai/deployments/" + deploymentName + "/chat/completions?api-version=" + apiVersion;

            // Request body (basic single-message chat)
            String requestBody = "{ \"messages\": [ { \"role\": \"user\", \"content\": \""
                    + escapeJson(prompt) + "\" } ] }";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header("api-key", apiKey) // Azure OpenAI requires api-key header
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }


    public static byte[] azureTts(String endpoint, String key, String text, String voiceName) {
        try {
            // Build SSML body
            String ssml = """
                <speak version='1.0' xml:lang='en-US'>
                    <voice xml:lang='en-US' xml:gender='Female' name='%s'>
                        %s
                    </voice>
                </speak>
                """.formatted(voiceName, escapeXml(text));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/ssml+xml")
                    .header("X-Microsoft-OutputFormat", "audio-16khz-32kbitrate-mono-mp3")
                    .header("Ocp-Apim-Subscription-Key", key)
                    .POST(HttpRequest.BodyPublishers.ofString(ssml))
                    .build();

            HttpResponse<byte[]> response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Azure TTS failed: " + response.statusCode() + " - " +
                        new String(response.body()));
            }

            return response.body();

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Azure TTS error: " + e.getMessage(), e);
        }
    }

    private static String escapeXml(String s) {
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }





}
