package com.example.demo.service;

import com.example.demo.model.Room;
import com.example.demo.model.User;
import com.example.demo.repository.RoomRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepo;
    private final UserRepository userRepo;

    
    public RoomService(RoomRepository roomRepo, UserRepository userRepo) {
        this.roomRepo = roomRepo;
        this.userRepo = userRepo;
    }

    public Room createRoom(Room room, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (!currentUser.getRole().equals("MANAGER") ) {
            throw new RuntimeException("Not authorized to create rooms");
        }

        if (room == null) {
            throw new RuntimeException("Room is required");
        }

        if (room.getName() == null || room.getName().isBlank()) {
            throw new RuntimeException("Room name is required");
        }

        if (room.getType() == null || room.getType().isBlank()) {
            throw new RuntimeException("Room type is required");
        }

        User creator = userRepo.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        room.setCreatedBy(creator);
        room.setActive(true);

        return roomRepo.save(room);
    }

    public Room getRoomById(Long id, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        return roomRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    public List<Room> getAllRooms(User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        return roomRepo.findAll();
    }

    public List<Room> getActiveRooms(boolean active, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        return roomRepo.findByActive(active);
    }

    public List<Room> getRoomsByName(String name, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (name == null || name.isBlank()) {
            throw new RuntimeException("Room name is required");
        }

        return roomRepo.findByName(name);
    }

    public List<Room> getRoomsByType(String type, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (type == null || type.isBlank()) {
            throw new RuntimeException("Room type is required");
        }

        return roomRepo.findByType(type);
    }

    public Room updateRoom(Long roomId, Room updatedRoom, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (!currentUser.getRole().equals("MANAGER")) {
            throw new RuntimeException("Not authorized to update rooms");
        }

        Room existingRoom = getRoomById(roomId, currentUser);

        existingRoom.setName(updatedRoom.getName());
        existingRoom.setType(updatedRoom.getType());
        existingRoom.setActive(updatedRoom.isActive());

        return roomRepo.save(existingRoom);
    }

    public Room activateRoom(Long roomId, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (!currentUser.getRole().equals("MANAGER") && !currentUser.getRole().equals("TEAM_LEADER")) {
            throw new RuntimeException("Not authorized to activate rooms");
        }

        Room room = getRoomById(roomId, currentUser);
        room.setActive(true);

        return roomRepo.save(room);
    }

    public Room deactivateRoom(Long roomId, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (!currentUser.getRole().equals("MANAGER") && !currentUser.getRole().equals("TEAM_LEADER")) {
            throw new RuntimeException("Not authorized to deactivate rooms");
        }

        Room room = getRoomById(roomId, currentUser);
        room.setActive(false);

        return roomRepo.save(room);
    }

    public void deleteRoom(Long roomId, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (!currentUser.getRole().equals("MANAGER") ){
            throw new RuntimeException("Not authorized to delete rooms");
        }

        Room room = getRoomById(roomId, currentUser);
        roomRepo.delete(room);
    }
}
