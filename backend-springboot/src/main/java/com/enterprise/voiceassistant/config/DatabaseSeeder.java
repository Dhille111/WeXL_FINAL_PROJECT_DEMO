package com.enterprise.voiceassistant.config;

import com.enterprise.voiceassistant.entity.Role;
import com.enterprise.voiceassistant.entity.User;
import com.enterprise.voiceassistant.entity.FAQ;
import com.enterprise.voiceassistant.repository.RoleRepository;
import com.enterprise.voiceassistant.repository.UserRepository;
import com.enterprise.voiceassistant.repository.FAQRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final FAQRepository faqRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public DatabaseSeeder(RoleRepository roleRepository,
                          UserRepository userRepository,
                          FAQRepository faqRepository,
                          PasswordEncoder passwordEncoder,
                          ObjectMapper objectMapper) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.faqRepository = faqRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

        // 2. Seed Default User
        if (userRepository.count() == 0) {
            log.info("Seeding default administrator user: admin / password123");
            User admin = User.builder()
                    .username("admin")
                    .email("admin@enterprise.com")
                    .password(passwordEncoder.encode("password123"))
                    .roles(new HashSet<>(List.of(userRole, adminRole)))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            userRepository.save(admin);
        }

        // 3. Seed FAQs from predefined_qa.json
        if (faqRepository.count() == 0) {
            log.info("Seeding FAQs database table...");
            
            // Try to find the file in root directory or parent
            File qaFile = new File("../predefined_qa.json");
            if (!qaFile.exists()) {
                qaFile = new File("predefined_qa.json");
            }
            if (!qaFile.exists()) {
                qaFile = new File("pipecat-quickstart/predefined_qa.json");
            }

            if (qaFile.exists()) {
                try {
                    Map<String, Object> data = objectMapper.readValue(qaFile, new TypeReference<Map<String, Object>>() {});
                    List<Map<String, Object>> entries = (List<Map<String, Object>>) data.get("entries");
                    if (entries != null) {
                        for (Map<String, Object> entry : entries) {
                            String question = (String) entry.get("question");
                            String answer = (String) entry.get("answer");
                            Object aliasesObj = entry.get("aliases");
                            String aliasesJson = "[]";
                            
                            if (aliasesObj != null) {
                                aliasesJson = objectMapper.writeValueAsString(aliasesObj);
                            }
                            
                            FAQ faq = FAQ.builder()
                                    .question(question)
                                    .answer(answer)
                                    .aliases(aliasesJson)
                                    .createdAt(LocalDateTime.now())
                                    .updatedAt(LocalDateTime.now())
                                    .build();
                            faqRepository.save(faq);
                        }
                        log.info("Successfully seeded {} FAQ records from {}", entries.size(), qaFile.getName());
                    }
                } catch (Exception e) {
                    log.error("Failed to parse predefined_qa.json: {}", e.getMessage());
                    seedMockFAQs();
                }
            } else {
                log.warn("Could not find predefined_qa.json file. Seeding mock FAQs.");
                seedMockFAQs();
            }
        }
    }

    private void seedMockFAQs() {
        FAQ faq1 = FAQ.builder()
                .question("What is your office hours?")
                .answer("Our enterprise office hours are 9 AM to 6 PM Monday to Friday.")
                .aliases("[\"hours\", \"office opening\"]")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        FAQ faq2 = FAQ.builder()
                .question("How do I contact customer support?")
                .answer("You can contact support via email at support@enterprise.com or call 1-800-555-0199.")
                .aliases("[\"contact\", \"support phone\"]")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        faqRepository.save(faq1);
        faqRepository.save(faq2);
    }
}
