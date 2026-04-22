package org.example.backend.config;

import org.example.backend.models.Role;
import org.example.backend.models.User;
import org.example.backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!mock")
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User m1 = User.builder()
                        .name("John Manager")
                        .email("john.m@campus.edu")
                        .role(Role.MANAGER)
                        .build();

                User m2 = User.builder()
                        .name("Sara Wilson")
                        .email("sara.w@campus.edu")
                        .role(Role.MANAGER)
                        .build();

                User a1 = User.builder()
                        .name("Admin User")
                        .email("admin@campus.edu")
                        .role(Role.ADMIN)
                        .build();

                User s1 = User.builder()
                        .name("Student One")
                        .email("student1@campus.edu")
                        .role(Role.USER)
                        .build();

                userRepository.saveAll(Arrays.asList(m1, m2, a1, s1));
                System.out.println("Seed data loaded: Users initialized.");
            }
        };
    }
}
