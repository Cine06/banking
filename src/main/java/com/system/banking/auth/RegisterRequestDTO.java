package com.system.banking.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class RegisterRequestDTO {

    private String firstName;
    private String middleName;
    private String lastName;
    private String username;
    private String email;
    private String password;

}