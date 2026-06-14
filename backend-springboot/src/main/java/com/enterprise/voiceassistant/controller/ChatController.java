package com.enterprise.voiceassistant.controller;

import com.enterprise.voiceassistant.dto.MessageDTO;
import com.enterprise.voiceassistant.dto.VoiceSessionResponse;
import com.enterprise.voiceassistant.service.SessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final SessionService sessionService;

    public ChatController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/history")
    public ResponseEntity<List<VoiceSessionResponse>> getChatHistory() {
        Principal principal = SecurityContextHolder.getContext().getAuthentication();
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(sessionService.getUserSessions(principal.getName()));
    }

    @GetMapping("/messages")
    public ResponseEntity<List<MessageDTO>> getSessionMessages(@RequestParam UUID sessionId) {
        return ResponseEntity.ok(sessionService.getSessionMessages(sessionId));
    }

    @PostMapping("/message")
    public ResponseEntity<Void> receiveMessage(@RequestParam UUID sessionId, @RequestBody Map<String, String> body) {
        String role = body.get("role"); // USER, ASSISTANT
        String content = body.get("content");
        
        if (role == null || content == null) {
            return ResponseEntity.badRequest().build();
        }
        
        sessionService.saveMessage(sessionId, role, content);
        return ResponseEntity.ok().build();
    }
}
