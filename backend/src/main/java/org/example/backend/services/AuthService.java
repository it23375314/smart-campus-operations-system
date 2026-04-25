package org.example.backend.services;

import org.example.backend.dtos.AuthResponse;
import org.example.backend.dtos.LoginRequest;
import org.example.backend.dtos.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse createUser(RegisterRequest request, String role);
}