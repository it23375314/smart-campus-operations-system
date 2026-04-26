package org.example.backend.services;

import org.example.backend.dtos.BookingRequestDTO;
import org.example.backend.dtos.BookingResponseDTO;
import org.example.backend.models.BookingStatus;
import org.example.backend.models.Role;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Profile("mock")
public class MockBookingService implements BookingService {

    private final List<BookingResponseDTO> mockBookings = new ArrayList<>();

    public MockBookingService() {
        // High-end simulated booking data
        mockBookings.add(createMockBooking("BK-9001", "User-A", "Res-101", LocalDateTime.now().plusDays(1).withHour(10), LocalDateTime.now().plusDays(1).withHour(12), "Faculty Meeting", BookingStatus.APPROVED));
        mockBookings.add(createMockBooking("BK-9002", "User-B", "Res-102", LocalDateTime.now().plusDays(2).withHour(14), LocalDateTime.now().plusDays(2).withHour(16), "Project Submission", BookingStatus.PENDING));
        mockBookings.add(createMockBooking("BK-9003", "User-C", "Res-103", LocalDateTime.now().minusDays(1).withHour(9), LocalDateTime.now().minusDays(1).withHour(11), "Study Group", BookingStatus.REJECTED));
    }

    private BookingResponseDTO createMockBooking(String id, String userId, String resourceId, LocalDateTime start, LocalDateTime end, String purpose, BookingStatus status) {
        return BookingResponseDTO.builder()
                .id(id)
                .userId(userId)
                .resourceId(resourceId)
                .startTime(start)
                .endTime(end)
                .purpose(purpose)
                .attendees(15)
                .status(status)
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();
    }

    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO request, String currentUserId, Role currentUserRole) {
        BookingResponseDTO booking = createMockBooking("BK-" + (mockBookings.size() + 9001), currentUserId, request.getResourceId(), request.getStartTime(), request.getEndTime(), request.getPurpose(), BookingStatus.PENDING);
        mockBookings.add(booking);
        return booking;
    }

    @Override
    public List<BookingResponseDTO> getAllBookings(String userId, String resourceId, String currentUserId, Role currentUserRole) {
        return mockBookings.stream()
                .filter(b -> (userId == null || b.getUserId().equals(userId)))
                .filter(b -> (resourceId == null || b.getResourceId().equals(resourceId)))
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO getBookingById(String id, String currentUserId, Role currentUserRole) {
        return mockBookings.stream().filter(b -> b.getId().equals(id)).findFirst().orElse(null);
    }

    @Override
    public BookingResponseDTO updateBooking(String id, BookingRequestDTO request, String currentUserId, Role currentUserRole) {
        BookingResponseDTO b = getBookingById(id, currentUserId, currentUserRole);
        if (b != null) {
            b.setResourceId(request.getResourceId());
            b.setStartTime(request.getStartTime());
            b.setEndTime(request.getEndTime());
        }
        return b;
    }

    @Override
    public void deleteBooking(String id, String currentUserId, Role currentUserRole) {
        mockBookings.removeIf(b -> b.getId().equals(id));
    }

    @Override
    public BookingResponseDTO approveBooking(String id, String currentUserId, Role currentUserRole) {
        BookingResponseDTO b = getBookingById(id, currentUserId, currentUserRole);
        if (b != null) b.setStatus(BookingStatus.APPROVED);
        return b;
    }

    @Override
    public BookingResponseDTO rejectBooking(String id, String reason, String currentUserId, Role currentUserRole) {
        BookingResponseDTO b = getBookingById(id, currentUserId, currentUserRole);
        if (b != null) {
            b.setStatus(BookingStatus.REJECTED);
            b.setRejectionReason(reason);
        }
        return b;
    }

    @Override
    public BookingResponseDTO cancelBooking(String id, String currentUserId, Role currentUserRole) {
        BookingResponseDTO b = getBookingById(id, currentUserId, currentUserRole);
        if (b != null) b.setStatus(BookingStatus.CANCELLED);
        return b;
    }

    @Override
    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("total", (long) mockBookings.size());
        analytics.put("approved", mockBookings.stream().filter(b -> b.getStatus() == BookingStatus.APPROVED).count());
        analytics.put("rejected", mockBookings.stream().filter(b -> b.getStatus() == BookingStatus.REJECTED).count());
        analytics.put("pending", mockBookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count());
        analytics.put("ratio", 85.0);
        analytics.put("usageTrends", "Simulated data: Campus demand is high this week.");
        analytics.put("peakTimes", "Weekdays 09:00 - 15:00");
        return analytics;
    }

    @Override
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", (long) mockBookings.size());
        stats.put("pending", mockBookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count());
        stats.put("approved", mockBookings.stream().filter(b -> b.getStatus() == BookingStatus.APPROVED).count());
        stats.put("rejected", mockBookings.stream().filter(b -> b.getStatus() == BookingStatus.REJECTED).count());
        stats.put("cancelled", mockBookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count());
        return stats;
    }
}
