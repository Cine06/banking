package com.system.banking.account;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    public Account deposit(Long accountId, BigDecimal amount) {

        Account account = accountRepository.findById(accountId).orElseThrow();

        account.setBalance(account.getBalance().add(amount));

        return accountRepository.save(account);
    }

    public Account withdraw(Long accountId, BigDecimal amount) {

        Account account = accountRepository.findById(accountId).orElseThrow();

        if(account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient Balance");
        }

        account.setBalance(account.getBalance().subtract(amount));
        return accountRepository.save(account);
    }
}
