package com.example.demo.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.model.FileResource;
import com.example.demo.model.User;
import com.example.demo.service.FileResourceService;

import lombok.RequiredArgsConstructor;

@RestController @RequestMapping("/api/files") @RequiredArgsConstructor
public class FileResourceController 
{

    private final FileResourceService fileService;
    private final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload")
    public ResponseEntity<FileResource> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("roomId") Long roomId, @RequestAttribute User currentUser) throws IOException 
    {
        
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath))
        {
            Files.createDirectories(uploadPath);
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        FileResource resource = FileResource.builder().fileName(file.getOriginalFilename()).filePath(filePath.toString()).fileType(file.getContentType()).build();

        return ResponseEntity.ok(fileService.createFileResource(resource));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<FileResource>> getRoomFiles(@PathVariable Long roomId) 
    {
        return ResponseEntity.ok(fileService.getFilesByRoom(roomId));
    }
}