package com.example.demo.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.demo.dto.RoomMemberResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Room;
import com.example.demo.model.User;
import com.example.demo.service.RoomService;
import com.example.demo.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController @RequestMapping("/api/rooms") @RequiredArgsConstructor
public class RoomController 
{

    private final RoomService roomService;
    private final UserService userService;

    // Changed on 28/04 at 10:04 AM: create rooms through the backend using the authenticated user's header id
    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody Room room, @RequestHeader("userId") Long userId)
    {
        User currentUser = userService.getUserById(userId);
        return ResponseEntity.ok(roomService.createRoom(room, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms(@RequestHeader("userId") Long userId)
    {
        User currentUser = userService.getUserById(userId);
        return ResponseEntity.ok(roomService.getAllRooms(currentUser));
    }

    // Changed on 28/04 at 10:50 AM: expose room member listing for the selected room
    @GetMapping("/{roomId}/members")
    public ResponseEntity<List<RoomMemberResponse>> getRoomMembers(
            @PathVariable Long roomId,
            @RequestHeader("userId") Long userId
    ) {
        User currentUser = userService.getUserById(userId);
        return ResponseEntity.ok(
                roomService.getRoomMembers(roomId, currentUser)
                        .stream()
                        .map(this::toMemberResponse)
                        .collect(Collectors.toList())
        );
    }

    // Changed on 28/04 at 11:00 AM: add room members from the frontend by staff id
    @PostMapping("/{roomId}/members/by-staff/{staffId}")
    public ResponseEntity<List<RoomMemberResponse>> addRoomMemberByStaffId(
            @PathVariable Long roomId,
            @PathVariable String staffId,
            @RequestHeader("userId") Long userId
    ) {
        User currentUser = userService.getUserById(userId);
        return ResponseEntity.ok(
                roomService.addMemberByStaffId(roomId, staffId, currentUser)
                        .stream()
                        .map(this::toMemberResponse)
                        .collect(Collectors.toList())
        );
    }

    // Changed on 28/04 at 11:06 AM: remove room members from the frontend using their user id
    @DeleteMapping("/{roomId}/members/{memberId}")
    public ResponseEntity<List<RoomMemberResponse>> removeRoomMember(
            @PathVariable Long roomId,
            @PathVariable Long memberId,
            @RequestHeader("userId") Long userId
    ) {
        User currentUser = userService.getUserById(userId);
        return ResponseEntity.ok(
                roomService.removeMember(roomId, memberId, currentUser)
                        .stream()
                        .map(this::toMemberResponse)
                        .collect(Collectors.toList())
        );
    }

    private RoomMemberResponse toMemberResponse(User user) {
        return RoomMemberResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .staffId(user.getStaffId())
                .active(user.isActive())
                .build();
    }

    // Changed on 28/04 at 11:22 AM: expose a backend-generated ZEGOCLOUD session for room video calls
    @PostMapping("/{roomId}/video-call-session")
    public ResponseEntity<Map<String, Object>> createVideoCallSession(
            @PathVariable Long roomId,
            @RequestHeader("userId") Long userId
    ) {
        User currentUser = userService.getUserById(userId);
        return ResponseEntity.ok(roomService.createVideoCallSession(roomId, currentUser));
    }
}
