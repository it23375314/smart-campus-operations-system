package org.example.backend.repositories;

import org.example.backend.models.Booking;
import org.example.backend.models.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByResourceId(String resourceId);

    // Conflict Detection: (newStart < existingEnd AND newEnd > existingStart)
    // Only check against APPROVED bookings
    @Query("{ 'resourceId': ?0, 'status': 'APPROVED', " +
           "'startTime': { '$lt': ?2 }, 'endTime': { '$gt': ?1 } }")
    List<Booking> findConflicts(String resourceId, LocalDateTime startTime, LocalDateTime endTime);
    
    List<Booking> findByResourceIdAndStatus(String resourceId, BookingStatus status);

    long countByStatus(BookingStatus status);
}
