package com.enterprise.voiceassistant.repository;

import com.enterprise.voiceassistant.entity.Analytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnalyticsRepository extends JpaRepository<Analytics, Long> {
    List<Analytics> findByUserIdOrderByCreatedAtDesc(Long userId);
}
