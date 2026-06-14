package com.enterprise.voiceassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoiceSessionResponse {
    private UUID sessionId;
    private String roomUrl;
    private String token;
    private String status;
}
