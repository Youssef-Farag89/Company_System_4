package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepo;

    public UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    public User getUserById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }

        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getUsersByRole(String role) {
        if (role == null || role.isBlank()) {
            throw new RuntimeException("Role is required");
        }

        return userRepo.findByRole(role);
    }

    public User updateProfile(Long userId, User updatedUser, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        User existingUser = getUserById(userId);

        if (!currentUser.getId().equals(userId) && !currentUser.getRole().equals("MANAGER")) {
            throw new RuntimeException("Not authorized to update this profile");
        }

        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPassword(updatedUser.getPassword());

        return userRepo.save(existingUser);
    }

    public User activateUser(Long targetUserId, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (!currentUser.getRole().equals("MANAGER")) {
            throw new RuntimeException("Not authorized to activate users");
        }

        User targetUser = getUserById(targetUserId);
        targetUser.setActive(true);

        return userRepo.save(targetUser);
    }

    public User deactivateUser(Long targetUserId, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (!currentUser.getRole().equals("MANAGER")) {
            throw new RuntimeException("Not authorized to deactivate users");
        }

        User targetUser = getUserById(targetUserId);
        targetUser.setActive(false);

        return userRepo.save(targetUser);
    }
}
