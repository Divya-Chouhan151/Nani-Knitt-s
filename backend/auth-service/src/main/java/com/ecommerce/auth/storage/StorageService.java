package com.ecommerce.auth.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file, String subfolder);
    void delete(String fileUrl);
}
