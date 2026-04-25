package com.example.demo.service;

import com.example.demo.model.Task;
import com.example.demo.model.User;
import com.example.demo.repository.TaskRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepo;
    private final UserRepository userRepo;

    public TaskService(TaskRepository taskRepo, UserRepository userRepo) {
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
    }

    public Task createTask(Task task, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (!currentUser.getRole().equals("MANAGER") && !currentUser.getRole().equals("TEAM_LEADER")) {
            throw new RuntimeException("Not authorized to create tasks");
        }

        if (task == null) {
            throw new RuntimeException("Task is required");
        }

        if (task.getTitle() == null || task.getTitle().isBlank()) {
            throw new RuntimeException("Task title is required");
        }

        if (task.getStatus() == null || task.getStatus().isBlank()) {
            throw new RuntimeException("Task status is required");
        }

        if (task.getAssignedTo() == null || task.getAssignedTo().getId() == null) {
            throw new RuntimeException("Assigned user is required");
        }

        User assignedTo = userRepo.findById(task.getAssignedTo().getId())
                .orElseThrow(() -> new RuntimeException("Assigned user not found"));

        task.setAssignedBy(currentUser);
        task.setAssignedTo(assignedTo);

        return taskRepo.save(task);
    }

    public Task getTaskById(Long id, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!currentUser.getRole().equals("MANAGER")
                && !currentUser.getRole().equals("TEAM_LEADER")
                && !task.getAssignedTo().getId().equals(currentUser.getId())
                && !task.getAssignedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized to view this task");
        }

        return task;
    }

    public List<Task> getAllTasks(User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (!currentUser.getRole().equals("MANAGER") && !currentUser.getRole().equals("TEAM_LEADER")) {
            throw new RuntimeException("Not authorized to view all tasks");
        }

        return taskRepo.findAll();
    }

    public List<Task> getTasksAssignedBy(Long userId, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (userId == null) {
            throw new RuntimeException("User id is required");
        }

        if (!currentUser.getRole().equals("MANAGER")
                && !currentUser.getRole().equals("TEAM_LEADER")
                && !currentUser.getId().equals(userId)) {
            throw new RuntimeException("Not authorized to view these tasks");
        }

        return taskRepo.findByAssignedById(userId);
    }

    public List<Task> getTasksAssignedTo(Long userId, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (userId == null) {
            throw new RuntimeException("User id is required");
        }

        if (!currentUser.getRole().equals("MANAGER")
                && !currentUser.getRole().equals("TEAM_LEADER")
                && !currentUser.getId().equals(userId)) {
            throw new RuntimeException("Not authorized to view these tasks");
        }

        return taskRepo.findByAssignedToId(userId);
    }

    public List<Task> getTasksByStatus(String status, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (status == null || status.isBlank()) {
            throw new RuntimeException("Status is required");
        }

        if (!currentUser.getRole().equals("MANAGER") && !currentUser.getRole().equals("TEAM_LEADER")) {
            throw new RuntimeException("Not authorized to view tasks by status");
        }

        return taskRepo.findByStatus(status);
    }

    public Task updateTask(Long taskId, Task updatedTask, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (!currentUser.getRole().equals("MANAGER") && !currentUser.getRole().equals("TEAM_LEADER")) {
            throw new RuntimeException("Not authorized to update tasks");
        }

        Task existingTask = getTaskById(taskId, currentUser);

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setStatus(updatedTask.getStatus());

        if (updatedTask.getAssignedTo() != null && updatedTask.getAssignedTo().getId() != null) {
            User assignedTo = userRepo.findById(updatedTask.getAssignedTo().getId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            existingTask.setAssignedTo(assignedTo);
        }

        return taskRepo.save(existingTask);
    }

    public Task updateTaskStatus(Long taskId, String status, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        Task existingTask = getTaskById(taskId, currentUser);

        if (!currentUser.getRole().equals("MANAGER")
                && !currentUser.getRole().equals("TEAM_LEADER")
                && !existingTask.getAssignedTo().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized to update task status");
        }

        existingTask.setStatus(status);
        return taskRepo.save(existingTask);
    }

    public void deleteTask(Long taskId, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Current user is required");
        }

        if (!currentUser.getRole().equals("MANAGER") && !currentUser.getRole().equals("TEAM_LEADER")) {
            throw new RuntimeException("Not authorized to delete tasks");
        }

        Task existingTask = getTaskById(taskId, currentUser);
        taskRepo.delete(existingTask);
    }
}
