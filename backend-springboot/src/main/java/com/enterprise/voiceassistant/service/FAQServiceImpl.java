package com.enterprise.voiceassistant.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.enterprise.voiceassistant.dto.FAQDTO;
import com.enterprise.voiceassistant.entity.FAQ;
import com.enterprise.voiceassistant.repository.FAQRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FAQServiceImpl implements FAQService {

    private final FAQRepository faqRepository;
    private final ObjectMapper objectMapper;

    public FAQServiceImpl(FAQRepository faqRepository, ObjectMapper objectMapper) {
        this.faqRepository = faqRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FAQDTO> getAllFAQs() {
        return faqRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FAQDTO createFAQ(FAQDTO faqDto) {
        FAQ faq = convertToEntity(faqDto);
        FAQ saved = faqRepository.save(faq);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public FAQDTO updateFAQ(Long id, FAQDTO faqDto) {
        FAQ existing = faqRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("FAQ not found with ID: " + id));

        existing.setQuestion(faqDto.getQuestion());
        existing.setAnswer(faqDto.getAnswer());
        existing.setAliases(serializeAliases(faqDto.getAliases()));

        FAQ saved = faqRepository.save(existing);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteFAQ(Long id) {
        faqRepository.deleteById(id);
    }

    private FAQDTO convertToDTO(FAQ faq) {
        return FAQDTO.builder()
                .id(faq.getId())
                .question(faq.getQuestion())
                .answer(faq.getAnswer())
                .aliases(deserializeAliases(faq.getAliases()))
                .build();
    }

    private FAQ convertToEntity(FAQDTO dto) {
        return FAQ.builder()
                .question(dto.getQuestion())
                .answer(dto.getAnswer())
                .aliases(serializeAliases(dto.getAliases()))
                .build();
    }

    private String serializeAliases(List<String> aliases) {
        if (aliases == null) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(aliases);
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<String> deserializeAliases(String aliasesJson) {
        if (aliasesJson == null || aliasesJson.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(aliasesJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
