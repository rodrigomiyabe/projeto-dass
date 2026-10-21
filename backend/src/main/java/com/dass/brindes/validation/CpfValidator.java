package com.dass.brindes.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validates the {@link Cpf} constraint by delegating to {@link CpfUtils#isValid(String)}.
 */
public class CpfValidator implements ConstraintValidator<Cpf, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // null/blank handling is @NotBlank's responsibility; returning true here
        // avoids double-reporting a missing value as both @NotBlank and @Cpf violations.
        return value == null || CpfUtils.isValid(value);
    }
}
