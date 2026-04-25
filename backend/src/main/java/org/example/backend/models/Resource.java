package org.example.backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Resource type is required")
    private String type; // room, lab, equipment

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    @jakarta.validation.constraints.Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    private String imageUrl;

    private List<String> availableDays;

    private Map<String, String> availableTimes; // e.g. "start": "09:00", "end": "17:00"

    private ResourceStatus status;

    private String managerId;

    private String managerName;
}
