package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Room;
import com.example.demo.model.User;
import com.example.demo.service.RoomService;

import lombok.RequiredArgsConstructor;

@RestController @RequestMapping("/api/rooms") @RequiredArgsConstructor
public class RoomController 
{

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody Room room, @RequestAttribute User currentUser) 
    {
        return ResponseEntity.ok(roomService.createRoom(room, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms(@RequestAttribute User currentUser) 
    {
        return ResponseEntity.ok(roomService.getAllRooms(currentUser));
    }
}