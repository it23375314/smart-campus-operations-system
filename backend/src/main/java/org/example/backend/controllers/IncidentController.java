package org.example.backend.controllers;

import org.example.backend.models.Incident;
import org.example.backend.repositories.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) // This allows both React frontend ports
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
    public Incident getIncidentById(@PathVariable String id) {
        return incidentRepository.findById(id).orElse(null);
    }

    // 4. Update an incident (For Technicians/Admins updating the status)
    @PutMapping("/{id}")
    public Incident updateIncident(@PathVariable String id, @RequestBody Incident updatedIncident) {
        Optional<Incident> existingIncident = incidentRepository.findById(id);
        
        if (existingIncident.isPresent()) {
            Incident incident = existingIncident.get();
            // Update only the fields the technician changed
            incident.setStatus(updatedIncident.getStatus());
            incident.setTechnicianAssigned(updatedIncident.getTechnicianAssigned());
            incident.setTechnicianRemarks(updatedIncident.getTechnicianRemarks());
            
            return incidentRepository.save(incident); // Save the changes back to MongoDB
        }
        return null; // Return null if the ticket ID doesn't exist
    }
}