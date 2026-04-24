package org.example.backend.services;

import org.example.backend.models.Resource;
import java.util.List;
import java.util.Optional;

public interface ResourceService {
    List<Resource> getAllResources();
    List<Resource> getResourcesByCategory(String category);
    List<Resource> getFilteredResources(String type, Integer minCapacity, String location, String status);
    Optional<Resource> getResourceById(String id);
    Resource createResource(Resource resource);
    Resource updateResource(String id, Resource resourceDetails);
    void deleteResource(String id);
}
