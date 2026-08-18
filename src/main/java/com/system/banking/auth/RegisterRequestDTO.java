package com.system.banking.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class RegisterRequestDTO {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 12, message = "must be 2 to 12 character long")
    private String firstName;
    private String middleName;
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 12, message = "must be 2 to 12 character long")
    private String lastName;
    @NotBlank(message = "username is required")
    @Size(min = 2, max = 12, message = "must be 2 to 12 character long")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$", message = "Username must contain at least 1 special character and numbers")
    private String username;
    @Email(message = "must be valid email address")
    @NotBlank(message = "email is required")
    private String email;
    @NotBlank
    @Size(min = 2, max = 12, message = "must be 2 to 12 character long")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$", message = "Password must contain at least 1 special character and numbers")
    private String password;

}