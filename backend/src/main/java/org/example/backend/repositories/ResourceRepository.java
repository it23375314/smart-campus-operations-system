package org.example.backend.repositories;

import org.example.backend.models.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByCategory(String category);
    List<Resource> findByStatus(org.example.backend.models.ResourceStatus status);
}
