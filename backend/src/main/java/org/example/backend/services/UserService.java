package org.example.backend.services;

import org.example.backend.dtos.UserResponse;
import org.example.backend.models.User;

import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(String id);
    UserResponse updateUserRole(String id, String role);
    void deleteUser(String id);
    UserResponse deactivateUser(String id);
    List<User> getManagers();
}