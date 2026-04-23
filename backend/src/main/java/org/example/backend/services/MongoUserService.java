package org.example.backend.services;

import org.example.backend.models.User;
import org.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Profile("!mock")
public class MongoUserService {

    private final UserRepository userRepository;

    public List<User> getManagers() {
        return userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() != null && user.getRole().name().equals("MANAGER"))
                .collect(Collectors.toList());
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
