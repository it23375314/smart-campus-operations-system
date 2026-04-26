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
import org.example.backend.repositories.UserRepository;

import org.springframework.context.annotation.Profile;

@Service
@Profile("!mock")
public class MongoBookingService implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public BookingResponseDTO createBooking(BookingRequestDTO request, String currentUserId, Role currentUserRole) {
        // Enforce: Only USER can create bookings
        if (currentUserRole != Role.USER) {
            throw new ForbiddenException("Admins and Managers cannot create booking requests.");
        }

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be strictly before end time");
        }

        org.example.backend.models.Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new org.example.backend.exceptions.ResourceNotFoundException("Resource not found"));

        if (resource.getStatus() == org.example.backend.models.ResourceStatus.OUT_OF_SERVICE) {
            throw new IllegalStateException("Institutional Protocol: Resource is currently OUT_OF_SERVICE and cannot be synthesized into a booking.");
        }

        if (request.getAttendees() > resource.getCapacity()) {
            throw new IllegalArgumentException("Capacity Overflow: Attendee count (" + request.getAttendees() + ") exceeds the institutional capacity limit of " + resource.getCapacity() + " for this resource.");
        }

        // Advanced Booking Conflict Checking
        if (!isTimeSlotAvailable(request.getResourceId(), request.getStartTime().toLocalDate(), request.getStartTime(), request.getEndTime())) {
            throw new ConflictException("Time slot is already booked");
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

    public List<BookingResponseDTO> getAllBookings(String userId, String resourceId, String status, String date, String search, String currentUserId, Role currentUserRole) {
        // Security: USER can only see their own data, ADMIN/MANAGER see all
        final String targetUserId = (currentUserRole == Role.USER) ? currentUserId : userId;

        List<Booking> bookings = bookingRepository.findAll();
        
        return bookings.stream()
                .filter(b -> (targetUserId == null || b.getUserId().equalsIgnoreCase(targetUserId)))
                .filter(b -> (resourceId == null || b.getResourceId().equalsIgnoreCase(resourceId)))
                .filter(b -> (status == null || b.getStatus().name().equalsIgnoreCase(status)))
                .filter(b -> (date == null || b.getStartTime().toLocalDate().toString().equals(date)))
                .filter(b -> (search == null || b.getPurpose().toLowerCase().contains(search.toLowerCase()) || b.getUserId().toLowerCase().contains(search.toLowerCase())))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!isTimeSlotAvailable(booking.getResourceId(), booking.getStartTime().toLocalDate(), booking.getStartTime(), booking.getEndTime())) {
            throw new ConflictException("Time slot is already booked");
        }

        BookingResponseDTO response = updateStatus(id, BookingStatus.APPROVED, null);

        // Asynchronous Notification Dispatch
        userRepository.findById(response.getUserId()).ifPresent(user -> {
            String resourceName = resourceRepository.findById(response.getResourceId())
                    .map(r -> r.getName())
                    .orElse("Unknown Resource");
            emailService.sendBookingApprovedEmail(user.getEmail(), response, resourceName);
        });

        return response;
    }

    public BookingResponseDTO rejectBooking(String id, String reason, String currentUserId, Role currentUserRole) {
        if (currentUserRole != Role.ADMIN) {
            throw new ForbiddenException("Only Admins can reject bookings.");
        }
        BookingResponseDTO response = updateStatus(id, BookingStatus.REJECTED, reason);

        // Asynchronous Notification Dispatch
        userRepository.findById(response.getUserId()).ifPresent(user -> {
            emailService.sendBookingRejectedEmail(user.getEmail(), response.getPurpose(), reason);
        });

        return response;
    }

    public BookingResponseDTO cancelBooking(String id, String currentUserId, Role currentUserRole) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking synchronization target not found."));

        // Logic: ADMIN can cancel any. Others only their OWN.
        if (currentUserRole != Role.ADMIN && !booking.getUserId().equals(currentUserId)) {
            throw new ForbiddenException("Unauthorized: Localized registry nodes can only decommission their own synchronization cycles.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Synchronization cycle is already in CANCELLED state.");
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

    @Override
    public boolean isTimeSlotAvailable(String resourceId, LocalDate date, LocalDateTime startTime, LocalDateTime endTime) {
        // Query database: Find bookings with same resource
        List<Booking> resourceBookings = bookingRepository.findByResourceId(resourceId);

        // Filter only APPROVED bookings matching the date
        List<Booking> approvedForDate = resourceBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED)
                .filter(b -> b.getStartTime().toLocalDate().equals(date) || b.getEndTime().toLocalDate().equals(date))
                .collect(Collectors.toList());

        // Loop through results and check overlap condition
        for (Booking existing : approvedForDate) {
            // Two bookings conflict if: (startTime < existingEndTime) AND (endTime > existingStartTime)
            if (startTime.isBefore(existing.getEndTime()) && endTime.isAfter(existing.getStartTime())) {
                return false; // Conflict found
            }
        }
        
        return true;
    }

    private BookingResponseDTO updateStatus(String id, BookingStatus status, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        
        // Logical Gate: Only PENDING can be approved/rejected
        if (booking.getStatus() != BookingStatus.PENDING && (status == BookingStatus.APPROVED || status == BookingStatus.REJECTED)) {
            throw new IllegalStateException("Only synchronization requests in PENDING state can be processed. Current state: " + booking.getStatus());
        }

        // Strict validation: Rejection MUST have a reason
        if (status == BookingStatus.REJECTED && (reason == null || reason.trim().isEmpty())) {
            throw new IllegalArgumentException("A comprehensive rejection rationale must be provided.");
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
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("mostUsedResources", getPopularResources());
        analytics.put("peakBookingHours", getPeakHours());
        return analytics;
    }

    public java.util.Map<String, Long> getStats() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("totalBookings", bookingRepository.count());
        stats.put("pendingBookings", bookingRepository.countByStatus(BookingStatus.PENDING));
        stats.put("approvedBookings", bookingRepository.countByStatus(BookingStatus.APPROVED));
        stats.put("rejectedBookings", bookingRepository.countByStatus(BookingStatus.REJECTED));
        return stats;
    }

    private BookingResponseDTO mapToDTO(Booking booking) {
        String userName = userRepository.findById(booking.getUserId())
            .map(u -> u.getName() != null ? u.getName() : u.getEmail())
                .orElse("Unknown User");
        
        String resourceName = resourceRepository.findById(booking.getResourceId())
                .map(r -> r.getName())
                .orElse("Unknown Asset");

        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .userName(userName)
                .resourceId(booking.getResourceId())
                .resourceName(resourceName)
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
