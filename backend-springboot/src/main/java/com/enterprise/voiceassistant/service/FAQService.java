package com.enterprise.voiceassistant.service;

import com.enterprise.voiceassistant.dto.FAQDTO;
import java.util.List;

public interface FAQService {
    List<FAQDTO> getAllFAQs();
    FAQDTO createFAQ(FAQDTO faqDto);
    FAQDTO updateFAQ(Long id, FAQDTO faqDto);
    void deleteFAQ(Long id);
}
