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
            User m1 = new User("John Manager", "john.m@campus.edu", "", Role.MANAGER);
            User m2 = new User("Sara Wilson", "sara.w@campus.edu", "", Role.MANAGER);
            User a1 = new User("Admin User", "admin@campus.edu", "", Role.ADMIN);
            User s1 = new User("Student One", "student1@campus.edu", "", Role.USER);

                userRepository.saveAll(Arrays.asList(m1, m2, a1, s1));
                System.out.println("Seed data loaded: Users initialized.");
            }
        };
    }
}
