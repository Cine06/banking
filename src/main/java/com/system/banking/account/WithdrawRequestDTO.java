package com.system.banking.account;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawRequestDTO {

    private BigDecimal amount;

}
