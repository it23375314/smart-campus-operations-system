package org.example.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "incidents")
public class Incident {

    @Id
    private String id;
    
    // User details
    private String reportedBy; 
    
    // Issue details
    private String title;
    private String description;
    private String status; // "Pending", "In Progress", "Resolved"
    private LocalDate dateReported;
    private String proofImageUrl; 
    
    // Technician details
    private String technicianAssigned;
    private String technicianRemarks;

    // --- Constructors ---
    public Incident() {}

    // --- Getters and Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getDateReported() { return dateReported; }
    public void setDateReported(LocalDate dateReported) { this.dateReported = dateReported; }

    public String getProofImageUrl() { return proofImageUrl; }
    public void setProofImageUrl(String proofImageUrl) { this.proofImageUrl = proofImageUrl; }

    public String getTechnicianAssigned() { return technicianAssigned; }
    public void setTechnicianAssigned(String technicianAssigned) { this.technicianAssigned = technicianAssigned; }

    public String getTechnicianRemarks() { return technicianRemarks; }
    public void setTechnicianRemarks(String technicianRemarks) { this.technicianRemarks = technicianRemarks; }
}