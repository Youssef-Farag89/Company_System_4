package com.example.demo.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service @RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendStaffIdEmail(String toEmail, String name, String staffId, String role) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("kareemgun12@gmail.com"); // The Sender
        message.setTo(toEmail);                   // THE USER'S EMAIL
        message.setSubject("URGENT: Your RafiQ Staff ID");
        message.setText("Hello " + name + ",\n\n" +
                "Your registration is successful. Use the credentials below to login:\n" +
                "Staff ID: " + staffId + "\n" +
                "Role: " + role + "\n\n" +
                "Keep this ID safe!");
        
        mailSender.send(message);
    }
}