package com.system.banking.account;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping("/deposit/{accountId}")
    public Account deposit(@PathVariable Long accountId,
                           @RequestBody DepositRequestDTO request
    ) {
        return accountService.deposit(accountId, request.getAmount());
    }

    @PostMapping("/withdraw/{accountId}")
    public Account withdraw(@PathVariable Long accountId,
                            @RequestBody WithdrawRequestDTO request
    ) {
        return accountService.withdraw(accountId, request.getAmount());
    }
}
