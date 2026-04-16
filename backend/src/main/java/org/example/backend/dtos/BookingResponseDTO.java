package org.example.backend.dtos;

import org.example.backend.models.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDTO {
    private String id;
    private Long userId;
    private Long resourceId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private int attendees;
    private BookingStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
}
