package com.system.banking.transaction;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor

public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/account/{accountId}")
    public List<Transaction> getHistory(@PathVariable Long accountId
    ) {
        return transactionService.getTransactionHistory(accountId);
    }
}
