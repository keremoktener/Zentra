package com.zentra.api.controller;

import com.zentra.api.dto.AuthRequest;
import com.zentra.api.dto.AuthResponse;
import com.zentra.api.dto.RegisterRequest;
import com.zentra.api.model.User;
import com.zentra.api.security.JwtTokenProvider;
import com.zentra.api.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/auth", "/auth"}) // Support both paths for backward compatibility
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        logger.info("Received registration request for: {}", registerRequest.getEmail());
        if (userService.existsByEmail(registerRequest.getEmail())) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Email already in use");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword()); // UserService will encrypt
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setRole(registerRequest.getRole());

        User savedUser = userService.createUser(user);
        logger.info("User created successfully: {}", savedUser.getEmail());
        
        String token = jwtTokenProvider.createToken(
            savedUser.getEmail(), 
            Collections.singletonList(savedUser.getRole().name())
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(
            new AuthResponse(token, savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId())
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest authRequest) {
        logger.info("Received login request for: {}", authRequest.getEmail());
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = userService.findUserByEmail(authRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            String token = jwtTokenProvider.createToken(
                user.getEmail(),
                Collections.singletonList(user.getRole().name())
            );
            
            logger.info("Login successful for: {}", authRequest.getEmail());
            return ResponseEntity.ok(
                new AuthResponse(token, user.getEmail(), user.getRole().name(), user.getId())
            );
            
        } catch (AuthenticationException e) {
            logger.warn("Login failed for: {}", authRequest.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid email/password"));
        }
    }
} 