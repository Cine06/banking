package com.system.banking;

import com.system.banking.account.AccountRepository;
import com.system.banking.auth.AuthResponseDTO;
import com.system.banking.auth.AuthService;
import com.system.banking.auth.LoginRequestDTO;
import com.system.banking.exception.AccountLockedException;
import com.system.banking.exception.InvalidCredentialsException;
import com.system.banking.security.JwtService;
import com.system.banking.user.User;
import com.system.banking.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .firstName("Juan")
                .lastName("Cruz")
                .username("juan@1")
                .email("juan@example.com")
                .password("encoded_password")
                .failedAttempts(0)
                .lockLevel(0)
                .accountNonLocked(true)
                .build();
    }

    @Test
    void testSuccessfulLoginResetsAllLockState() {
        testUser.setFailedAttempts(2);
        testUser.setLockLevel(1);
        testUser.setLockTime(LocalDateTime.now().minusMinutes(10)); // expired
        LoginRequestDTO request = new LoginRequestDTO("juan@1", "correct_password");

        when(userRepository.findByEmailOrUsername("juan@1", "juan@1")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("correct_password", "encoded_password")).thenReturn(true);
        when(jwtService.generateToken("juan@1")).thenReturn("dummy.jwt.token");

        AuthResponseDTO response = authService.login(request);

        assertNotNull(response);
        assertEquals("dummy.jwt.token", response.getToken());
        assertEquals(0, testUser.getFailedAttempts());
        assertEquals(0, testUser.getLockLevel());
        assertNull(testUser.getLockTime());
        assertTrue(testUser.isAccountNonLocked());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void testTier1FailedAttempt1ShowsRemainingBefore5MinLock() {
        LoginRequestDTO request = new LoginRequestDTO("juan@1", "wrong_password");

        when(userRepository.findByEmailOrUsername("juan@1", "juan@1")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrong_password", "encoded_password")).thenReturn(false);

        InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> {
            authService.login(request);
        });

        assertEquals("Invalid password. You have 3 attempts remaining before a 5-minute temporary lockout.", ex.getMessage());
        assertEquals(1, testUser.getFailedAttempts());
        assertEquals(0, testUser.getLockLevel());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void testTier1FourthFailedAttemptLocksFor5Minutes() {
        testUser.setFailedAttempts(3);
        testUser.setLockLevel(0);
        LoginRequestDTO request = new LoginRequestDTO("juan@1", "wrong_password");

        when(userRepository.findByEmailOrUsername("juan@1", "juan@1")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrong_password", "encoded_password")).thenReturn(false);

        AccountLockedException ex = assertThrows(AccountLockedException.class, () -> {
            authService.login(request);
        });

        assertTrue(ex.getMessage().contains("5 minutes"));
        assertEquals(1, testUser.getLockLevel());
        assertEquals(0, testUser.getFailedAttempts());
        assertNotNull(testUser.getLockTime());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void testAttemptDuringActive5MinuteLockThrowsRemainingTime() {
        testUser.setLockLevel(1);
        testUser.setLockTime(LocalDateTime.now().minusMinutes(2)); // 3 minutes remaining
        LoginRequestDTO request = new LoginRequestDTO("juan@1", "any_password");

        when(userRepository.findByEmailOrUsername("juan@1", "juan@1")).thenReturn(Optional.of(testUser));

        AccountLockedException ex = assertThrows(AccountLockedException.class, () -> {
            authService.login(request);
        });

        assertTrue(ex.getMessage().contains("temporarily locked"));
        assertTrue(ex.getMessage().contains("minute"));
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void testTier2FourthFailedAttemptLocksFor4Hours() {
        testUser.setLockLevel(1);
        testUser.setFailedAttempts(3);
        LoginRequestDTO request = new LoginRequestDTO("juan@1", "wrong_password");

        when(userRepository.findByEmailOrUsername("juan@1", "juan@1")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrong_password", "encoded_password")).thenReturn(false);

        AccountLockedException ex = assertThrows(AccountLockedException.class, () -> {
            authService.login(request);
        });

        assertTrue(ex.getMessage().contains("4 hours"));
        assertEquals(2, testUser.getLockLevel());
        assertEquals(0, testUser.getFailedAttempts());
        assertNotNull(testUser.getLockTime());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void testAttemptDuringActive4HourLockThrowsRemainingTime() {
        testUser.setLockLevel(2);
        testUser.setLockTime(LocalDateTime.now().minusHours(1)); // 3 hours remaining
        LoginRequestDTO request = new LoginRequestDTO("juan@1", "any_password");

        when(userRepository.findByEmailOrUsername("juan@1", "juan@1")).thenReturn(Optional.of(testUser));

        AccountLockedException ex = assertThrows(AccountLockedException.class, () -> {
            authService.login(request);
        });

        assertTrue(ex.getMessage().contains("temporarily locked"));
        assertTrue(ex.getMessage().contains("hour"));
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void testTier3FourthFailedAttemptPermanentlyBlocksAccount() {
        testUser.setLockLevel(2);
        testUser.setFailedAttempts(3);
        LoginRequestDTO request = new LoginRequestDTO("juan@1", "wrong_password");

        when(userRepository.findByEmailOrUsername("juan@1", "juan@1")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrong_password", "encoded_password")).thenReturn(false);

        AccountLockedException ex = assertThrows(AccountLockedException.class, () -> {
            authService.login(request);
        });

        assertTrue(ex.getMessage().contains("blocked"));
        assertTrue(ex.getMessage().contains("Bank Customer Support"));
        assertEquals(3, testUser.getLockLevel());
        assertFalse(testUser.isAccountNonLocked());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void testAttemptWhenPermanentlyBlockedThrowsImmediateException() {
        testUser.setLockLevel(3);
        testUser.setAccountNonLocked(false);
        LoginRequestDTO request = new LoginRequestDTO("juan@1", "any_password");

        when(userRepository.findByEmailOrUsername("juan@1", "juan@1")).thenReturn(Optional.of(testUser));

        AccountLockedException ex = assertThrows(AccountLockedException.class, () -> {
            authService.login(request);
        });

        assertTrue(ex.getMessage().contains("blocked"));
        assertTrue(ex.getMessage().contains("Bank Customer Support"));
        verify(passwordEncoder, never()).matches(any(), any());
    }
}
