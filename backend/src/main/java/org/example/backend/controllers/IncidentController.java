package org.example.backend.controllers;

import org.example.backend.models.Incident;
import org.example.backend.repositories.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(originPatterns = { "http://localhost:*", "http://127.0.0.1:*" })
public class IncidentController {

    private static final String REFERENCE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private IncidentRepository incidentRepository;

    // 1. Create a new incident (For standard users / Create Incident Page)
    @PostMapping
    public Incident createIncident(@RequestBody Incident incident) {
        if (incident.getReferenceId() == null || incident.getReferenceId().isBlank()) {
            incident.setReferenceId(generateUniqueReferenceId());
        }
        if (incident.getCreatedAt() == null) {
            incident.setCreatedAt(LocalDateTime.now());
        }
        incident.setDateReported(LocalDate.now());
        incident.setStatus("Pending"); // Every new ticket starts as Pending
        if (incident.getUrgent() == null) incident.setUrgent(false);
        return incidentRepository.save(incident);
    }

    private String generateUniqueReferenceId() {
        String referenceId;
        do {
            referenceId = generateReferenceId();
        } while (incidentRepository.existsByReferenceId(referenceId));
        return referenceId;
    }

    private String generateReferenceId() {
        return String.format(
            "%s-%04d-%s",
            randomLetters(4),
            RANDOM.nextInt(10_000),
            randomLetters(4)
        );
    }

    private String randomLetters(int length) {
        StringBuilder builder = new StringBuilder(length);
        for (int index = 0; index < length; index++) {
            builder.append(REFERENCE_ALPHABET.charAt(RANDOM.nextInt(REFERENCE_ALPHABET.length())));
        }
        return builder.toString();
    }

    // 2. Get ALL incidents (For the Admin Dashboard)
    @GetMapping
    public List<Incident> getAllIncidents() {
        List<Incident> incidents = incidentRepository.findAll(); // Fetches everything from MongoDB

        // Backfill reference IDs for legacy records
        boolean changed = false;
        for (Incident incident : incidents) {
            if (incident.getReferenceId() == null || incident.getReferenceId().isBlank()) {
                incident.setReferenceId(generateUniqueReferenceId());
                changed = true;
            }
        }
        if (changed) {
            incidentRepository.saveAll(incidents);
        }

        return incidents;
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
            
            Incident found = incident.get();
            if (found.getReferenceId() == null || found.getReferenceId().isBlank()) {
                found.setReferenceId(generateUniqueReferenceId());
                found = incidentRepository.save(found);
            }

            System.out.println("Incident found: " + found.getId());
            return ResponseEntity.ok(found);
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
            if (updatedIncident.getStatus() != null) {
                incident.setStatus(updatedIncident.getStatus());
            }
            if (updatedIncident.getAssignedTechnicianId() != null) {
                incident.setAssignedTechnicianId(updatedIncident.getAssignedTechnicianId());
            }
            if (updatedIncident.getAssignedTechnicianName() != null) {
                incident.setAssignedTechnicianName(updatedIncident.getAssignedTechnicianName());
            }
            if (updatedIncident.getAssignedTechnicianCategory() != null) {
                incident.setAssignedTechnicianCategory(updatedIncident.getAssignedTechnicianCategory());
            }
            if (updatedIncident.getUrgent() != null) {
                incident.setUrgent(updatedIncident.getUrgent());
            }

            // Replace remarksHistory when the client sends the full updated list.
            if (updatedIncident.getRemarksHistory() != null) {
                incident.setRemarksHistory(updatedIncident.getRemarksHistory());
            }

            if (updatedIncident.getRejectionReason() != null) {
                incident.setRejectionReason(updatedIncident.getRejectionReason());
            }

            return incidentRepository.save(incident);
        }
        return null;
    }
}