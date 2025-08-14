package com.adobe.hackathon.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.io.Serializable;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RelatedResult implements Serializable {
    private String id;          // section id
    private String docId;       // document id
    private String title;       // display title
    private int pageNumber;     // target page
    private String snippet;     // 1-2 sentence summary/extract
    private double score;       // similarity score (0..1)

    public RelatedResult() {}

    public RelatedResult(String id, String docId, String title, int pageNumber, String snippet, double score) {
        this.id = id;
        this.docId = docId;
        this.title = title;
        this.pageNumber = pageNumber;
        this.snippet = snippet;
        this.score = score;
    }

    // getters/setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDocId() { return docId; }
    public void setDocId(String docId) { this.docId = docId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getPageNumber() { return pageNumber; }
    public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }

    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }
}
