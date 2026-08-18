package com.system.banking.security;

import com.system.banking.user.User;
import com.system.banking.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(
            String usernameOrEmail) throws UsernameNotFoundException {

        User user = userRepository

                .findByEmailOrUsername(
                        usernameOrEmail,
                        usernameOrEmail)

                .orElseThrow(
                        () -> new UsernameNotFoundException(
                                "User not found"));

        boolean isLocked = !user.isAccountNonLocked() || isCurrentlyLocked(user);

        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .accountLocked(isLocked)
                .roles("USER")
                .build();
    }

    private boolean isCurrentlyLocked(User user) {
        if (!user.isAccountNonLocked() || user.getLockLevel() >= 3) {
            return true;
        }
        if (user.getLockTime() == null) {
            return false;
        }
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (user.getLockLevel() == 1) {
            return now.isBefore(user.getLockTime().plusMinutes(5));
        }
        if (user.getLockLevel() == 2) {
            return now.isBefore(user.getLockTime().plusHours(4));
        }
        return false;
    }

}