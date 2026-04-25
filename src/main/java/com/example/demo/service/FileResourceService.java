package com.example.demo.service;

import com.example.demo.model.FileResource;
import com.example.demo.repository.FileResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FileResourceService {

    private final FileResourceRepository fileResourceRepository;

    // create
    public FileResource createFileResource(FileResource fileResource) {
        if (fileResource == null) {
            throw new IllegalArgumentException("File resource must not be null");
        }

        if (fileResource.getFileName() == null || fileResource.getFileName().isBlank()) {
            throw new IllegalArgumentException("File name is required");
        }

        if (fileResource.getFileType() == null || fileResource.getFileType().isBlank()) {
            throw new IllegalArgumentException("File type is required");
        }

        if (fileResource.getFilePath() == null || fileResource.getFilePath().isBlank()) {
            throw new IllegalArgumentException("File path is required");
        }

        if (fileResource.getUploadedBy() == null) {
            throw new IllegalArgumentException("Uploader is required");
        }

        if (fileResource.getRoom() == null) {
            throw new IllegalArgumentException("Room is required");
        }

        return fileResourceRepository.save(fileResource);
    }

    public FileResource getFileResourceById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("File id is required");
        }

        return fileResourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File resource not found"));
    }

    public List<FileResource> getAllFileResources() {
        return fileResourceRepository.findAll();
    }

    public List<FileResource> getFilesByRoom(Long roomId) {
        if (roomId == null) {
            throw new IllegalArgumentException("Room id is required");
        }

        return fileResourceRepository.findByRoomId(roomId);
    }

    public List<FileResource> getFilesByUploader(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User id is required");
        }

        return fileResourceRepository.findByUploadedById(userId);
    }

    public void deleteFileResource(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("File id is required");
        }

        if (!fileResourceRepository.existsById(id)) {
            throw new IllegalArgumentException("File resource not found");
        }

        fileResourceRepository.deleteById(id);
    }
//upload
//    public void uploadFile() {
//        //sebha 4wya 3a4an 7war kber
//        throw new UnsupportedOperationException("Upload file is not implemented yet");
//    }
//}
}