package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.SupportFaq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupportFaqRepository extends JpaRepository<SupportFaq, UUID> {
    List<SupportFaq> findAllByOrderByDisplayOrderAsc();
    List<SupportFaq> findByCategoryOrderByDisplayOrderAsc(String category);
}
