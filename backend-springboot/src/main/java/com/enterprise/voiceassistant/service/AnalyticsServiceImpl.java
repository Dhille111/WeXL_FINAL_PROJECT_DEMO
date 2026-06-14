package com.enterprise.voiceassistant.service;

import com.enterprise.voiceassistant.repository.AnalyticsRepository;
import com.enterprise.voiceassistant.repository.FAQRepository;
import com.enterprise.voiceassistant.repository.SessionRepository;
import com.enterprise.voiceassistant.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final AnalyticsRepository analyticsRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final FAQRepository faqRepository;

    public AnalyticsServiceImpl(AnalyticsRepository analyticsRepository,
                                SessionRepository sessionRepository,
                                UserRepository userRepository,
                                FAQRepository faqRepository) {
        this.analyticsRepository = analyticsRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.faqRepository = faqRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getSystemDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long totalSessions = sessionRepository.count();
        long totalFAQs = faqRepository.count();
        long totalMetricsLogged = analyticsRepository.count();

        // Calculate token aggregates
        long totalInputTokens = analyticsRepository.findAll().stream()
                .mapToLong(a -> a.getInputTokens() != null ? a.getInputTokens() : 0)
                .sum();
        
        long totalOutputTokens = analyticsRepository.findAll().stream()
                .mapToLong(a -> a.getOutputTokens() != null ? a.getOutputTokens() : 0)
                .sum();

        long totalDurationSeconds = analyticsRepository.findAll().stream()
                .mapToLong(a -> a.getDurationSeconds() != null ? a.getDurationSeconds() : 0)
                .sum();

        stats.put("totalUsers", totalUsers);
        stats.put("totalSessions", totalSessions);
        stats.put("totalFAQs", totalFAQs);
        stats.put("totalMetricsLogged", totalMetricsLogged);
        stats.put("totalInputTokens", totalInputTokens);
        stats.put("totalOutputTokens", totalOutputTokens);
        stats.put("totalDurationSeconds", totalDurationSeconds);
        stats.put("averageSessionDuration", totalSessions > 0 ? (double) totalDurationSeconds / totalSessions : 0.0);

        return stats;
    }
}
