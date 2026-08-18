package com.system.banking.transaction;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public Transaction recordTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public List<TransactionResponseDTO> getTransactionHistory(Long accountId) {
        return transactionRepository.findByAccountIdOrderByCreatedAtDesc(accountId)
                .stream()
                .map(txn -> new TransactionResponseDTO(
                        txn.getTransactionReference(),
                        txn.getTransactionType(),
                        txn.getAmount(),
                        txn.getDescription(),
                        txn.getCreatedAt()
                ))
                .toList();
    }
}