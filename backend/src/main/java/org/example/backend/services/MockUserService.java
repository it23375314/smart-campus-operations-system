package org.example.backend.services;

import org.example.backend.dtos.UserResponse;
import org.example.backend.models.Role;
import org.example.backend.models.User;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Profile("mock")
public class MockUserService implements UserService {

    private final List<User> mockUsers = new ArrayList<>();

    public MockUserService() {
        mockUsers.add(createMockUser("Admin-1", "Admin User", "admin@campus.edu", Role.ADMIN));
        mockUsers.add(createMockUser("Admin-2", "Sarah Smith", "sarah@campus.edu", Role.ADMIN));
        mockUsers.add(createMockUser("Admin-3", "John Doe", "john@campus.edu", Role.ADMIN));
        mockUsers.add(createMockUser("User-A", "John Student", "student@campus.edu", Role.USER));
        mockUsers.add(createMockUser("User-B", "Jane Staff", "staff@campus.edu", Role.USER));
        mockUsers.add(createMockUser("User-C", "Bob Graduate", "grad@campus.edu", Role.USER));
    }

    private User createMockUser(String id, String name, String email, Role role) {
        User u = new User();
        u.setId(id);
        u.setName(name);
        u.setEmail(email);
        u.setRole(role);
        u.setActive(true);
        return u;
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return mockUsers.stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.isActive()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(String id) {
        User user = mockUsers.stream().filter(u -> u.getId().equals(id)).findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive()
        );
    }

    @Override
    public UserResponse updateUserRole(String id, String role) {
        User user = mockUsers.stream().filter(u -> u.getId().equals(id)).findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.valueOf(role.toUpperCase()));
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive()
        );
    }

    @Override
    public void deleteUser(String id) {
        mockUsers.removeIf(u -> u.getId().equals(id));
    }

    @Override
    public UserResponse deactivateUser(String id) {
        User user = mockUsers.stream().filter(u -> u.getId().equals(id)).findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive()
        );
    }

    @Override
    public List<User> getManagers() {
        return mockUsers.stream().filter(u -> u.getRole() == Role.MANAGER || u.getRole() == Role.ADMIN).collect(Collectors.toList());
    }
}
