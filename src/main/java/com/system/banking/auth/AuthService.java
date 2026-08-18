package com.system.banking.auth;

import com.system.banking.account.Account;
import com.system.banking.account.AccountRepository;
import com.system.banking.exception.AccountLockedException;
import com.system.banking.exception.DuplicateResourceException;
import com.system.banking.exception.InvalidCredentialsException;
import com.system.banking.exception.UserNotFoundException;
import com.system.banking.security.JwtService;
import com.system.banking.user.User;
import com.system.banking.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {
        public static final int MAX_FAILED_ATTEMPTS = 4;

        private final UserRepository userRepository;
        private final AccountRepository accountRepository;
        private final JwtService jwtService;
        private final PasswordEncoder passwordEncoder;

        public void register(RegisterRequestDTO request) {

                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new DuplicateResourceException("Email already exists");
                }
                if (userRepository.existsByUsername(request.getUsername())) {
                        throw new DuplicateResourceException("Username already exists");
                }

                User user = User.builder()
                                .firstName(request.getFirstName())
                                .middleName(request.getMiddleName())
                                .lastName(request.getLastName())
                                .username(request.getUsername())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .failedAttempts(0)
                                .lockLevel(0)
                                .accountNonLocked(true)
                                .build();

                userRepository.save(user);

                Account account = Account.builder()
                                .accountNumber(generateAccountNumber())
                                .balance(BigDecimal.ZERO)
                                .user(user)
                                .build();

                accountRepository.save(account);
        }

        public static final String BLOCKED_ACCOUNT_MESSAGE =
                "Your account has been blocked for security purposes due to multiple consecutive failed login attempts. Please contact Bank Customer Support or visit your nearest branch for identity verification and assistance to restore your account.";

        public AuthResponseDTO login(LoginRequestDTO request) {

                User user = userRepository
                                .findByEmailOrUsername(
                                                request.getUsernameOrEmail(),
                                                request.getUsernameOrEmail())
                                .orElseThrow(
                                                () -> new UserNotFoundException(
                                                                "User not found"));

                // 1. Check permanent block
                if (!user.isAccountNonLocked() || user.getLockLevel() >= 3) {
                        throw new AccountLockedException(BLOCKED_ACCOUNT_MESSAGE);
                }

                // 2. Check temporary locks (Tier 1: 5 mins, Tier 2: 4 hrs)
                if (user.getLockTime() != null) {
                        LocalDateTime now = LocalDateTime.now();
                        if (user.getLockLevel() == 1) {
                                LocalDateTime unlockTime = user.getLockTime().plusMinutes(5);
                                if (now.isBefore(unlockTime)) {
                                        String remaining = formatRemainingTime(now, unlockTime);
                                        throw new AccountLockedException(
                                                        "Your account is temporarily locked due to consecutive failed attempts. Please wait " + remaining + " before trying again, or contact Bank Support for assistance.");
                                } else {
                                        // 5 minutes lock expired, clear lockTime so user can attempt Tier 2
                                        user.setLockTime(null);
                                        user.setFailedAttempts(0);
                                }
                        } else if (user.getLockLevel() == 2) {
                                LocalDateTime unlockTime = user.getLockTime().plusHours(4);
                                if (now.isBefore(unlockTime)) {
                                        String remaining = formatRemainingTime(now, unlockTime);
                                        throw new AccountLockedException(
                                                        "Your account is temporarily locked due to repeated failed attempts. Please wait " + remaining + " before trying again, or contact Bank Support for assistance.");
                                } else {
                                        // 4 hours lock expired, clear lockTime so user can attempt Tier 3
                                        user.setLockTime(null);
                                        user.setFailedAttempts(0);
                                }
                        }
                }

                // 3. Validate password
                if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        int newFailedAttempts = user.getFailedAttempts() + 1;
                        user.setFailedAttempts(newFailedAttempts);

                        if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
                                int currentLockLevel = user.getLockLevel();
                                if (currentLockLevel == 0) {
                                        // Tier 1: 5 minutes lockout
                                        user.setLockLevel(1);
                                        user.setFailedAttempts(0);
                                        user.setLockTime(LocalDateTime.now());
                                        userRepository.save(user);
                                        throw new AccountLockedException(
                                                        "Too many failed login attempts. Your account has been temporarily locked for 5 minutes for your security. Please try again after 5 minutes or contact Bank Support if you need assistance.");
                                } else if (currentLockLevel == 1) {
                                        // Tier 2: 4 hours lockout
                                        user.setLockLevel(2);
                                        user.setFailedAttempts(0);
                                        user.setLockTime(LocalDateTime.now());
                                        userRepository.save(user);
                                        throw new AccountLockedException(
                                                        "Too many failed login attempts. Your account has been temporarily locked for 4 hours for your security. Please try again after 4 hours or visit your nearest branch for assistance.");
                                } else {
                                        // Tier 3: Permanent block (3rd set of 4 failed attempts)
                                        user.setLockLevel(3);
                                        user.setAccountNonLocked(false);
                                        user.setFailedAttempts(MAX_FAILED_ATTEMPTS);
                                        user.setLockTime(LocalDateTime.now());
                                        userRepository.save(user);
                                        throw new AccountLockedException(BLOCKED_ACCOUNT_MESSAGE);
                                }
                        } else {
                                userRepository.save(user);
                                int remainingAttempts = MAX_FAILED_ATTEMPTS - newFailedAttempts;
                                String attemptText = remainingAttempts == 1 ? "1 attempt" : remainingAttempts + " attempts";
                                String consequence;
                                if (user.getLockLevel() == 0) {
                                        consequence = "a 5-minute temporary lockout";
                                } else if (user.getLockLevel() == 1) {
                                        consequence = "a 4-hour security lockout";
                                } else {
                                        consequence = "permanent account block. Please contact Bank Support if you need assistance with your credentials";
                                }
                                throw new InvalidCredentialsException(
                                                "Invalid password. You have " + attemptText + " remaining before " + consequence + ".");
                        }
                }

                // 4. Successful login: reset failed attempts, lock levels, and lock time
                if (user.getFailedAttempts() > 0 || user.getLockLevel() > 0 || user.getLockTime() != null) {
                        user.setFailedAttempts(0);
                        user.setLockLevel(0);
                        user.setLockTime(null);
                        user.setAccountNonLocked(true);
                        userRepository.save(user);
                }

                String jwt = jwtService.generateToken(
                                user.getUsername());

                return AuthResponseDTO.builder()
                                .token(jwt)
                                .message("Login Successful")
                                .build();
        }

        private String formatRemainingTime(LocalDateTime now, LocalDateTime unlockTime) {
                Duration duration = Duration.between(now, unlockTime);
                long totalSeconds = Math.max(1, duration.getSeconds());
                long hours = totalSeconds / 3600;
                long minutes = (totalSeconds % 3600) / 60;
                long seconds = totalSeconds % 60;

                StringBuilder sb = new StringBuilder();
                if (hours > 0) {
                        sb.append(hours).append(hours == 1 ? " hour" : " hours");
                        if (minutes > 0) {
                                sb.append(" and ").append(minutes).append(minutes == 1 ? " minute" : " minutes");
                        }
                } else if (minutes > 0) {
                        sb.append(minutes).append(minutes == 1 ? " minute" : " minutes");
                        if (seconds > 0) {
                                sb.append(" and ").append(seconds).append(seconds == 1 ? " second" : " seconds");
                        }
                } else {
                        sb.append(seconds).append(seconds == 1 ? " second" : " seconds");
                }
                return sb.toString();
        }

        private String generateAccountNumber() {
                Random random = new Random();
                String accountNumber;
                do {
                        StringBuilder sb = new StringBuilder("010604");
                        for (int i = 0; i < 6; i++) {
                                sb.append(random.nextInt(10));
                        }
                        accountNumber = sb.toString();
                } while (accountRepository.findByAccountNumber(accountNumber).isPresent());
                return accountNumber;
        }

    public void changePassword(String token, ChangePasswordRequestDTO request) {
        // Extract username from token
        String username = jwtService.extractUsername(token);

        // Find user by username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Account not found or account doesn't exist"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        // Encode and set new password
        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(encodedNewPassword);

        // Reset failed attempts and lock status on successful password change
        user.setFailedAttempts(0);
        user.setLockLevel(0);
        user.setLockTime(null);
        user.setAccountNonLocked(true);

        // Save updated user
        userRepository.save(user);
    }
}

