package com.adobe.hackathon.model.dto;

import java.util.List;

/**
 * Response DTO for navigation and highlighted sections
 * Supports the Adobe India Hackathon 2025 requirement for >80% accuracy highlighting
 */
public class NavigationResponse {
    private boolean success;
    private String jobId;
    private List<HighlightedSection> highlightedSections;
    private int totalSections;
    private double averageAccuracy;
    private String responseTime;
    private String error;

    // Constructors
    public NavigationResponse() {}

    public NavigationResponse(boolean success, String jobId) {
        this.success = success;
        this.jobId = jobId;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public List<HighlightedSection> getHighlightedSections() {
        return highlightedSections;
    }

    public void setHighlightedSections(List<HighlightedSection> highlightedSections) {
        this.highlightedSections = highlightedSections;
    }

    public int getTotalSections() {
        return totalSections;
    }

    public void setTotalSections(int totalSections) {
        this.totalSections = totalSections;
    }

    public double getAverageAccuracy() {
        return averageAccuracy;
    }

    public void setAverageAccuracy(double averageAccuracy) {
        this.averageAccuracy = averageAccuracy;
    }

    public String getResponseTime() {
        return responseTime;
    }

    public void setResponseTime(String responseTime) {
        this.responseTime = responseTime;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}

