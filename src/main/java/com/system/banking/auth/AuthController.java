package com.system.banking.auth;

import com.system.banking.common.ApiResponse;
import com.system.banking.exception.InvalidCredentialsException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<Object> register(@Valid @RequestBody RegisterRequestDTO request) {

        authService.register(request);

        return ApiResponse.builder()
                .success(true)
                .message("User Registered Successfully")
                .data(null)
                .build();
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {

        AuthResponseDTO response = authService.login(request);

        return ApiResponse.<AuthResponseDTO>builder()
                .success(true)
                .message("Login Successful")
                .data(response)
                .build();
    }

    @PostMapping("/change-password")
    public ApiResponse<Object> changePassword(@RequestHeader("Authorization") String token,
                                              @Valid @RequestBody ChangePasswordRequestDTO request) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new InvalidCredentialsException("Invalid token format");
        }
        String jwtToken = token.substring(7); // Remove "Bearer " prefix

        authService.changePassword(jwtToken, request);

        return ApiResponse.builder()
                .success(true)
                .message("Password changed successfully")
                .data(null)
                .build();
    }
}