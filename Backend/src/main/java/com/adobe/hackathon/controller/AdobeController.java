package com.adobe.hackathon.controller;

import com.adobe.hackathon.model.InsightResponse;
import com.adobe.hackathon.model.RelatedResult;
import com.adobe.hackathon.service.IndexService;
import com.adobe.hackathon.service.LlmService;
import com.adobe.hackathon.service.TtsService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/adobe")
public class AdobeController {
    private final IndexService index;
    private final LlmService llm;
    private final TtsService tts;

    public AdobeController(IndexService i, LlmService l, TtsService t){ this.index=i; this.llm=l; this.tts=t; }

    @PostMapping("/analyze")
    public Map<String,String> analyze(@RequestParam("files") List<MultipartFile> files) throws IOException {
        return Map.of("jobId", index.analyze(files));
    }

    @GetMapping("/related-sections/{jobId}/{sectionId}")
    public List<RelatedResult> related(@PathVariable String jobId, @PathVariable String sectionId) {
        return index.related(jobId, sectionId, 3);
    }

    @PostMapping("/insights/{jobId}")
    public InsightResponse insights(@PathVariable String jobId) throws JsonProcessingException {
        var ctx = index.sections(jobId).stream().limit(12).map(s -> s.getText()).collect(Collectors.joining("\n\n"));
        return llm.generateInsights(ctx);
    }

    @PostMapping("/podcast/{jobId}")
    public Map<String,String> podcast(@PathVariable String jobId) {
        String script = llm.podcastScript(index.sections(jobId));
        String url = tts.synthesize(script); // return file URL
        return Map.of("audioUrl", url);
    }
}

