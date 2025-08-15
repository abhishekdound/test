package com.adobe.hackathon.model.dto;

/**
 * DTO for highlighted sections with explanations
 * Supports the Adobe India Hackathon 2025 requirement for >80% accuracy and short explanations
 */
public class HighlightedSection {
    private PDFSectionInfo section;
    private String explanation;
    private String navigationUrl;
    private double relevanceScore;
    private String snippet;

    // Constructors
    public HighlightedSection() {}

    public HighlightedSection(PDFSectionInfo section, String explanation, String navigationUrl) {
        this.section = section;
        this.explanation = explanation;
        this.navigationUrl = navigationUrl;
        this.relevanceScore = section.getRelevanceScore();
    }

    // Getters and Setters
    public PDFSectionInfo getSection() {
        return section;
    }

    public void setSection(PDFSectionInfo section) {
        this.section = section;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getNavigationUrl() {
        return navigationUrl;
    }

    public void setNavigationUrl(String navigationUrl) {
        this.navigationUrl = navigationUrl;
    }

    public double getRelevanceScore() {
        return relevanceScore;
    }

    public void setRelevanceScore(double relevanceScore) {
        this.relevanceScore = relevanceScore;
    }

    public String getSnippet() {
        return snippet;
    }

    public void setSnippet(String snippet) {
        this.snippet = snippet;
    }
}

