package org.example.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "incidents")
public class Incident {

    @Id
    private String id;

    private String referenceId;
    
    // NEW SLIIT FORM FIELDS
    private String reportedBy; // Maps to "Name"
    private String email;
    private String registrationNumber;
    private String faculty;
    private String contactNumber;
    private String title; // Maps to "Subject"
    private String campus;
    private String category;
    private String resource;
    private String description; // Maps to "Message"

    // Priority field (Low, Medium, High)
    private String priority;
    
    private LocalDate dateReported;
    private LocalDateTime createdAt;
    private String status; // Pending, In Progress, Resolved

    private Boolean urgent = false; // Default: not urgent

    private List<String> proofUrls = new ArrayList<>();

    private String assignedTechnicianId;
    private String assignedTechnicianName;
    private String assignedTechnicianCategory;

    private List<String> remarksHistory = new ArrayList<>();

    private String rejectionReason;

    public Incident() {}

    // --- GETTERS AND SETTERS ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getCampus() { return campus; }
    public void setCampus(String campus) { this.campus = campus; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getResource() { return resource; }
    public void setResource(String resource) { this.resource = resource; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }


    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDate getDateReported() { return dateReported; }
    public void setDateReported(LocalDate dateReported) { this.dateReported = dateReported; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getUrgent() { return urgent != null ? urgent : false; }
    public void setUrgent(Boolean urgent) { this.urgent = urgent; }

    public List<String> getProofUrls() { return proofUrls; }
    public void setProofUrls(List<String> proofUrls) { this.proofUrls = proofUrls; }

    public String getAssignedTechnicianId() { return assignedTechnicianId; }
    public void setAssignedTechnicianId(String assignedTechnicianId) { this.assignedTechnicianId = assignedTechnicianId; }

    public String getAssignedTechnicianName() { return assignedTechnicianName; }
    public void setAssignedTechnicianName(String assignedTechnicianName) { this.assignedTechnicianName = assignedTechnicianName; }

    public String getAssignedTechnicianCategory() { return assignedTechnicianCategory; }
    public void setAssignedTechnicianCategory(String assignedTechnicianCategory) { this.assignedTechnicianCategory = assignedTechnicianCategory; }

    public List<String> getRemarksHistory() { return remarksHistory; }
    public void setRemarksHistory(List<String> remarksHistory) { this.remarksHistory = remarksHistory; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}