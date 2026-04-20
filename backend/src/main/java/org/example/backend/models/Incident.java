package org.example.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "incidents")
public class Incident {

    @Id
    private String id;
    
    // NEW SLIIT FORM FIELDS
    private String reportedBy; // Maps to "Name"
    private String email;
    private String registrationNumber;
    private String faculty;
    private String contactNumber;
    private String title; // Maps to "Subject"
    private String campus;
    private String description; // Maps to "Message"
    
    private LocalDate dateReported;
    private String status; // Pending, In Progress, Resolved

    private List<String> proofUrls = new ArrayList<>();

    private String assignedTechnicianId;
    private String assignedTechnicianName;
    private String assignedTechnicianCategory;

    private List<String> remarksHistory = new ArrayList<>();

    public Incident() {}

    // --- GETTERS AND SETTERS ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDateReported() { return dateReported; }
    public void setDateReported(LocalDate dateReported) { this.dateReported = dateReported; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

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
}