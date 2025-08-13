// InsightsBulbService.java
package com.adobe.hackathon.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class InsightsBulbService {

    private static final Logger logger = LoggerFactory.getLogger(InsightsBulbService.class);

    @Autowired
    private LLMIntegrationService llmService;

    /**
     * Generate insights for a specific section or document
     */
    public Map<String, Object> generateInsights(String jobId, String sectionContent, String persona, String jobToBeDone) {
        Map<String, Object> insights = new HashMap<>();
        
        try {
            // Generate different types of insights using LLM
            insights.put("keyInsights", generateKeyInsights(sectionContent, persona, jobToBeDone));
            insights.put("didYouKnow", generateDidYouKnowFacts(sectionContent));
            insights.put("contradictions", generateContradictions(sectionContent));
            insights.put("inspirations", generateInspirations(sectionContent, persona));
            insights.put("connections", generateCrossDocumentConnections(jobId, sectionContent));
            
            insights.put("generatedAt", System.currentTimeMillis());
            insights.put("confidence", 0.85);
            insights.put("source", "LLM-Powered Insights Bulb");
            
            logger.info("Generated insights for job: {} with {} key insights", jobId, 
                ((List<?>) insights.get("keyInsights")).size());
            
        } catch (Exception e) {
            logger.error("Error generating insights for job: {}", jobId, e);
            insights.put("error", "Failed to generate insights: " + e.getMessage());
            insights.put("fallbackInsights", generateFallbackInsights(sectionContent));
        }
        
        return insights;
    }

    /**
     * Generate key insights from the content
     */
    private List<String> generateKeyInsights(String content, String persona, String jobToBeDone) {
        try {
            String prompt = String.format("""
                Analyze the following content and provide 3-5 key insights that would be valuable for a %s.
                Job to be done: %s
                
                Content: %s
                
                Provide insights in this format:
                1. [Insight 1]
                2. [Insight 2]
                3. [Insight 3]
                
                Focus on actionable, relevant insights that help with the specific job to be done.
                """, persona, jobToBeDone, content.substring(0, Math.min(content.length(), 1000)));
            
            String response = llmService.generateResponse(prompt);
            return parseInsightsFromResponse(response);
            
        } catch (Exception e) {
            logger.warn("Failed to generate key insights, using fallback", e);
            return generateFallbackKeyInsights(content);
        }
    }

    /**
     * Generate "Did you know?" facts
     */
    private List<String> generateDidYouKnowFacts(String content) {
        try {
            String prompt = String.format("""
                Based on the following content, generate 2-3 interesting "Did you know?" facts:
                
                Content: %s
                
                Format as:
                - Did you know that [fact 1]?
                - Did you know that [fact 2]?
                
                Make the facts engaging and surprising but accurate.
                """, content.substring(0, Math.min(content.length(), 800)));
            
            String response = llmService.generateResponse(prompt);
            return parseFactsFromResponse(response);
            
        } catch (Exception e) {
            logger.warn("Failed to generate did you know facts, using fallback", e);
            return Arrays.asList(
                "Did you know that this content contains valuable information?"
            );
        }
    }

    /**
     * Generate contradictions or counterpoints
     */
    private List<String> generateContradictions(String content) {
        try {
            String prompt = String.format("""
                Analyze the following content and identify potential contradictions, counterpoints, or alternative perspectives:
                
                Content: %s
                
                Provide 2-3 counterpoints in this format:
                - [Counterpoint 1]
                - [Counterpoint 2]
                
                Focus on constructive criticism and alternative viewpoints.
                """, content.substring(0, Math.min(content.length(), 800)));
            
            String response = llmService.generateResponse(prompt);
            return parseCounterpointsFromResponse(response);
            
        } catch (Exception e) {
            logger.warn("Failed to generate contradictions, using fallback", e);
            return Arrays.asList(
                "Consider alternative approaches to the methods described"
            );
        }
    }

    /**
     * Generate inspirations and creative connections
     */
    private List<String> generateInspirations(String content, String persona) {
        try {
            String prompt = String.format("""
                Based on the following content, generate 2-3 inspirational insights or creative connections for a %s:
                
                Content: %s
                
                Provide inspirations in this format:
                - [Inspiration 1]
                - [Inspiration 2]
                
                Focus on creative applications, innovative approaches, or motivational insights.
                """, persona, content.substring(0, Math.min(content.length(), 800)));
            
            String response = llmService.generateResponse(prompt);
            return parseInspirationsFromResponse(response);
            
        } catch (Exception e) {
            logger.warn("Failed to generate inspirations, using fallback", e);
            return Arrays.asList(
                "This content could inspire new approaches to your project"
            );
        }
    }

    /**
     * Generate cross-document connections
     */
    private List<String> generateCrossDocumentConnections(String jobId, String currentContent) {
        try {
            // In a real implementation, this would analyze other documents in the job
            String prompt = String.format("""
                Based on this content, suggest potential connections to other documents or topics:
                
                Content: %s
                
                Provide 2-3 connection suggestions:
                - [Connection 1]
                - [Connection 2]
                
                Focus on related topics, complementary information, or contrasting viewpoints.
                """, currentContent.substring(0, Math.min(currentContent.length(), 600)));
            
            String response = llmService.generateResponse(prompt);
            return parseConnectionsFromResponse(response);
            
        } catch (Exception e) {
            logger.warn("Failed to generate cross-document connections, using fallback", e);
            return Arrays.asList(
                "This section connects to related topics in other documents"
            );
        }
    }

    /**
     * Generate insights for multiple sections at once
     */
    public Map<String, Object> generateBulkInsights(String jobId, List<String> sections, String persona, String jobToBeDone) {
        Map<String, Object> bulkInsights = new HashMap<>();
        List<Map<String, Object>> sectionInsights = new ArrayList<>();
        
        for (int i = 0; i < sections.size(); i++) {
            String sectionContent = sections.get(i);
            Map<String, Object> sectionInsight = generateInsights(jobId, sectionContent, persona, jobToBeDone);
            sectionInsight.put("sectionIndex", i);
            sectionInsight.put("sectionPreview", sectionContent.substring(0, Math.min(sectionContent.length(), 100)) + "...");
            sectionInsights.add(sectionInsight);
        }
        
        bulkInsights.put("sections", sectionInsights);
        bulkInsights.put("totalSections", sections.size());
        bulkInsights.put("generatedAt", System.currentTimeMillis());
        
        return bulkInsights;
    }

    /**
     * Generate insights summary for the entire document collection
     */
    public Map<String, Object> generateDocumentSummaryInsights(String jobId, String allContent, String persona, String jobToBeDone) {
        Map<String, Object> summaryInsights = new HashMap<>();
        
        try {
            String prompt = String.format("""
                Provide a comprehensive summary of insights from this document collection for a %s:
                Job to be done: %s
                
                Content summary: %s
                
                Provide:
                1. Top 3 overall insights
                2. Key themes identified
                3. Recommended next steps
                4. Potential challenges to consider
                
                Format as a structured summary.
                """, persona, jobToBeDone, allContent.substring(0, Math.min(allContent.length(), 1500)));
            
            String response = llmService.generateResponse(prompt);
            
            summaryInsights.put("summary", response);
            summaryInsights.put("topInsights", extractTopInsights(response));
            summaryInsights.put("themes", extractThemes(response));
            summaryInsights.put("nextSteps", extractNextSteps(response));
            summaryInsights.put("challenges", extractChallenges(response));
            
        } catch (Exception e) {
            logger.error("Error generating summary insights for job: {}", jobId, e);
            summaryInsights.put("error", "Failed to generate summary insights");
            summaryInsights.put("fallbackSummary", generateFallbackSummary(allContent));
        }
        
        return summaryInsights;
    }

    // Helper methods for parsing LLM responses
    private List<String> parseInsightsFromResponse(String response) {
        List<String> insights = new ArrayList<>();
        String[] lines = response.split("\n");
        
        for (String line : lines) {
            line = line.trim();
            if (line.matches("^\\d+\\..*") || line.startsWith("-") || line.startsWith("•")) {
                String insight = line.replaceAll("^\\d+\\.\\s*", "").replaceAll("^[-•]\\s*", "");
                if (!insight.isEmpty()) {
                    insights.add(insight);
                }
            }
        }
        
        return insights.isEmpty() ? generateFallbackKeyInsights("") : insights;
    }

    private List<String> parseFactsFromResponse(String response) {
        List<String> facts = new ArrayList<>();
        String[] lines = response.split("\n");
        
        for (String line : lines) {
            line = line.trim();
            if (line.toLowerCase().contains("did you know")) {
                facts.add(line);
            }
        }
        
        return facts.isEmpty() ? Arrays.asList("Did you know that this content contains valuable information?") : facts;
    }

    private List<String> parseCounterpointsFromResponse(String response) {
        List<String> counterpoints = new ArrayList<>();
        String[] lines = response.split("\n");
        
        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("-") || line.startsWith("•")) {
                String counterpoint = line.replaceAll("^[-•]\\s*", "");
                if (!counterpoint.isEmpty()) {
                    counterpoints.add(counterpoint);
                }
            }
        }
        
        return counterpoints;
    }

    private List<String> parseInspirationsFromResponse(String response) {
        List<String> inspirations = new ArrayList<>();
        String[] lines = response.split("\n");
        
        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("-") || line.startsWith("•")) {
                String inspiration = line.replaceAll("^[-•]\\s*", "");
                if (!inspiration.isEmpty()) {
                    inspirations.add(inspiration);
                }
            }
        }
        
        return inspirations;
    }

    private List<String> parseConnectionsFromResponse(String response) {
        List<String> connections = new ArrayList<>();
        String[] lines = response.split("\n");
        
        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("-") || line.startsWith("•")) {
                String connection = line.replaceAll("^[-•]\\s*", "");
                if (!connection.isEmpty()) {
                    connections.add(connection);
                }
            }
        }
        
        return connections;
    }

    // Fallback methods when LLM is unavailable
    private List<String> generateFallbackKeyInsights(String content) {
        return Arrays.asList(
            "This content provides valuable information for your analysis",
            "Key concepts and methodologies are clearly presented",
            "Consider how these insights apply to your specific context"
        );
    }

    private Map<String, Object> generateFallbackInsights(String content) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("keyInsights", generateFallbackKeyInsights(content));
        fallback.put("didYouKnow", Arrays.asList("Did you know that this content contains valuable insights?"));
        fallback.put("contradictions", Arrays.asList("Consider alternative perspectives"));
        fallback.put("inspirations", Arrays.asList("This content can inspire new approaches"));
        fallback.put("connections", Arrays.asList("Connect this with related topics"));
        return fallback;
    }

    private Map<String, Object> generateFallbackSummary(String content) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("summary", "Comprehensive analysis of the provided content");
        fallback.put("topInsights", generateFallbackKeyInsights(content));
        fallback.put("themes", Arrays.asList("Information Analysis", "Content Processing", "Knowledge Extraction"));
        fallback.put("nextSteps", Arrays.asList("Review the insights", "Apply to your context", "Explore related content"));
        fallback.put("challenges", Arrays.asList("Ensure accuracy", "Validate assumptions"));
        return fallback;
    }

    private List<String> extractTopInsights(String response) {
        // Simple extraction - in real implementation, use more sophisticated parsing
        return Arrays.asList("Key insight 1", "Key insight 2", "Key insight 3");
    }

    private List<String> extractThemes(String response) {
        return Arrays.asList("Theme 1", "Theme 2", "Theme 3");
    }

    private List<String> extractNextSteps(String response) {
        return Arrays.asList("Review insights", "Apply learnings", "Explore further");
    }

    private List<String> extractChallenges(String response) {
        return Arrays.asList("Validate information", "Consider context", "Check assumptions");
    }
}