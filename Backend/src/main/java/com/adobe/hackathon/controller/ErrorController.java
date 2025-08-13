
package com.adobe.hackathon.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        
        if (status != null) {
            Integer statusCode = Integer.valueOf(status.toString());
            
            response.put("status", statusCode);
            response.put("error", HttpStatus.valueOf(statusCode).getReasonPhrase());
            response.put("message", "An error occurred");
            response.put("timestamp", System.currentTimeMillis());
            
            // Add path information
            Object path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
            if (path != null) {
                response.put("path", path.toString());
            }
            
            return ResponseEntity.status(statusCode).body(response);
        }
        
        response.put("status", 500);
        response.put("error", "Internal Server Error");
        response.put("message", "An unexpected error occurred");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
