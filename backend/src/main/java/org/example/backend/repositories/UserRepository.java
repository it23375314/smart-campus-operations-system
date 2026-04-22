package org.example.backend.repositories;

import org.example.backend.models.Role;
import org.example.backend.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    List<User> findByRole(Role role);
}
