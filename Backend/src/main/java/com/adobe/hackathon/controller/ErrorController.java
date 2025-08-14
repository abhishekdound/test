
package com.adobe.hackathon.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Map<String, Object> errorResponse = new HashMap<>();
        
        Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");
        String errorMessage = (String) request.getAttribute("javax.servlet.error.message");
        String requestURI = (String) request.getAttribute("javax.servlet.error.request_uri");

        errorResponse.put("status", statusCode != null ? statusCode : 500);
        errorResponse.put("error", errorMessage != null ? errorMessage : "An unexpected error occurred");
        errorResponse.put("path", requestURI != null ? requestURI : "unknown");
        errorResponse.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.status(statusCode != null ? statusCode : 500).body(errorResponse);
    }
}
