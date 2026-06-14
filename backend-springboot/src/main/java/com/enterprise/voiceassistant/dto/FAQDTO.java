package com.enterprise.voiceassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FAQDTO {
    private Long id;
    private String question;
    private String answer;
    private List<String> aliases;
}
