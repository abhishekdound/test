package com.adobe.hackathon.service;

import com.adobe.hackathon.model.RelatedResult;
import com.adobe.hackathon.model.Section;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * IndexService
 * - stores uploaded PDFs under uploads/<jobId>/
 * - chunks PDFs using PdfChunker
 * - builds TF-IDF vectors using SimilarityService
 * - keeps sections + vectors in memory (ConcurrentHashMap)
 */
@Service
public class IndexService {

    private final PdfChunker chunker;
    private final SimilarityService similarityService;

    // In-memory maps keyed by jobId
    private final Map<String, List<Section>> docs = new ConcurrentHashMap<>();
    private final Map<String, Map<String, float[]>> vectors = new ConcurrentHashMap<>();

    // base folder for saved uploads (relative to working dir)
    private final Path uploadsBase = Paths.get("uploads");

    public IndexService(PdfChunker chunker, SimilarityService similarityService) throws IOException {
        this.chunker = chunker;
        this.similarityService = similarityService;
        // ensure upload dir exists
        Files.createDirectories(uploadsBase);
    }

    /**
     * Analyze (index) uploaded files. Returns a jobId.
     * This method saves the uploaded files to uploads/<jobId>/, chunks them and builds vectors in memory.
     */
    public String analyze(List<MultipartFile> files) throws IOException {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("No files to analyze");
        }

        String jobId = UUID.randomUUID().toString();
        Path jobDir = uploadsBase.resolve(jobId);
        Files.createDirectories(jobDir);

        List<Section> allSections = new ArrayList<>();

        for (MultipartFile file : files) {
            // sanitize filename (fallback if original missing)
            String raw = file.getOriginalFilename();
            String filename = (raw == null || raw.isBlank()) ? "file-" + UUID.randomUUID() : Paths.get(raw).getFileName().toString();
            Path dest = jobDir.resolve(filename);

            // save file to disk
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
            }

            // chunk the saved file (open a fresh InputStream)
            try (InputStream fis = Files.newInputStream(dest, StandardOpenOption.READ)) {
                String docId = jobId + ":" + filename; // logical document id
                List<Section> secs = chunker.chunk(docId, fis);
                allSections.addAll(secs);
            }
        }

        // store sections in memory
        docs.put(jobId, Collections.unmodifiableList(allSections));

        // build tf-idf vectors and store
        Map<String, float[]> vecs = similarityService.buildTfidf(allSections);
        vectors.put(jobId, Collections.unmodifiableMap(vecs));

        return jobId;
    }

    /**
     * Return top-k related sections for a given sectionId in a job.
     * If k <= 0, SimilarityService.defaultTopK is used.
     */
    public List<RelatedResult> related(String jobId, String sectionId, Integer k) {
        List<Section> all = docs.getOrDefault(jobId, Collections.emptyList());
        Map<String, float[]> vec = vectors.get(jobId);
        if (vec == null || all.isEmpty()) return Collections.emptyList();
        return similarityService.topK(sectionId, all, vec, k);
    }

    /** Return all sections for a job. */
    public List<Section> sections(String jobId) {
        return docs.getOrDefault(jobId, Collections.emptyList());
    }

    /** Find the first section for given page (useful to map a page to a section id). */
    public Optional<Section> findFirstSectionForPage(String jobId, int pageNumber) {
        return sections(jobId).stream().filter(s -> s.getPageNumber() == pageNumber).findFirst();
    }

    /** Optional: remove job index and files to free memory/disk */
    public void deleteJob(String jobId) throws IOException {
        docs.remove(jobId);
        vectors.remove(jobId);
        Path jobDir = uploadsBase.resolve(jobId);
        if (Files.exists(jobDir)) {
            // recursive delete
            Files.walk(jobDir)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try { Files.deleteIfExists(p); } catch (IOException ignored) {}
                    });
        }
    }

    /** For debugging: return whether job is indexed */
    public boolean isIndexed(String jobId) {
        return docs.containsKey(jobId) && vectors.containsKey(jobId);
    }
}
