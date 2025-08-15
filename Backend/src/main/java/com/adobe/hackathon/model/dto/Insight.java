package com.adobe.hackathon.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Insight {
    private String type;
    private String content;
    private String source;
    private double relevanceScore;

    public Insight() {}

    public Insight(String type, String content, String source, double relevanceScore) {
        this.type = type;
        this.content = content;
        this.source = source;
        this.relevanceScore = relevanceScore;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public double getRelevanceScore() {
        return relevanceScore;
    }

    public void setRelevanceScore(double relevanceScore) {
        this.relevanceScore = relevanceScore;
    }
}

