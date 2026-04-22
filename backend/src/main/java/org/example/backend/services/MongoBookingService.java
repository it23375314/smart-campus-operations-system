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
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import org.example.backend.dtos.AvailabilitySlotDTO;
import org.example.backend.dtos.AnalyticsSummaryDTO;
import org.example.backend.dtos.ResourceUsageDTO;
import org.example.backend.dtos.PeakHourDTO;
import org.example.backend.repositories.ResourceRepository;

import org.springframework.context.annotation.Profile;

@Service
@Profile("!mock")
public class MongoBookingService implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    public BookingResponseDTO createBooking(BookingRequestDTO request, String currentUserId, Role currentUserRole) {
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

    public List<BookingResponseDTO> getAllBookings(String userId, String resourceId, String currentUserId, Role currentUserRole) {
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

    public BookingResponseDTO getBookingById(String id, String currentUserId, Role currentUserRole) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        
        // Security: USER can only view their own
        if (currentUserRole == Role.USER && !booking.getUserId().equals(currentUserId)) {
            throw new ForbiddenException("Unauthorized: You cannot view other users' bookings.");
        }
        
        return mapToDTO(booking);
    }

    public BookingResponseDTO updateBooking(String id, BookingRequestDTO request, String currentUserId, Role currentUserRole) {
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

    public void deleteBooking(String id, String currentUserId, Role currentUserRole) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (currentUserRole != Role.USER || !booking.getUserId().equals(currentUserId)) {
            throw new ForbiddenException("Unauthorized to delete this booking.");
        }

        bookingRepository.deleteById(id);
    }

    public BookingResponseDTO approveBooking(String id, String currentUserId, Role currentUserRole) {
        if (currentUserRole != Role.ADMIN) {
            throw new ForbiddenException("Only Admins can approve bookings.");
        }
        return updateStatus(id, BookingStatus.APPROVED, null);
    }

    public BookingResponseDTO rejectBooking(String id, String reason, String currentUserId, Role currentUserRole) {
        if (currentUserRole != Role.ADMIN) {
            throw new ForbiddenException("Only Admins can reject bookings.");
        }
        return updateStatus(id, BookingStatus.REJECTED, reason);
    }

    public BookingResponseDTO cancelBooking(String id, String currentUserId, Role currentUserRole) {
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

    public List<AvailabilitySlotDTO> getAvailability(String resourceId, LocalDate date) {
        // 1. Verify resource exists (optional but good practice)
        // Note: For simplicity we assume resourceId validation happens at the controller level or here
        
        // 2. Fetch all APPROVED bookings for this resource on this date
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        
        List<Booking> approvedBookings = bookingRepository.findByResourceIdAndStatus(resourceId, BookingStatus.APPROVED)
                .stream()
                .filter(b -> {
                    // Check if the booking overlaps with the requested date
                    return (b.getStartTime().isBefore(endOfDay) && b.getEndTime().isAfter(startOfDay));
                })
                .collect(Collectors.toList());

        // 3. Generate hourly slots from 08:00 to 20:00
        List<AvailabilitySlotDTO> slots = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        
        for (int hour = 8; hour < 20; hour++) {
            LocalTime slotStart = LocalTime.of(hour, 0);
            LocalTime slotEnd = LocalTime.of(hour + 1, 0);
            
            LocalDateTime slotStartDT = date.atTime(slotStart);
            LocalDateTime slotEndDT = date.atTime(slotEnd);
            
            boolean isBooked = approvedBookings.stream().anyMatch(b -> 
                b.getStartTime().isBefore(slotEndDT) && b.getEndTime().isAfter(slotStartDT)
            );
            
            slots.add(AvailabilitySlotDTO.builder()
                    .startTime(slotStart.format(formatter))
                    .endTime(slotEnd.format(formatter))
                    .status(isBooked ? "BOOKED" : "AVAILABLE")
                    .build());
        }
        
        return slots;
    }

    private BookingResponseDTO updateStatus(String id, BookingStatus status, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        
        // Strict validation: Rejection MUST have a reason
        if (status == BookingStatus.REJECTED && (reason == null || reason.trim().isEmpty())) {
            throw new IllegalArgumentException("A rejection reason must be provided.");
        }

        booking.setStatus(status);
        if (reason != null) {
            booking.setRejectionReason(reason);
        }
        return mapToDTO(bookingRepository.save(booking));
    }

    public AnalyticsSummaryDTO getSummaryAnalytics() {
        long total = bookingRepository.count();
        long approved = bookingRepository.countByStatus(BookingStatus.APPROVED);
        long rejected = bookingRepository.countByStatus(BookingStatus.REJECTED);
        long pending = bookingRepository.countByStatus(BookingStatus.PENDING);
        long cancelled = bookingRepository.countByStatus(BookingStatus.CANCELLED);

        return AnalyticsSummaryDTO.builder()
                .total(total)
                .approved(approved)
                .rejected(rejected)
                .pending(pending)
                .cancelled(cancelled)
                .approvalRatio(total > 0 ? (double) approved / total * 100 : 0)
                .build();
    }

    public List<ResourceUsageDTO> getPopularResources() {
        // Fetch all approved bookings and group by resourceId
        Map<String, Long> counts = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED)
                .collect(Collectors.groupingBy(Booking::getResourceId, Collectors.counting()));

        return counts.entrySet().stream()
                .map(entry -> {
                    String name = resourceRepository.findById(entry.getKey())
                            .map(r -> r.getName())
                            .orElse("Unknown Resource");
                    return ResourceUsageDTO.builder()
                            .resourceId(entry.getKey())
                            .resourceName(name)
                            .bookingCount(entry.getValue())
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getBookingCount(), a.getBookingCount()))
                .limit(5) // Top 5
                .collect(Collectors.toList());
    }

    public List<PeakHourDTO> getPeakHours() {
        // Fetch all approved bookings and group by start hour
        Map<Integer, Long> counts = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED)
                .collect(Collectors.groupingBy(b -> b.getStartTime().getHour(), Collectors.counting()));

        List<PeakHourDTO> peakHours = new ArrayList<>();
        // Ensure all 24 hours are represented
        for (int h = 0; h < 24; h++) {
            peakHours.add(PeakHourDTO.builder()
                    .hour(h)
                    .count(counts.getOrDefault(h, 0L))
                    .build());
        }
        return peakHours;
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
