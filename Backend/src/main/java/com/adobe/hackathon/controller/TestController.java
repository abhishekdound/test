package com.adobe.hackathon.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080", "http://127.0.0.1:8080"}, allowCredentials = "false")
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "Backend is working!";
    }

    @GetMapping("/api/test")
    public String apiTest() {
        return "API is working!";
    }
}
