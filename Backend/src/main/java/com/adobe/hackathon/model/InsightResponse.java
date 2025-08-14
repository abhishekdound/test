package com.adobe.hackathon.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class InsightResponse implements Serializable {
    private List<String> keyInsights = new ArrayList<>();
    private List<String> didYouKnow = new ArrayList<>();
    private List<String> contradictions = new ArrayList<>();
    private List<String> connections = new ArrayList<>();

    public InsightResponse() {}

    public List<String> getKeyInsights() { return keyInsights; }
    public void setKeyInsights(List<String> keyInsights) { this.keyInsights = nonNull(keyInsights); }

    public List<String> getDidYouKnow() { return didYouKnow; }
    public void setDidYouKnow(List<String> didYouKnow) { this.didYouKnow = nonNull(didYouKnow); }

    public List<String> getContradictions() { return contradictions; }
    public void setContradictions(List<String> contradictions) { this.contradictions = nonNull(contradictions); }

    public List<String> getConnections() { return connections; }
    public void setConnections(List<String> connections) { this.connections = nonNull(connections); }

    private static <T> List<T> nonNull(List<T> in) {
        return (in == null) ? new ArrayList<>() : in;
    }
}
