package org.example.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySlotDTO {
    private String startTime;
    private String endTime;
    private String status; // "AVAILABLE" or "BOOKED"
}
