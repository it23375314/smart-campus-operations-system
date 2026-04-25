package org.example.backend.dtos;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDTO {

    @NotBlank(message = "Resource ID is mandatory")
    private String resourceId;

    @NotNull(message = "Start time is mandatory")
    @FutureOrPresent(message = "Start time cannot be in the past")
    private LocalDateTime startTime;

    @NotNull(message = "End time is mandatory")
    @FutureOrPresent(message = "End time cannot be in the past")
    private LocalDateTime endTime;

    @NotBlank(message = "Purpose of booking is mandatory")
    private String purpose;

    @Min(value = 1, message = "Expected attendees must be at least 1")
    private int attendees;
}
