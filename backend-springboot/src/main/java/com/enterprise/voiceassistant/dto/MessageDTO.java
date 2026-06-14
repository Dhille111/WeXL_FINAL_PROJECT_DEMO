package com.enterprise.voiceassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDTO {
    private String role; // USER, ASSISTANT
    private String content;
    private LocalDateTime createdAt;
    private Integer sequenceNumber;
}
