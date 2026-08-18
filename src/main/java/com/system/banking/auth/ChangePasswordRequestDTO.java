package com.system.banking.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangePasswordRequestDTO {

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 2, max = 12, message = "must be 2 to 12 character long")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$", message = "New password must contain at least 1 special character and numbers")
    private String newPassword;
}