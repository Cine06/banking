package com.system.banking.account;

import com.system.banking.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final AccountRepository accountRepository;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> listAllAccounts() {
        List<Account> accounts = accountRepository.findAll();
        List<Map<String, Object>> accountList = accounts.stream().map(account -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", account.getId());
            map.put("accountNumber", account.getAccountNumber());
            map.put("balance", account.getBalance());
            map.put("createdAt", account.getCreatedAt());
            if (account.getUser() != null) {
                map.put("ownerName", account.getUser().getFirstName() + " " + account.getUser().getLastName());
                map.put("ownerUsername", account.getUser().getUsername());
                map.put("ownerEmail", account.getUser().getEmail());
            }
            return map;
        }).collect(Collectors.toList());

        return ApiResponse.<List<Map<String, Object>>>builder()
                .success(true)
                .message("Accounts retrieved successfully")
                .data(accountList)
                .build();
    }

    @PostMapping("/deposit/{accountId}")
    public ApiResponse<Map<String, Object>> deposit(@PathVariable Long accountId,
            @RequestBody DepositRequestDTO request) {
        Account account = accountService.deposit(accountId, request.getAmount());
        return ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Deposit successful")
                .data(Map.of(
                        "accountNumber", account.getAccountNumber(),
                        "balance", account.getBalance()
                ))
                .build();
    }

    @PostMapping("/withdraw/{accountId}")
    public ApiResponse<Map<String, Object>> withdraw(@PathVariable Long accountId,
            @RequestBody WithdrawRequestDTO request) {
        Account account = accountService.withdraw(accountId, request.getAmount());
        return ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Withdrawal successful")
                .data(Map.of(
                        "accountNumber", account.getAccountNumber(),
                        "balance", account.getBalance()
                ))
                .build();
    }
}
