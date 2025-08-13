
package com.adobe.hackathon.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Map<String, Object> errorDetails = new HashMap<>();
        
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        
        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            
            errorDetails.put("status", statusCode);
            errorDetails.put("timestamp", System.currentTimeMillis());
            
            if (statusCode == HttpStatus.NOT_FOUND.value()) {
                errorDetails.put("error", "Not Found");
                errorDetails.put("message", "The requested resource was not found");
                errorDetails.put("path", request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI));
            } else if (statusCode == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
                errorDetails.put("error", "Internal Server Error");
                errorDetails.put("message", "An unexpected error occurred");
            } else {
                errorDetails.put("error", "Error");
                errorDetails.put("message", "An error occurred");
            }
            
            return new ResponseEntity<>(errorDetails, HttpStatus.valueOf(statusCode));
        }
        
        errorDetails.put("status", 500);
        errorDetails.put("error", "Unknown Error");
        errorDetails.put("message", "An unknown error occurred");
        errorDetails.put("timestamp", System.currentTimeMillis());
        
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
