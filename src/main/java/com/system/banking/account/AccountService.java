package com.system.banking.account;

import com.system.banking.exception.AccountNotFoundException;
import com.system.banking.exception.InsufficientBalanceException;
import com.system.banking.exception.InvalidTransactionException;
import com.system.banking.transaction.Transaction;
import com.system.banking.transaction.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private static final BigDecimal MINIMUM_AMOUNT = new BigDecimal("100");

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public Account deposit(Long accountId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransactionException("Deposit amount must be greater than zero");
        }
        if (amount.compareTo(MINIMUM_AMOUNT) < 0) {
            throw new InvalidTransactionException("Minimum deposit amount is ₱100.00");
        }

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account does not exist with ID: " + accountId));

        account.setBalance(account.getBalance().add(amount));
        Account savedAccount = accountRepository.save(account);

        String ref = "TXN-DEP-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        Transaction transaction = Transaction.builder()
                .amount(amount)
                .transactionType("DEPOSIT")
                .transactionReference(ref)
                .description("Cash Deposit")
                .account(savedAccount)
                .build();
        transactionRepository.save(transaction);

        return savedAccount;
    }

    @Transactional
    public Account withdraw(Long accountId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransactionException("Withdrawal amount must be greater than zero");
        }
        if (amount.compareTo(MINIMUM_AMOUNT) < 0) {
            throw new InvalidTransactionException("Minimum withdrawal amount is ₱100.00");
        }

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account does not exist with ID: " + accountId));

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for withdrawal");
        }

        account.setBalance(account.getBalance().subtract(amount));
        Account savedAccount = accountRepository.save(account);

        String ref = "TXN-WTH-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        Transaction transaction = Transaction.builder()
                .amount(amount)
                .transactionType("WITHDRAW")
                .transactionReference(ref)
                .description("Cash Withdrawal")
                .account(savedAccount)
                .build();
        transactionRepository.save(transaction);

        return savedAccount;
    }
}
