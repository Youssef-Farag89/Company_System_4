package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.User;
import com.example.demo.service.AuthService;

import lombok.RequiredArgsConstructor;


@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor @CrossOrigin(origins = "*")
public class AuthController 
{

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) 
    {
        return ResponseEntity.ok(authService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<User> login
    (
        @RequestParam String email, 
        @RequestParam String password,
        @RequestParam String username,
        @RequestParam String staffId
    ) 
    {
        return ResponseEntity.ok(authService.login(email, password, username, staffId));
    }
}