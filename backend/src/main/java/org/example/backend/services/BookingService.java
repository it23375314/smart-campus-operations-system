package org.example.backend.services;

import org.example.backend.dtos.BookingRequestDTO;
import org.example.backend.dtos.BookingResponseDTO;
import org.example.backend.models.Role;

import java.util.List;
import java.util.Map;

public interface BookingService {
    BookingResponseDTO createBooking(BookingRequestDTO request, String currentUserId, Role currentUserRole);
    List<BookingResponseDTO> getAllBookings(String userId, String resourceId, String currentUserId, Role currentUserRole);
    BookingResponseDTO getBookingById(String id, String currentUserId, Role currentUserRole);
    BookingResponseDTO updateBooking(String id, BookingRequestDTO request, String currentUserId, Role currentUserRole);
    void deleteBooking(String id, String currentUserId, Role currentUserRole);
    BookingResponseDTO approveBooking(String id, String currentUserId, Role currentUserRole);
    BookingResponseDTO rejectBooking(String id, String reason, String currentUserId, Role currentUserRole);
    BookingResponseDTO cancelBooking(String id, String currentUserId, Role currentUserRole);
    Map<String, Object> getAnalytics();
    Map<String, Long> getStats();
}
