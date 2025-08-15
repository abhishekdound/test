package com.adobe.hackathon.model.dto;

import java.util.List;

/**
 * Response DTO for podcast generation
 * Supports the Adobe India Hackathon 2025 requirement for 2-5 minute narrated audio overview
 */
public class PodcastResponse {
    private boolean success;
    private String jobId;
    private String audioUrl;
    private int duration; // Duration in seconds
    private int insightsCount;
    private String script;
    private String error;
    private List<String> insights;

    // Constructors
    public PodcastResponse() {}

    public PodcastResponse(boolean success, String jobId) {
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

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public int getInsightsCount() {
        return insightsCount;
    }

    public void setInsightsCount(int insightsCount) {
        this.insightsCount = insightsCount;
    }

    public String getScript() {
        return script;
    }

    public void setScript(String script) {
        this.script = script;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public List<String> getInsights() {
        return insights;
    }

    public void setInsights(List<String> insights) {
        this.insights = insights;
    }

    // Helper methods
    public String getFormattedDuration() {
        int minutes = duration / 60;
        int seconds = duration % 60;
        return String.format("%d:%02d", minutes, seconds);
    }

    public boolean isWithinTimeLimit() {
        // Check if duration is within 2-5 minutes (120-300 seconds)
        return duration >= 120 && duration <= 300;
    }
}

