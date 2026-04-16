package org.example.backend.repositories;

import org.example.backend.models.Incident;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncidentRepository extends MongoRepository<Incident, String> {
    
    // Spring Boot automatically gives us save(), findAll(), findById(), etc.
    // We can add custom searches here later if we need to!
    
}