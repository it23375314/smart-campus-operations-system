package org.example.backend.controllers;

import org.example.backend.models.Technician;
import org.example.backend.repositories.TechnicianRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@CrossOrigin(origins = "http://localhost:5173")
public class TechnicianController {

    @Autowired
    private TechnicianRepository technicianRepository;

    @GetMapping
    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    @PostMapping
    public Technician addTechnician(@RequestBody Technician technician) {
        return technicianRepository.save(technician);
    }

    @DeleteMapping("/{id}")
    public void deleteTechnician(@PathVariable String id) {
        technicianRepository.deleteById(id);
    }
}