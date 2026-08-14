package com.system.banking.transfer;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequestDTO {

    private String destinationAccountNumber;
    private BigDecimal amount;
}