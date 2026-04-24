package org.example.backend.config;

import org.example.backend.models.Role;
import org.example.backend.models.User;
import org.example.backend.models.Resource;
import org.example.backend.models.ResourceStatus;
import org.example.backend.repositories.ResourceRepository;
import org.example.backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.time.LocalDateTime;

import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!mock")
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, ResourceRepository resourceRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User m1 = User.builder()
                        .name("John Manager")
                        .email("john.m@campus.edu")
                        .role(Role.MANAGER)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .build();

                User a1 = User.builder()
                        .name("Admin User")
                        .email("admin@campus.edu")
                        .role(Role.ADMIN)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .build();

                User s1 = User.builder()
                        .name("Student One")
                        .email("student1@campus.edu")
                        .role(Role.USER)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .build();

                userRepository.saveAll(Arrays.asList(m1, a1, s1));
                System.out.println("Seed data loaded: Users initialized.");
            }

            if (resourceRepository.count() == 0) {
                Resource r1 = Resource.builder()
                        .name("Grand Auditorium")
                        .category("Auditorium")
                        .type("room")
                        .location("Main Building, Floor 1")
                        .capacity(500)
                        .status(ResourceStatus.ACTIVE)
                        .description("High-capacity venue for symposiums and major events. Equipped with Atmos sound system.")
                        .imageUrl("https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=1200")
                        .build();

                Resource r2 = Resource.builder()
                        .name("Advanced Computing Lab")
                        .category("Laboratory")
                        .type("lab")
                        .location("Engineering Wing, Floor 3")
                        .capacity(50)
                        .status(ResourceStatus.ACTIVE)
                        .description("State-of-the-art facilities for technical and scientific research. Features RTX 4090 workstations.")
                        .imageUrl("https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=1200")
                        .build();

                Resource r3 = Resource.builder()
                        .name("Collaborative Space A")
                        .category("Classroom")
                        .type("room")
                        .location("Innovation Hub, Floor 2")
                        .capacity(15)
                        .status(ResourceStatus.ACTIVE)
                        .description("Modern learning environments with smart infrastructure and modular furniture.")
                        .imageUrl("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200")
                        .build();

                Resource r4 = Resource.builder()
                        .name("Lecture Hall 4B")
                        .category("Classroom")
                        .type("room")
                        .location("Academic Block, Floor 4")
                        .capacity(100)
                        .status(ResourceStatus.OUT_OF_SERVICE)
                        .description("Currently undergoing architectural digitization enhancements.")
                        .imageUrl("https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200")
                        .build();

                resourceRepository.saveAll(Arrays.asList(r1, r2, r3, r4));
                System.out.println("Seed data loaded: Institutional Resources initialized.");
            }
        };
    }
}
