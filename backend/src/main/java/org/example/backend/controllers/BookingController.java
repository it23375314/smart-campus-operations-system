package org.example.backend.controllers;

import jakarta.validation.Valid;
import org.example.backend.dtos.BookingRequestDTO;
import org.example.backend.dtos.BookingResponseDTO;
import org.example.backend.dtos.RejectRequestDTO;
import org.example.backend.models.Role;
import org.example.backend.services.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.backend.exceptions.ForbiddenException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.example.backend.dtos.AvailabilitySlotDTO;
import org.example.backend.dtos.AnalyticsSummaryDTO;
import org.example.backend.dtos.ResourceUsageDTO;
import org.example.backend.dtos.PeakHourDTO;
import org.example.backend.services.ResourceService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ResourceService resourceService;

    // USER: Create booking
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO request,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") Role currentUserRole) {
        return new ResponseEntity<>(bookingService.createBooking(request, currentUserId, currentUserRole), HttpStatus.CREATED);
    }

    // USER: View own bookings
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") Role currentUserRole) {
        if (currentUserRole != Role.USER) {
            throw new ForbiddenException("This endpoint is for students/users only.");
        }
        return ResponseEntity.ok(bookingService.getAllBookings(currentUserId, null, currentUserId, currentUserRole));
    }

    // ADMIN/MANAGER: View all bookings with optional filtering
    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String resourceId,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") Role currentUserRole) {
        if (currentUserRole == Role.USER) {
            throw new ForbiddenException("Users cannot access the global bookings list. Use /my instead.");
        }
        return ResponseEntity.ok(bookingService.getAllBookings(userId, resourceId, currentUserId, currentUserRole));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") Role currentUserRole) {
        return ResponseEntity.ok(bookingService.getBookingById(id, currentUserId, currentUserRole));
    }

    // USER: Update own pending booking
    @PutMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable String id, 
            @Valid @RequestBody BookingRequestDTO request,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") Role currentUserRole) {
        return ResponseEntity.ok(bookingService.updateBooking(id, request, currentUserId, currentUserRole));
    }

    // ADMIN: Approve
    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingResponseDTO> approveBooking(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") Role currentUserRole) {
        return ResponseEntity.ok(bookingService.approveBooking(id, currentUserId, currentUserRole));
    }

    // ADMIN: Reject with reason
    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable String id,
            @Valid @RequestBody RejectRequestDTO rejectRequest,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") Role currentUserRole) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, rejectRequest.getReason(), currentUserId, currentUserRole));
    }

    // USER: Cancel own
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") Role currentUserRole) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, currentUserId, currentUserRole));
    }

    // MANAGER: Aggregated Analytics
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics(
            @RequestHeader("X-User-Role") Role currentUserRole) {
        if (currentUserRole != Role.MANAGER && currentUserRole != Role.ADMIN) {
            throw new ForbiddenException("Only Managers and Admins can view analytics.");
        }
        return ResponseEntity.ok(bookingService.getAnalytics());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(bookingService.getStats());
    }

    @GetMapping("/availability")
    public ResponseEntity<List<AvailabilitySlotDTO>> getAvailability(
            @RequestParam String resourceId,
            @RequestParam LocalDate date) {
        
        // Validation: resourceId must exist
        resourceService.getResourceById(resourceId)
                .orElseThrow(() -> new org.example.backend.exceptions.ResourceNotFoundException("Resource not found with id: " + resourceId));
        
        return ResponseEntity.ok(bookingService.getAvailability(resourceId, date));
    }

    // Analytics: Summary
    @GetMapping("/analytics/summary")
    public ResponseEntity<AnalyticsSummaryDTO> getSummaryAnalytics(
            @RequestHeader("X-User-Role") Role currentUserRole) {
        if (currentUserRole != Role.ADMIN && currentUserRole != Role.MANAGER) {
            throw new ForbiddenException("Unauthorized to view analytics.");
        }
        return ResponseEntity.ok(bookingService.getSummaryAnalytics());
    }

    // Analytics: Popular Resources
    @GetMapping("/analytics/popular-resources")
    public ResponseEntity<List<ResourceUsageDTO>> getPopularResources(
            @RequestHeader("X-User-Role") Role currentUserRole) {
        if (currentUserRole != Role.ADMIN && currentUserRole != Role.MANAGER) {
            throw new ForbiddenException("Unauthorized to view analytics.");
        }
        return ResponseEntity.ok(bookingService.getPopularResources());
    }

    // Analytics: Peak Hours
    @GetMapping("/analytics/peak-hours")
    public ResponseEntity<List<PeakHourDTO>> getPeakHours(
            @RequestHeader("X-User-Role") Role currentUserRole) {
        if (currentUserRole != Role.ADMIN && currentUserRole != Role.MANAGER) {
            throw new ForbiddenException("Unauthorized to view analytics.");
        }
        return ResponseEntity.ok(bookingService.getPeakHours());
    }
}
