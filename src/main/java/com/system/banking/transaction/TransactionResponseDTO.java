package com.system.banking.transaction;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponseDTO {

    private String transactionReference;
    private String transactionType;
    private BigDecimal amount;
    private String description;
    private LocalDateTime createdAt;

}