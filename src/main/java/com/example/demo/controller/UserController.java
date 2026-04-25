package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.User;
import com.example.demo.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController @RequestMapping("/api/users") @RequiredArgsConstructor
public class UserController 
{

    private final UserService userService;

    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @RequestBody User updatedUser, @RequestAttribute User currentUser) 
    {
        return ResponseEntity.ok(userService.updateProfile(id, updatedUser, currentUser));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<User> activate(@PathVariable Long id, @RequestAttribute User currentUser) 
    {
        return ResponseEntity.ok(userService.activateUser(id, currentUser));
    }
}