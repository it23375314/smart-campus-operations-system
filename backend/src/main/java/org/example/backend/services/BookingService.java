package org.example.backend.services;

import org.example.backend.dtos.BookingRequestDTO;
import org.example.backend.dtos.BookingResponseDTO;
import org.example.backend.exceptions.ConflictException;
import org.example.backend.exceptions.ForbiddenException;
import org.example.backend.exceptions.ResourceNotFoundException;
import org.example.backend.models.Booking;
import org.example.backend.models.BookingStatus;
import org.example.backend.models.Role;
import org.example.backend.repositories.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public BookingResponseDTO createBooking(BookingRequestDTO request, Long currentUserId, Role currentUserRole) {
        // Enforce: Only USER can create bookings
        if (currentUserRole != Role.USER) {
            throw new ForbiddenException("Admins and Managers cannot create booking requests.");
        }

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Conflict Detection: Only check against APPROVED bookings (Handled in Repo @Query)
        List<Booking> conflicts = bookingRepository.findConflicts(
                request.getResourceId(), request.getStartTime(), request.getEndTime());

        if (!conflicts.isEmpty()) {
            throw new ConflictException("The resource is already booked for this time slot.");
        }

        Booking booking = new Booking();
        booking.setUserId(currentUserId);
        booking.setResourceId(request.getResourceId());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setAttendees(request.getAttendees());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);
        return mapToDTO(savedBooking);
    }

    public List<BookingResponseDTO> getAllBookings(Long userId, Long resourceId, Long currentUserId, Role currentUserRole) {
        // Security: USER can only see their own data, ADMIN/MANAGER see all
        if (currentUserRole == Role.USER) {
            userId = currentUserId; 
        }

        List<Booking> bookings;
        if (userId != null) {
            bookings = bookingRepository.findByUserId(userId);
        } else if (resourceId != null) {
            bookings = bookingRepository.findByResourceId(resourceId);
        } else {
            bookings = bookingRepository.findAll();
        }
        return bookings.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public BookingResponseDTO getBookingById(String id, Long currentUserId, Role currentUserRole) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        
        // Security: USER can only view their own
        if (currentUserRole == Role.USER && !booking.getUserId().equals(currentUserId)) {
            throw new ForbiddenException("Unauthorized: You cannot view other users' bookings.");
        }
        
        return mapToDTO(booking);
    }

    public BookingResponseDTO updateBooking(String id, BookingRequestDTO request, Long currentUserId, Role currentUserRole) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (currentUserRole != Role.USER) {
            throw new ForbiddenException("Admins and Managers cannot modify booking details.");
        }

        if (!booking.getUserId().equals(currentUserId)) {
            throw new ForbiddenException("You can only update your own bookings.");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be updated");
        }

        booking.setResourceId(request.getResourceId());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setAttendees(request.getAttendees());

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToDTO(updatedBooking);
    }

    public void deleteBooking(String id, Long currentUserId, Role currentUserRole) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (currentUserRole != Role.USER || !booking.getUserId().equals(currentUserId)) {
            throw new ForbiddenException("Unauthorized to delete this booking.");
        }

        bookingRepository.deleteById(id);
    }

    public BookingResponseDTO approveBooking(String id, Long currentUserId, Role currentUserRole) {
        if (currentUserRole != Role.ADMIN) {
            throw new ForbiddenException("Only Admins can approve bookings.");
        }
        return updateStatus(id, BookingStatus.APPROVED, null);
    }

    public BookingResponseDTO rejectBooking(String id, String reason, Long currentUserId, Role currentUserRole) {
        if (currentUserRole != Role.ADMIN) {
            throw new ForbiddenException("Only Admins can reject bookings.");
        }
        return updateStatus(id, BookingStatus.REJECTED, reason);
    }

    public BookingResponseDTO cancelBooking(String id, Long currentUserId, Role currentUserRole) {
        if (currentUserRole != Role.USER) {
            throw new ForbiddenException("Only Users can cancel their own bookings.");
        }
        
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUserId().equals(currentUserId)) {
            throw new ForbiddenException("You cannot cancel someone else's booking.");
        }

        return updateStatus(id, BookingStatus.CANCELLED, null);
    }

    private BookingResponseDTO updateStatus(String id, BookingStatus status, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        booking.setStatus(status);
        if (reason != null) {
            booking.setRejectionReason(reason);
        }
        return mapToDTO(bookingRepository.save(booking));
    }

    public Map<String, Object> getAnalytics() {
        long total = bookingRepository.count();
        long approved = bookingRepository.countByStatus(BookingStatus.APPROVED);
        long rejected = bookingRepository.countByStatus(BookingStatus.REJECTED);
        long pending = bookingRepository.countByStatus(BookingStatus.PENDING);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("total", total);
        analytics.put("approved", approved);
        analytics.put("rejected", rejected);
        analytics.put("pending", pending);
        analytics.put("ratio", total > 0 ? (double) approved / total * 100 : 0);
        
        // Simulating usage trends for the UI
        analytics.put("usageTrends", "Resource Res-101 (Auditorium) is at 85% capacity this week.");
        analytics.put("peakTimes", "Weekdays 10:00 AM - 02:00 PM");
        
        return analytics;
    }

    public java.util.Map<String, Long> getStats() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("total", bookingRepository.count());
        stats.put("pending", bookingRepository.countByStatus(BookingStatus.PENDING));
        stats.put("approved", bookingRepository.countByStatus(BookingStatus.APPROVED));
        stats.put("rejected", bookingRepository.countByStatus(BookingStatus.REJECTED));
        stats.put("cancelled", bookingRepository.countByStatus(BookingStatus.CANCELLED));
        return stats;
    }

    private BookingResponseDTO mapToDTO(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .resourceId(booking.getResourceId())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .attendees(booking.getAttendees())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
