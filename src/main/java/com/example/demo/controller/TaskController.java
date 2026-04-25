package com.example.demo.controller;

import com.example.demo.model.Notification;
import com.example.demo.model.Task;
import com.example.demo.model.User;
import com.example.demo.service.NotificationService;
import com.example.demo.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller @RestController @RequestMapping("/api/tasks") @RequiredArgsConstructor
public class TaskController 
{

    private final TaskService taskService;
    private final NotificationService notificationService;

    @PostMapping("/create")
    public ResponseEntity<Task> createTask(@RequestBody Task task, @RequestAttribute User currentUser) 
    {
        Task savedTask = taskService.createTask(task, currentUser);

        Notification notif = Notification.builder()
                .title("New Task Assigned")
                .content("You have been assigned: " + savedTask.getTitle())
                .type("TASK")
                .build();
        
        notificationService.sendNotification(savedTask.getAssignedTo().getId().intValue(), notif);

        return ResponseEntity.ok(savedTask);
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable Long id, @RequestParam String status, @RequestAttribute User currentUser) 
    {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status, currentUser));
    }
}