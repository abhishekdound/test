package com.adobe.hackathon.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * TTS Client supporting Azure TTS via environment variables
 * Supports the Adobe India Hackathon 2025 requirements for TTS integration
 */
@Component
public class TTSClient {

    private static final Logger logger = LoggerFactory.getLogger(TTSClient.class);

    @Value("${TTS_PROVIDER:azure}")
    private String ttsProvider;

    @Value("${AZURE_TTS_KEY:}")
    private String azureTTSKey;

    @Value("${AZURE_TTS_ENDPOINT:}")
    private String azureTTSEndpoint;

    @Value("${AZURE_TTS_VOICE:en-US-JennyNeural}")
    private String azureTTSVoice;

    @Value("${AZURE_TTS_FORMAT:mp3}")
    private String azureTTSFormat;

    private final RestTemplate restTemplate;
    private final Path audioDir = Paths.get("./uploads/audio");

    public TTSClient() {
        this.restTemplate = new RestTemplate();
        // Create audio directory if it doesn't exist
        try {
            Files.createDirectories(audioDir);
        } catch (IOException e) {
            logger.warn("Could not create audio directory", e);
        }
    }

    /**
     * Generate audio from text using the configured TTS provider
     */
    public String generateAudio(String text, String jobId) {
        try {
            switch (ttsProvider.toLowerCase()) {
                case "azure":
                    return generateWithAzureTTS(text, jobId);
                default:
                    logger.warn("Unknown TTS provider: {}, using fallback", ttsProvider);
                    return generateFallbackAudio(text, jobId);
            }
        } catch (Exception e) {
            logger.error("Error generating audio with TTS provider: {}", ttsProvider, e);
            return generateFallbackAudio(text, jobId);
        }
    }

    /**
     * Generate audio using Azure TTS
     */
    private String generateWithAzureTTS(String text, String jobId) {
        try {
            String url = azureTTSEndpoint + "/cognitiveservices/v1";
            
            // Prepare SSML (Speech Synthesis Markup Language)
            String ssml = buildSSML(text, azureTTSVoice);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/ssml+xml"));
            headers.set("X-Microsoft-OutputFormat", "audio-16khz-128kbitrate-mono-mp3");
            headers.set("Ocp-Apim-Subscription-Key", azureTTSKey);
            headers.set("User-Agent", "AdobeLearnPlatform");

            HttpEntity<String> request = new HttpEntity<>(ssml, headers);
            ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.POST, request, byte[].class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                // Save audio file
                String fileName = "podcast_" + jobId + ".mp3";
                Path audioPath = audioDir.resolve(fileName);
                
                try (FileOutputStream fos = new FileOutputStream(audioPath.toFile())) {
                    fos.write(response.getBody());
                }

                // Return the URL to access the audio file
                return "/api/frontend/audio/" + fileName;
            }

        } catch (Exception e) {
            logger.error("Error generating with Azure TTS", e);
        }
        return generateFallbackAudio(text, jobId);
    }

    /**
     * Build SSML for Azure TTS
     */
    private String buildSSML(String text, String voice) {
        return String.format("""
            <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
                <voice name='%s'>
                    <prosody rate='medium' pitch='medium'>
                        %s
                    </prosody>
                </voice>
            </speak>
            """, voice, escapeXml(text));
    }

    /**
     * Escape XML special characters
     */
    private String escapeXml(String text) {
        return text.replace("&", "&amp;")
                  .replace("<", "&lt;")
                  .replace(">", "&gt;")
                  .replace("\"", "&quot;")
                  .replace("'", "&apos;");
    }

    /**
     * Generate fallback audio when TTS is not available
     */
    private String generateFallbackAudio(String text, String jobId) {
        try {
            // Create a simple text file as fallback
            String fileName = "podcast_" + jobId + ".txt";
            Path audioPath = audioDir.resolve(fileName);
            
            String fallbackContent = "Audio generation not available. Here's the text content:\n\n" + text;
            Files.write(audioPath, fallbackContent.getBytes());

            return "/api/frontend/audio/" + fileName;
        } catch (IOException e) {
            logger.error("Error creating fallback audio", e);
            return null;
        }
    }

    /**
     * Get audio file as byte array
     */
    public byte[] getAudioFile(String fileName) {
        try {
            Path audioPath = audioDir.resolve(fileName);
            if (Files.exists(audioPath)) {
                return Files.readAllBytes(audioPath);
            }
        } catch (IOException e) {
            logger.error("Error reading audio file: {}", fileName, e);
        }
        return null;
    }

    /**
     * Get the current TTS provider configuration
     */
    public String getCurrentProvider() {
        return ttsProvider;
    }

    /**
     * Check if TTS is properly configured
     */
    public boolean isConfigured() {
        switch (ttsProvider.toLowerCase()) {
            case "azure":
                return !azureTTSKey.isEmpty() && !azureTTSEndpoint.isEmpty();
            default:
                return false;
        }
    }

    /**
     * Calculate estimated duration for text (words per minute)
     */
    public int calculateDuration(String text) {
        int wordCount = text.split("\\s+").length;
        int wordsPerMinute = 150; // Average speaking rate
        return Math.max(120, (wordCount * 60) / wordsPerMinute); // Minimum 2 minutes
    }
}
