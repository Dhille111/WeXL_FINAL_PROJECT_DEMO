package com.enterprise.voiceassistant.service;

import com.enterprise.voiceassistant.dto.MessageDTO;
import com.enterprise.voiceassistant.dto.VoiceSessionResponse;
import com.enterprise.voiceassistant.entity.Message;
import java.util.List;
import java.util.UUID;

public interface SessionService {
    VoiceSessionResponse startSession(String username, String clientIp);
    void stopSession(UUID sessionId);
    Message saveMessage(UUID sessionId, String role, String content);
    List<MessageDTO> getSessionMessages(UUID sessionId);
    List<VoiceSessionResponse> getUserSessions(String username);
}
