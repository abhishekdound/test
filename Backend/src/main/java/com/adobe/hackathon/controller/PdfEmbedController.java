package com.adobe.hackathon.controller;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/pdf-embed")
public class PdfEmbedController {
    @GetMapping("/file/{jobId}")
    public ResponseEntity<ByteArrayResource> file(@PathVariable String jobId) throws IOException {
        Path p = Paths.get("uploads", jobId, "current.pdf"); // store the uploaded fresh PDF here
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=current.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(new ByteArrayResource(Files.readAllBytes(p)));
    }
}

