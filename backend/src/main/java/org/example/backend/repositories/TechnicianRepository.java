package org.example.backend.repositories;

import org.example.backend.models.Technician;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TechnicianRepository extends MongoRepository<Technician, String> {
}
