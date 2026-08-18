package com.system.banking;

import com.system.banking.security.JwtService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService();

    @Test
    void testGenerateAndValidateToken() {
        String token = jwtService.generateToken("testuser");
        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token, "testuser"));
        assertEquals("testuser", jwtService.extractUsername(token));
    }
}
