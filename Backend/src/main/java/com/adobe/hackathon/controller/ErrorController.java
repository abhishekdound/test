
package com.adobe.hackathon.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.WebRequest;
import java.util.Map;
import java.util.HashMap;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleError(WebRequest request) {
        Map<String, Object> errorResponse = new HashMap<>();
        
        Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code", 0);
        String errorMessage = (String) request.getAttribute("javax.servlet.error.message", 0);
        String requestURI = (String) request.getAttribute("javax.servlet.error.request_uri", 0);

        errorResponse.put("status", statusCode != null ? statusCode : 500);
        errorResponse.put("error", errorMessage != null ? errorMessage : "An unexpected error occurred");
        errorResponse.put("path", requestURI != null ? requestURI : "unknown");
        errorResponse.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.status(statusCode != null ? statusCode : 500).body(errorResponse);
    }
}
