package com.adobe.hackathon.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
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
        Map<String, Object> errorResponse = new HashMap<>();

        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        if (status != null) {
            Integer statusCode = Integer.valueOf(status.toString());
            errorResponse.put("status", statusCode);
            errorResponse.put("error", HttpStatus.valueOf(statusCode).getReasonPhrase());
        } else {
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
        }

        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        errorResponse.put("message", message != null ? message.toString() : "An unexpected error occurred");
        errorResponse.put("path", request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI));
        errorResponse.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.status((Integer) errorResponse.get("status")).body(errorResponse);
    }
}