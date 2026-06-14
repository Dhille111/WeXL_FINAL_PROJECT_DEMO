package com.enterprise.voiceassistant.controller;

import com.enterprise.voiceassistant.dto.FAQDTO;
import com.enterprise.voiceassistant.service.FAQService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/faqs")
public class FAQController {

    private final FAQService faqService;

    public FAQController(FAQService faqService) {
        this.faqService = faqService;
    }

    @GetMapping
    public ResponseEntity<List<FAQDTO>> getAllFAQs() {
        return ResponseEntity.ok(faqService.getAllFAQs());
    }

    @PostMapping
    public ResponseEntity<FAQDTO> createFAQ(@RequestBody FAQDTO faqDto) {
        return ResponseEntity.ok(faqService.createFAQ(faqDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FAQDTO> updateFAQ(@PathVariable Long id, @RequestBody FAQDTO faqDto) {
        try {
            return ResponseEntity.ok(faqService.updateFAQ(id, faqDto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFAQ(@PathVariable Long id) {
        faqService.deleteFAQ(id);
        return ResponseEntity.noContent().build();
    }
}
