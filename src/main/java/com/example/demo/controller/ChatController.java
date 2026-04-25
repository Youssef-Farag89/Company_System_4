package com.example.demo.controller;

import com.example.demo.websocket.*;
import com.example.demo.model.Message;
import com.example.demo.model.Room;
import com.example.demo.model.User;
import com.example.demo.service.MessageService;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller @RequiredArgsConstructor
public class ChatController 
{

    private final MessageService messageService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) 
    {
        User sender = userService.getUserById(chatMessage.getSenderId());
        
        Room room = new Room();
        room.setId(chatMessage.getRoomId());

        Message dbMessage = Message.builder()
                .content(chatMessage.getContent())
                .sender(sender)
                .room(room)
                .sentTo("ROOM")
                .build();

        messageService.createMessage(dbMessage);

        messagingTemplate.convertAndSend("/topic/room/" + chatMessage.getRoomId(), chatMessage);
    }
}