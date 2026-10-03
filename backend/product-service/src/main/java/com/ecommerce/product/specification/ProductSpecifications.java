package com.ecommerce.product.specification;

import com.ecommerce.product.domain.Category;
import com.ecommerce.product.domain.Product;
import com.ecommerce.product.domain.ProductVariant;
import com.ecommerce.product.dto.request.ProductFilterCriteria;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecifications {

    public static Specification<Product> withCriteria(ProductFilterCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always only show active products in public catalog
            predicates.add(cb.isTrue(root.get("isActive")));

            // Category filter (by ID or Slug)
            if (criteria.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), criteria.getCategoryId()));
            } else if (criteria.getCategorySlug() != null && !criteria.getCategorySlug().isBlank()) {
                Join<Product, Category> categoryJoin = root.join("category", JoinType.INNER);
                predicates.add(cb.equal(categoryJoin.get("slug"), criteria.getCategorySlug()));
            }

            // Keyword search (title or short description)
            if (criteria.getQuery() != null && !criteria.getQuery().isBlank()) {
                String searchPattern = "%" + criteria.getQuery().trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("shortDescription")), searchPattern);
                predicates.add(cb.or(titleMatch, descMatch));
            }

            // Minimum rating filter
            if (criteria.getMinRating() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("averageRating"), criteria.getMinRating()));
            }

            // Price range filter & In-stock filter on variants
            boolean needsVariantJoin = criteria.getMinPrice() != null || criteria.getMaxPrice() != null || Boolean.TRUE.equals(criteria.getInStockOnly());
            if (needsVariantJoin) {
                Join<Product, ProductVariant> variantJoin = root.join("variants", JoinType.INNER);
                if (query != null) {
                    query.distinct(true);
                }

                if (criteria.getMinPrice() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(variantJoin.get("price"), criteria.getMinPrice()));
                }
                if (criteria.getMaxPrice() != null) {
                    predicates.add(cb.lessThanOrEqualTo(variantJoin.get("price"), criteria.getMaxPrice()));
                }
                if (Boolean.TRUE.equals(criteria.getInStockOnly())) {
                    predicates.add(cb.notEqual(variantJoin.get("stockStatus"), "OUT_OF_STOCK"));
                }
            }

            // Ordering
            if (query != null) {
                if ("price_asc".equals(criteria.getSort())) {
                    Join<Product, ProductVariant> vSort = root.join("variants", JoinType.LEFT);
                    predicates.add(cb.isTrue(vSort.get("isDefault")));
                    query.orderBy(cb.asc(vSort.get("price")));
                } else if ("price_desc".equals(criteria.getSort())) {
                    Join<Product, ProductVariant> vSort = root.join("variants", JoinType.LEFT);
                    predicates.add(cb.isTrue(vSort.get("isDefault")));
                    query.orderBy(cb.desc(vSort.get("price")));
                } else if ("rating_desc".equals(criteria.getSort())) {
                    query.orderBy(cb.desc(root.get("averageRating")));
                } else {
                    query.orderBy(cb.desc(root.get("createdAt")));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
