package org.example.backend.services;

import org.example.backend.models.Resource;
import org.example.backend.models.ResourceStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Profile("mock")
public class MockResourceService implements ResourceService {

    private final List<Resource> mockResources = new ArrayList<>();

    public MockResourceService() {
        // High-end simulated data for the Smart Campus
        mockResources.add(createMockResource("Res-101", "Grand Auditorium", "Auditorium", 
                "500-seat hi-tech auditorium with professional audio-visual systems.", 500, "/images/auditorium.png", "Mon-Fri", "08:00-20:00", "Admin-1"));
        
        mockResources.add(createMockResource("Res-102", "Advanced Computing Lab", "Computer Lab", 
                "Equipped with 50 high-end workstations and VR capabilities.", 50, "/images/computer_lab.png", "Mon-Sat", "09:00-22:00", "Admin-2"));
        
        mockResources.add(createMockResource("Res-103", "Collaborative Space A", "Study Room", 
                "Modern space for group discussions and collaborative projects.", 10, "/images/lab.png", "All Days", "00:00-23:59", "Admin-3"));

        mockResources.add(createMockResource("Res-104", "Lecture Hall 4B", "Lecture Hall", 
                "Standard 100-seat lecture hall with hybrid teaching tools.", 100, "/images/campus-life.jpg", "Mon-Fri", "08:00-18:00", "Admin-1"));
    }

    private Resource createMockResource(String id, String name, String category, String description, int capacity, String imageUrl, String days, String times, String managerId) {
        Resource r = new Resource();
        r.setId(id);
        r.setName(name);
        r.setCategory(category);
        r.setDescription(description);
        r.setCapacity(capacity);
        r.setImageUrl(imageUrl);
        r.setAvailableDays(Arrays.asList(days.split("-")));
        
        Map<String, String> timeMap = new HashMap<>();
        timeMap.put("start", times.split("-")[0]);
        timeMap.put("end", times.split("-")[1]);
        r.setAvailableTimes(timeMap);
        
        r.setStatus(ResourceStatus.AVAILABLE);
        r.setManagerId(managerId);
        r.setManagerName("Mock Manager");
        return r;
    }

    @Override
    public List<Resource> getAllResources() {
        return mockResources;
    }

    @Override
    public List<Resource> getResourcesByCategory(String category) {
        return mockResources.stream()
                .filter(r -> r.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Resource> getResourceById(String id) {
        return mockResources.stream().filter(r -> r.getId().equals(id)).findFirst();
    }

    @Override
    public Resource createResource(Resource resource) {
        resource.setId("Res-" + (mockResources.size() + 101));
        mockResources.add(resource);
        return resource;
    }

    @Override
    public Resource updateResource(String id, Resource details) {
        return getResourceById(id).map(r -> {
            r.setName(details.getName());
            r.setCategory(details.getCategory());
            r.setDescription(details.getDescription());
            r.setCapacity(details.getCapacity());
            return r;
        }).orElse(null);
    }

    @Override
    public void deleteResource(String id) {
        mockResources.removeIf(r -> r.getId().equals(id));
    }
}
