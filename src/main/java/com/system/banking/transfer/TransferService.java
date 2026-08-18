package com.system.banking.transfer;

import com.system.banking.account.Account;
import com.system.banking.account.AccountRepository;
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
public class TransferService {

    private static final BigDecimal MINIMUM_AMOUNT = new BigDecimal("100");

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public void transfer(Long sourceAccountId, TransferRequestDTO request) {
        BigDecimal amount = request.getAmount();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransactionException("Transfer amount must be greater than zero");
        }
        if (amount.compareTo(MINIMUM_AMOUNT) < 0) {
            throw new InvalidTransactionException("Minimum transfer amount is ₱100.00");
        }

        Account sourceAccount = accountRepository.findById(sourceAccountId)
                .orElseThrow(
                        () -> new AccountNotFoundException("Source account does not exist with ID: " + sourceAccountId));

        Account destinationAccount = accountRepository.findByAccountNumber(request.getDestinationAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException(
                        "Destination account does not exist with account number: " + request.getDestinationAccountNumber()));

        if (sourceAccount.getAccountNumber().equals(destinationAccount.getAccountNumber())) {
            throw new InvalidTransactionException("Cannot transfer funds to the same account");
        }

        if (sourceAccount.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for transfer");
        }

        sourceAccount.setBalance(sourceAccount.getBalance().subtract(amount));
        destinationAccount.setBalance(destinationAccount.getBalance().add(amount));

        accountRepository.save(sourceAccount);
        accountRepository.save(destinationAccount);

        String refCode = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        Transaction outTransaction = Transaction.builder()
                .amount(amount)
                .transactionType("TRANSFER_OUT")
                .transactionReference("TXN-TRF-" + refCode)
                .description("Transfer to " + destinationAccount.getAccountNumber())
                .account(sourceAccount)
                .build();
        transactionRepository.save(outTransaction);

        Transaction inTransaction = Transaction.builder()
                .amount(amount)
                .transactionType("TRANSFER_IN")
                .transactionReference("TXN-RCV-" + refCode)
                .description("Transfer from " + sourceAccount.getAccountNumber())
                .account(destinationAccount)
                .build();
        transactionRepository.save(inTransaction);
    }
}