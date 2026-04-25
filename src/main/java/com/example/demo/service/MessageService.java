package com.example.demo.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.demo.model.Message;
import com.example.demo.model.User;
import com.example.demo.repository.MessageRepository;
import lombok.RequiredArgsConstructor;

@Service @RequiredArgsConstructor
public class MessageService 
{

    private final MessageRepository messageRepo;

    public Message createMessage(Message message) 
    {
        if (message.getRoom() == null || message.getSender() == null)
        {
            throw new RuntimeException("Room and Sender are required");
        }
        return messageRepo.save(message);
    }

    public Message updateMessage(Long messageId, String newContent, User currentUser) 
    {
        Message existingMessage = messageRepo.findById(messageId).orElseThrow(() -> new RuntimeException("Message not found"));

        if (!existingMessage.getSender().getId().equals(currentUser.getId())) 
        {
            throw new RuntimeException("Unauthorized: You can only edit your own messages");
        }
        existingMessage.setContent(newContent);

        return messageRepo.save(existingMessage);
    }

    public Message getMessageById(Long id, User currentUser) 
    {
        Message message = messageRepo.findById(id).orElseThrow(() -> new RuntimeException("Message not found"));

        if (!currentUser.getRole().equals("MANAGER") && !currentUser.getRole().equals("TEAM_LEADER") && !message.getSender().getId().equals(currentUser.getId())) 
        {
            throw new RuntimeException("Not authorized to view this message");
        }
        return message;
    }

    public List<Message> getMessagesByRoom(Long roomId, User currentUser) 
    {
        return messageRepo.findByRoomId(roomId);
    }

    public List<Message> getMessagesBySender(Long userId, User currentUser) 
    {
        if (!currentUser.getRole().equals("MANAGER") && !currentUser.getId().equals(userId)) 
        {
            throw new RuntimeException("Unauthorized");
        }
        return messageRepo.findBySenderId(userId);
    }

    public void deleteMessage(Long messageId, User currentUser) 
    {
        Message msg = messageRepo.findById(messageId).orElseThrow(() -> new RuntimeException("Message not found"));

        if (currentUser.getRole().equals("MANAGER") || currentUser.getRole().equals("TEAM_LEADER") || msg.getSender().getId().equals(currentUser.getId())) 
        {
            messageRepo.delete(msg);
        } 
        else 
        {
            throw new RuntimeException("Not authorized to delete this message");
        }
    }
}