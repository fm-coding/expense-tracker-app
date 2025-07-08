package com.pm.expenseservice.security;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.lang.annotation.*;

@Target({ElementType.PARAMETER, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@AuthenticationPrincipal(expression = "#this.userId")
public @interface CurrentUser  {
}

// This interface is used to inject the current user's ID into controller methods.