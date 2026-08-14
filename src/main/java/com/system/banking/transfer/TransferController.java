package com.system.banking.transfer;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor

public class TransferController {

    private final TransferService transferService;

    @PostMapping("/{sourceAccountId}")
    public String transfer(@PathVariable Long sourceAccountId,
                           @RequestBody TransferRequestDTO request
    ) {

        transferService.transfer(sourceAccountId, request);
        return "Transfer Successful";
    }
}