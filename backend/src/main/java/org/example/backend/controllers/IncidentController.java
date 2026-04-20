package org.example.backend.controllers;

import org.example.backend.models.Incident;
import org.example.backend.repositories.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }) // This allows both React frontend ports
public class IncidentController {

    @Autowired
    private IncidentRepository incidentRepository;

    // 1. Create a new incident (For standard users / Create Incident Page)
    @PostMapping
    public Incident createIncident(@RequestBody Incident incident) {
        incident.setDateReported(LocalDate.now());
        incident.setStatus("Pending"); // Every new ticket starts as Pending
        return incidentRepository.save(incident);
    }

    // 2. Get ALL incidents (For the Admin Dashboard)
    @GetMapping
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll(); // Fetches everything from MongoDB
    }

    // 3. Get a single incident by ID (For the Update Page)
    @GetMapping("/{id}")
    public ResponseEntity<?> getIncidentById(@PathVariable String id) {
        try {
            System.out.println("Fetching incident with ID: " + id);
            Optional<Incident> incident = incidentRepository.findById(id);
            
            if (!incident.isPresent()) {
                System.out.println("Incident not found for ID: " + id);
                HashMap<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Incident not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            System.out.println("Incident found: " + incident.get().getId());
            return ResponseEntity.ok(incident.get());
        } catch (Exception e) {
            System.err.println("Error fetching incident: " + e.getMessage());
            e.printStackTrace();
            HashMap<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch incident: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 4. Update an incident (For Admins assigning techs and updating status)
    @PutMapping("/{id}")
    public Incident updateIncident(@PathVariable String id, @RequestBody Incident updatedIncident) {
        Optional<Incident> existingIncident = incidentRepository.findById(id);

        if (existingIncident.isPresent()) {
            Incident incident = existingIncident.get();
            incident.setStatus(updatedIncident.getStatus());
            incident.setAssignedTechnicianId(updatedIncident.getAssignedTechnicianId());
            incident.setAssignedTechnicianName(updatedIncident.getAssignedTechnicianName());
            incident.setAssignedTechnicianCategory(updatedIncident.getAssignedTechnicianCategory());

            // If a new remark was sent, add it to the history list
            if (updatedIncident.getRemarksHistory() != null && !updatedIncident.getRemarksHistory().isEmpty()) {
                incident.getRemarksHistory().addAll(updatedIncident.getRemarksHistory());
            }

            return incidentRepository.save(incident);
        }
        return null;
    }
}