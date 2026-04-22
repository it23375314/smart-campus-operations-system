package org.example.backend.controllers;

import jakarta.validation.Valid;
import org.example.backend.dtos.BookingRequestDTO;
import org.example.backend.dtos.BookingResponseDTO;
import org.example.backend.models.Role;
import org.example.backend.services.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.backend.exceptions.ForbiddenException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class BookingController {

    @Autowired
    private BookingService bookingService;

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
            @RequestParam String reason,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") Role currentUserRole) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, reason, currentUserId, currentUserRole));
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
}
