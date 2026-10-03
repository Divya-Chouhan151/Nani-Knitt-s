package com.ecommerce.auth.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.UUID;

@Slf4j
@Service
public class LocalStorageServiceImpl implements StorageService {

    private final Path rootLocation;

    public LocalStorageServiceImpl(@Value("${application.storage.upload-dir:./uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize storage directory", e);
        }
    }

    @Override
    public String store(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String extension = "";
        int extIndex = originalFilename.lastIndexOf(".");
        if (extIndex >= 0) {
            extension = originalFilename.substring(extIndex);
        }

        String storedName = UUID.randomUUID().toString() + extension;
        Path destinationFolder = this.rootLocation.resolve(subfolder != null ? subfolder : "common").normalize();

        try {
            Files.createDirectories(destinationFolder);
            Path destinationFile = destinationFolder.resolve(storedName).normalize();

            // Guard against directory traversal
            if (!destinationFile.startsWith(this.rootLocation)) {
                throw new SecurityException("Cannot store file outside upload directory");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            String relPath = subfolder != null ? subfolder + "/" + storedName : storedName;
            return "/uploads/" + relPath;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public void delete(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
            return;
        }

        String subPath = fileUrl.replaceFirst("^/uploads/", "");
        Path targetFile = this.rootLocation.resolve(subPath).normalize();
        if (targetFile.startsWith(this.rootLocation)) {
            try {
                Files.deleteIfExists(targetFile);
            } catch (IOException e) {
                log.warn("Failed to delete file: {}", targetFile, e);
            }
        }
    }
}
