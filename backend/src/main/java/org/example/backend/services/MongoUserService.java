package org.example.backend.services;

import org.example.backend.models.Role;
import org.example.backend.models.User;
import org.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Profile("!mock")
public class MongoUserService implements UserService {

    private final UserRepository userRepository;

    @Override
    public List<User> getManagers() {
        return userRepository.findByRole(Role.MANAGER);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
