package com.system.banking.transfer;

import com.system.banking.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @PostMapping("/{sourceAccountId}")
    public ApiResponse<Object> transfer(@PathVariable Long sourceAccountId,
            @Valid @RequestBody TransferRequestDTO request) {

        transferService.transfer(sourceAccountId, request);
        return ApiResponse.builder()
                .success(true)
                .message("Transfer Successful")
                .data(null)
                .build();
    }
}