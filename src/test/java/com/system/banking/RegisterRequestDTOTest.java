package com.system.banking;

import com.system.banking.auth.RegisterRequestDTO;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class RegisterRequestDTOTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testUsernameWithoutNumberAndSpecialCharFails() {
        RegisterRequestDTO dto = RegisterRequestDTO.builder()
                .firstName("Juan")
                .lastName("Dela Cruz")
                .username("juandc")
                .email("juan@example.com")
                .password("password123")
                .build();

        Set<ConstraintViolation<RegisterRequestDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("username")));
    }

    @Test
    void testUsernameWithNumberOnlyFails() {
        RegisterRequestDTO dto = RegisterRequestDTO.builder()
                .firstName("Juan")
                .lastName("Dela Cruz")
                .username("juandc123")
                .email("juan@example.com")
                .password("password123")
                .build();

        Set<ConstraintViolation<RegisterRequestDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("username")));
    }

    @Test
    void testUsernameWithSpecialCharOnlyFails() {
        RegisterRequestDTO dto = RegisterRequestDTO.builder()
                .firstName("Juan")
                .lastName("Dela Cruz")
                .username("juandc@")
                .email("juan@example.com")
                .password("password123")
                .build();

        Set<ConstraintViolation<RegisterRequestDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("username")));
    }

    @Test
    void testUsernameWithSpecialCharAndNumberPasses() {
        RegisterRequestDTO dto = RegisterRequestDTO.builder()
                .firstName("Juan")
                .lastName("Cruz")
                .username("juan@1")
                .email("juan@example.com")
                .password("Pass@123")
                .build();

        Set<ConstraintViolation<RegisterRequestDTO>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }
}
