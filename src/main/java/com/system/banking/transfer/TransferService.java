package com.system.banking.transfer;

import com.system.banking.account.Account;
import com.system.banking.account.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor

public class TransferService {

    private final AccountRepository accountRepository;

    @Transactional
    public void transfer(Long sourceAccountId, TransferRequestDTO request) {

        Account sourceAccount = accountRepository.findById(sourceAccountId).orElseThrow();
        Account destinationAccount = accountRepository.findByAccountNumber(request.getDestinationAccountNumber()).orElseThrow();

        BigDecimal amount = request.getAmount();

        if(sourceAccount.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient Balance"
            );
        }

        sourceAccount.setBalance(sourceAccount.getBalance().subtract(amount));

        destinationAccount.setBalance(destinationAccount.getBalance().add(amount));

        accountRepository.save(sourceAccount);
        accountRepository.save(destinationAccount);
    }
}