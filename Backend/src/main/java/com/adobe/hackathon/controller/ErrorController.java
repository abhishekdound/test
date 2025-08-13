
package com.adobe.hackathon.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object requestUri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        
        response.put("success", false);
        response.put("error", "An error occurred");
        response.put("status", status != null ? status : 500);
        response.put("message", message != null ? message.toString() : "Internal Server Error");
        response.put("path", requestUri != null ? requestUri.toString() : request.getRequestURI());
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(status != null ? (Integer) status : 500).body(response);
    }
}
