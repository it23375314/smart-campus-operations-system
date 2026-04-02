package com.smartcampus.resource.service;

import com.smartcampus.resource.model.Resource;
import com.smartcampus.resource.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public List<Resource> getResourcesByCategory(String category) {
        return resourceRepository.findByCategory(category);
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
            resource.setDescription(resourceDetails.getDescription());
            resource.setCapacity(resourceDetails.getCapacity());
            resource.setImageUrl(resourceDetails.getImageUrl());
            resource.setAvailableDays(resourceDetails.getAvailableDays());
            resource.setAvailableTimes(resourceDetails.getAvailableTimes());
            resource.setStatus(resourceDetails.getStatus());
            return resourceRepository.save(resource);
        }).orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    public void deleteResource(String id) {
        resourceRepository.deleteById(id);
    }
}
