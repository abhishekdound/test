package com.adobe.hackathon.model.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for bulk PDF upload operations
 * Supports the Adobe India Hackathon 2025 requirement for bulk upload
 */
public class BulkUploadResponse {
    private String jobId;
    private String status;
    private boolean success;
    private String message;
    private int totalFiles;
    private int processedFiles;
    private LocalDateTime startTime;
    private LocalDateTime estimatedCompletion;
    private List<String> uploadedFiles;
    private List<String> failedFiles;
    private String errorMessage;

    // Constructors
    public BulkUploadResponse() {}

    public BulkUploadResponse(String jobId, String status, boolean success) {
        this.jobId = jobId;
        this.status = status;
        this.success = success;
    }

    // Getters and Setters
    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getTotalFiles() {
        return totalFiles;
    }

    public void setTotalFiles(int totalFiles) {
        this.totalFiles = totalFiles;
    }

    public int getProcessedFiles() {
        return processedFiles;
    }

    public void setProcessedFiles(int processedFiles) {
        this.processedFiles = processedFiles;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEstimatedCompletion() {
        return estimatedCompletion;
    }

    public void setEstimatedCompletion(LocalDateTime estimatedCompletion) {
        this.estimatedCompletion = estimatedCompletion;
    }

    public List<String> getUploadedFiles() {
        return uploadedFiles;
    }

    public void setUploadedFiles(List<String> uploadedFiles) {
        this.uploadedFiles = uploadedFiles;
    }

    public List<String> getFailedFiles() {
        return failedFiles;
    }

    public void setFailedFiles(List<String> failedFiles) {
        this.failedFiles = failedFiles;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}

