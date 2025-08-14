package com.adobe.hackathon.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.io.Serializable;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Section implements Serializable {
    private String id;        // e.g. "<jobId>:<filename>:<page>:<chunk>"
    private String docId;     // e.g. "<jobId>:<filename>"
    private int pageNumber;   // 1-based page number
    private String title;     // display title (e.g. "Page 3 • 2")
    private String text;      // raw chunk text

    public Section() {}

    public Section(String id, String docId, int pageNumber, String title, String text) {
        this.id = id;
        this.docId = docId;
        this.pageNumber = pageNumber;
        this.title = title;
        this.text = text;
    }

    // getters/setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDocId() { return docId; }
    public void setDocId(String docId) { this.docId = docId; }

    public int getPageNumber() { return pageNumber; }
    public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
