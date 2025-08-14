package com.adobe.hackathon.service;

import com.adobe.hackathon.model.RelatedResult;
import com.adobe.hackathon.model.Section;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.StringReader;
import java.util.*;
import java.util.stream.Collectors;

/**
 * CPU-only TF-IDF + cosine similarity for related sections (no LLM, no network).
 */
@Service
public class SimilarityService {

    // Tunables (override in application.yml if needed)
    @Value("${app.analysis.topK:3}")
    private int defaultTopK;

    @Value("${app.analysis.similarityThreshold:0.30}")
    private double similarityThreshold;

    @Value("${app.analysis.snippetChars:220}")
    private int snippetChars;

    // Minimal English stopword list (extend if you want)
    private static final Set<String> STOP = new HashSet<>(Arrays.asList(
            "a","an","the","and","or","but","if","then","else","than","that","this","those","these",
            "to","of","in","on","for","with","as","by","at","from","into","about","over","after",
            "before","between","during","without","within","while","is","am","are","was","were",
            "be","been","being","it","its","he","she","they","them","we","you","i","my","your",
            "their","our","me","him","her","us","do","does","did","done","can","could","should",
            "would","may","might","will","shall","not","no","yes","up","down","out","so","such"
    ));

    /** Build TF-IDF vectors (L2-normalized) for all sections. */
    public Map<String, float[]> buildTfidf(List<Section> sections) {
        // Term frequencies per section
        Map<String, Map<String, Integer>> tf = new HashMap<>();
        // Document frequency per term
        Map<String, Integer> df = new HashMap<>();

        for (Section s : sections) {
            Map<String, Integer> counts = termCounts(s.getText());
            tf.put(s.getId(), counts);
            for (String t : counts.keySet()) {
                df.put(t, df.getOrDefault(t, 0) + 1);
            }
        }

        int N = Math.max(1, sections.size());
        // Build IDF
        Map<String, Double> idf = new HashMap<>(df.size());
        for (Map.Entry<String, Integer> e : df.entrySet()) {
            // Smoothed IDF
            idf.put(e.getKey(), Math.log(1.0 + (double) N / (1.0 + e.getValue())));
        }

        // Stable vocabulary ordering
        List<String> vocab = new ArrayList<>(idf.keySet());
        Collections.sort(vocab);

        // Vectorize each section
        Map<String, float[]> vectors = new HashMap<>();
        for (Section s : sections) {
            Map<String, Integer> counts = tf.getOrDefault(s.getId(), Map.of());
            int maxTf = counts.values().stream().mapToInt(i -> i).max().orElse(1);

            float[] v = new float[vocab.size()];
            for (int i = 0; i < vocab.size(); i++) {
                String term = vocab.get(i);
                int f = counts.getOrDefault(term, 0);
                double tfNorm = (double) f / maxTf;           // 0..1
                double tfidf = tfNorm * idf.getOrDefault(term, 0.0);
                v[i] = (float) tfidf;
            }

            // L2 normalize
            double norm = 0.0;
            for (float x : v) norm += x * x;
            norm = Math.sqrt(norm);
            if (norm > 0) {
                for (int i = 0; i < v.length; i++) v[i] /= norm;
            }

            vectors.put(s.getId(), v);
        }
        return vectors;
        // Note: keep 'vectors' alongside the same 'sections' list per job/session.
    }

    /** Return top-K related sections to the given sectionId using cosine similarity. */
    public List<RelatedResult> topK(String sectionId,
                                    List<Section> all,
                                    Map<String, float[]> vectors,
                                    Integer kOpt) {

        int k = (kOpt == null || kOpt <= 0) ? defaultTopK : kOpt;
        float[] q = vectors.get(sectionId);
        if (q == null || all.isEmpty()) return List.of();

        PriorityQueue<RelatedResult> pq = new PriorityQueue<>(Comparator.comparingDouble(r -> r.getScore()));
        Map<String, Section> byId = all.stream().collect(Collectors.toMap(Section::getId, s -> s));

        for (Section s : all) {
            if (s.getId().equals(sectionId)) continue;
            float[] v = vectors.get(s.getId());
            if (v == null || v.length != q.length) continue;

            double score = cosine(q, v);
            if (score < similarityThreshold) continue;

            RelatedResult rr = new RelatedResult(
                    s.getId(),
                    s.getDocId(),
                    s.getTitle(),
                    s.getPageNumber(),
                    snippet(s.getText()),
                    score
            );

            pq.offer(rr);
            if (pq.size() > k) pq.poll();
        }

        List<RelatedResult> res = new ArrayList<>(pq);
        res.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        return res;
    }

    /* -------------------- helpers -------------------- */

    private double cosine(float[] a, float[] b) {
        double s = 0.0;
        int n = Math.min(a.length, b.length);
        for (int i = 0; i < n; i++) s += a[i] * b[i];
        return s;
    }

    private Map<String, Integer> termCounts(String text) {
        Map<String, Integer> counts = new HashMap<>();
        if (text == null) return counts;

        String lower = text.toLowerCase(Locale.ROOT);
        // keep letters and digits; split on non-alphanum
        String[] toks = lower.split("[^a-z0-9]+");
        for (String t : toks) {
            if (t.length() < 2) continue;
            if (STOP.contains(t)) continue;
            counts.put(t, counts.getOrDefault(t, 0) + 1);
        }
        return counts;
    }

    private String snippet(String text) {
        if (text == null) return "";
        String s = text.trim();
        if (s.length() <= snippetChars) return s;
        // try to cut on sentence boundary
        int cut = Math.min(snippetChars, s.length());
        int dot = s.lastIndexOf('.', cut);
        if (dot >= 80) return s.substring(0, dot + 1);
        return s.substring(0, cut) + "…";
    }
}
