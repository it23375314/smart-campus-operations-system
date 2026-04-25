package org.example.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDTO {
    private long total;
    private long approved;
    private long pending;
    private long rejected;
    private long cancelled;
    private double approvalRatio;
}
