
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
        Map<String, Object> errorResponse = new HashMap<>();
        
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        
        if (status != null) {
            Integer statusCode = Integer.valueOf(status.toString());
            
            switch (statusCode) {
                case 404:
                    errorResponse.put("error", "Page Not Found");
                    errorResponse.put("message", "The requested resource was not found");
                    break;
                case 500:
                    errorResponse.put("error", "Internal Server Error");
                    errorResponse.put("message", "An internal server error occurred");
                    break;
                default:
                    errorResponse.put("error", "Error");
                    errorResponse.put("message", "An error occurred");
            }
            
            errorResponse.put("status", statusCode);
            errorResponse.put("path", request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI));
            
            return ResponseEntity.status(statusCode).body(errorResponse);
        }
        
        errorResponse.put("error", "Unknown Error");
        errorResponse.put("message", "An unknown error occurred");
        errorResponse.put("status", 500);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
