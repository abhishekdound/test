package com.adobe.hackathon.service;

import com.adobe.hackathon.model.Section;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class PdfChunker {

    // Tunables (can be overridden from application.yml)
    @Value("${app.analysis.targetWords:300}")
    private int targetWords;

    @Value("${app.analysis.overlapWords:120}")
    private int overlapWords;

    @Value("${app.analysis.minChunkChars:160}")
    private int minChunkChars;

    /**
     * Chunk a PDF into overlapping text windows per page.
     * @param docId logical document id (e.g., jobId:filename.pdf)
     * @param pdf   input stream of the PDF
     */
    public List<Section> chunk(String docId, InputStream pdf) throws IOException {
        List<Section> out = new ArrayList<>();
        try (PDDocument doc = PDDocument.load(pdf)) {
            PDFTextStripper stripper = new PDFTextStripper();

            int pages = doc.getNumberOfPages();
            for (int page = 1; page <= pages; page++) {
                stripper.setStartPage(page);
                stripper.setEndPage(page);

                String pageText = clean(stripper.getText(doc));
                if (pageText.isBlank()) continue;

                List<String> windows = splitIntoWindows(pageText, targetWords, overlapWords);

                int chunkIdx = 0;
                for (String w : windows) {
                    if (w.length() < minChunkChars) continue;
                    chunkIdx++;

                    String id = docId + ":" + page + ":" + chunkIdx;
                    String title = "Page " + page + " • " + chunkIdx;

                    out.add(new Section(id, docId, page, title, w));
                }
            }
        }
        return out;
    }

    /* ---------- helpers ---------- */

    private String clean(String s) {
        // collapse whitespace; keep punctuation
        return s == null ? "" : s.replaceAll("\\s+", " ").trim();
    }

    /**
     * Split text into overlapping word windows.
     * @param text         input text
     * @param targetWords  words per window (e.g., 300)
     * @param overlapWords overlap between consecutive windows (e.g., 120)
     */
    private List<String> splitIntoWindows(String text, int targetWords, int overlapWords) {
        String[] words = text.split("\\s+");
        List<String> out = new ArrayList<>();
        if (words.length == 0) return out;

        int step = Math.max(1, targetWords - overlapWords);
        for (int i = 0; i < words.length; i += step) {
            int end = Math.min(words.length, i + targetWords);
            String win = String.join(" ", Arrays.copyOfRange(words, i, end));
            if (!win.isBlank()) out.add(win);
            if (end >= words.length) break;
        }
        return out;
    }
}
