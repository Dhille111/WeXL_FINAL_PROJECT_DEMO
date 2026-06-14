package com.enterprise.voiceassistant.service;

import com.enterprise.voiceassistant.entity.User;
import com.enterprise.voiceassistant.dto.AuthRequest;
import com.enterprise.voiceassistant.dto.AuthResponse;

public interface UserService {
    AuthResponse registerUser(User user);
    AuthResponse loginUser(AuthRequest request);
    User findByUsername(String username);
}
