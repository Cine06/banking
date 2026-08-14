package com.system.banking.auth;

import com.system.banking.user.User;
import com.system.banking.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequestDTO request) {

        authService.register(request);

        return "User Registered Successfully";
    }
    @GetMapping("/login")
    public void login(LoginRequestDTO request) {

        User user = userRepository.findByEmailOrUsername(request.getUsernameOrEmail(), request.getUsernameOrEmail()).orElseThrow(()
                        -> new RuntimeException("User not found")
                );

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
    }
}