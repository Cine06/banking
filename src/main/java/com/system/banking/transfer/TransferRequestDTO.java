package com.system.banking.transfer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequestDTO {

    @NotBlank(message = "Destination account number is required")
    @Pattern(regexp = "\\d{12}", message = "Account number must be exactly 12 digits")
    private String destinationAccountNumber;
    private BigDecimal amount;
}