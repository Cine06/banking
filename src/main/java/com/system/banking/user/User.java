package com.system.banking.user;

import com.system.banking.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
public class User extends BaseEntity {
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "failed_attempts", columnDefinition = "integer default 0")
    @Builder.Default
    private int failedAttempts = 0;

    @Column(name = "lock_level", columnDefinition = "integer default 0")
    @Builder.Default
    private int lockLevel = 0;

    @Column(name = "account_non_locked", columnDefinition = "boolean default true")
    @Builder.Default
    private boolean accountNonLocked = true;

    @Column(name = "lock_time")
    private LocalDateTime lockTime;

}