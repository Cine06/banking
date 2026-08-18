package com.system.banking.user;

import com.system.banking.account.Account;
import com.system.banking.account.AccountRepository;
import com.system.banking.common.ApiResponse;
import com.system.banking.exception.AccountNotFoundException;
import com.system.banking.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

        private final UserRepository userRepository;
        private final AccountRepository accountRepository;

        @GetMapping("/me")
        public ApiResponse<Map<String, Object>> getCurrentUser(Authentication authentication) {

                String username = authentication.getName();

                User user = userRepository.findByEmailOrUsername(username, username)
                                .orElseThrow(() -> new UserNotFoundException("User not found"));

                Account account = accountRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new AccountNotFoundException("Account does not exist for the current user"));

                Map<String, Object> data = new HashMap<>();
                data.put("userId", user.getId());
                data.put("firstName", user.getFirstName());
                data.put("middleName", user.getMiddleName());
                data.put("lastName", user.getLastName());
                data.put("username", user.getUsername());
                data.put("email", user.getEmail());
                data.put("accountId", account.getId());
                data.put("accountNumber", account.getAccountNumber());
                data.put("balance", account.getBalance());

                return ApiResponse.<Map<String, Object>>builder()
                                .success(true)
                                .message("User info retrieved successfully")
                                .data(data)
                                .build();
        }
}
