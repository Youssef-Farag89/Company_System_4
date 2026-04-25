package com.example.demo.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service @RequiredArgsConstructor
public class AuthService {
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(User user) 
    {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) 
        {
            throw new RuntimeException("Email already exists");
        }

        String role = (user.getRole() == null) ? "DEVELOPER" : user.getRole();
        String prefix = role.substring(0, 3).toUpperCase();
        String randomNum = String.valueOf((int)(Math.random() * 9000) + 1000);
        String staffId = prefix + "-" + randomNum;
        
        user.setStaffId(staffId);
        user.setRole(role);
        user.setActive(true);
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);
        emailService.sendStaffIdEmail(savedUser.getEmail(), savedUser.getName(), staffId, savedUser.getRole());

        return savedUser;
    }

    public User login(String email, String rawPassword, String username, String staffId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getStaffId().equals(staffId)) {
            throw new RuntimeException("Invalid Staff ID");
        }

        if (!user.getName().equals(username)) {
            throw new RuntimeException("Invalid Username");
        }

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid Password");
        }

        return user;
    }
}