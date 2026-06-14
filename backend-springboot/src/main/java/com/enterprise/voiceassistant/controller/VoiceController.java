package com.enterprise.voiceassistant.controller;

import com.enterprise.voiceassistant.dto.VoiceSessionResponse;
import com.enterprise.voiceassistant.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/voice")
public class VoiceController {

    private final SessionService sessionService;

    public VoiceController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping("/start")
    public ResponseEntity<VoiceSessionResponse> startVoiceSession(HttpServletRequest request) {
        Principal principal = SecurityContextHolder.getContext().getAuthentication();
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        
        String clientIp = request.getRemoteAddr();
        VoiceSessionResponse response = sessionService.startSession(principal.getName(), clientIp);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/stop")
    public ResponseEntity<Void> stopVoiceSession(@RequestParam UUID sessionId) {
        try {
            sessionService.stopSession(sessionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
