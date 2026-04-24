package org.example.backend.services;

import org.example.backend.exceptions.ResourceNotFoundException;
import org.example.backend.models.Resource;
import org.example.backend.repositories.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.context.annotation.Profile;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Profile("!mock")
public class MongoResourceService implements ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public List<Resource> getResourcesByCategory(String category) {
        return resourceRepository.findByCategory(category);
    }

    public List<Resource> getFilteredResources(String type, Integer minCapacity, String location, String status) {
        return resourceRepository.findAll().stream()
                .filter(r -> (type == null || r.getType().equalsIgnoreCase(type)))
                .filter(r -> (minCapacity == null || r.getCapacity() >= minCapacity))
                .filter(r -> (location == null || r.getLocation().equalsIgnoreCase(location)))
                .filter(r -> (status == null || r.getStatus().name().equalsIgnoreCase(status)))
                .toList();
    }

    public Optional<Resource> getResourceById(String id) {
        return resourceRepository.findById(id);
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource resourceDetails) {
        return resourceRepository.findById(id).map(resource -> {
            resource.setName(resourceDetails.getName());
            resource.setCategory(resourceDetails.getCategory());
            resource.setType(resourceDetails.getType());
            resource.setLocation(resourceDetails.getLocation());
            resource.setDescription(resourceDetails.getDescription());
            resource.setCapacity(resourceDetails.getCapacity());
            resource.setImageUrl(resourceDetails.getImageUrl());
            resource.setAvailableDays(resourceDetails.getAvailableDays());
            resource.setAvailableTimes(resourceDetails.getAvailableTimes());
            resource.setStatus(resourceDetails.getStatus());
            resource.setManagerId(resourceDetails.getManagerId());
            resource.setManagerName(resourceDetails.getManagerName());
            return resourceRepository.save(resource);
        }).orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }
}
