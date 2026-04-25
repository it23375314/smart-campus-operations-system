package org.example.backend.services;

import org.example.backend.dtos.BookingResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private static final String FROM_ADDRESS = "noreply@smartcampus.edu";

    @Async
    public void sendBookingApprovedEmail(String userEmail, BookingResponseDTO booking, String resourceName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(FROM_ADDRESS);
        message.setTo(userEmail);
        message.setSubject("✅ Booking Approved: " + booking.getPurpose());
        
        String text = String.format(
            "Greetings from Smart Campus Operations,\n\n" +
            "We are pleased to inform you that your booking request has been APPROVED.\n\n" +
            "--- Booking Details ---\n" +
            "Resource: %s\n" +
            "Date: %s\n" +
            "Time: %s - %s\n" +
            "Purpose: %s\n" +
            "Status: APPROVED\n\n" +
            "Please ensure you follow the institutional guidelines for resource utilization.\n\n" +
            "System Generated Record,\n" +
            "Smart Campus Management",
            resourceName,
            booking.getStartTime().toLocalDate().toString(),
            booking.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")),
            booking.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm")),
            booking.getPurpose()
        );
        
        message.setText(text);
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("CRITICAL: Automated notification failed to dispatch for " + userEmail + ". Reason: " + e.getMessage());
        }
    }

    @Async
    public void sendBookingRejectedEmail(String userEmail, String purpose, String reason) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(FROM_ADDRESS);
        message.setTo(userEmail);
        message.setSubject("❌ Booking Rejected: " + purpose);
        
        String text = String.format(
            "Greetings from Smart Campus Operations,\n\n" +
            "We regret to inform you that your booking request for '%s' has been REJECTED.\n\n" +
            "--- Rationale ---\n" +
            "Reason: %s\n\n" +
            "If you believe this is an error, please coordinate with the administrative office.\n\n" +
            "System Generated Record,\n" +
            "Smart Campus Management",
            purpose,
            reason
        );
        
        message.setText(text);
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("CRITICAL: Automated notification failed to dispatch for " + userEmail + ". Reason: " + e.getMessage());
        }
    }
}
