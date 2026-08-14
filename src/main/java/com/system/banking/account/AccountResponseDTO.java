package com.system.banking.account;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponseDTO {
    private String accountNumber;
    private BigDecimal balance;
}
