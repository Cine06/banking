package com.system.banking.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailOrUsername(String email, String username);

    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

}