package com.ecommerce.search.engine;

import com.ecommerce.search.config.SearchProperties;
import com.ecommerce.search.domain.ProductSearchDocument;
import com.ecommerce.search.dto.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class InMemorySearchIndexClient implements SearchIndexClient {

    private final Map<String, ProductSearchDocument> documents = new ConcurrentHashMap<>();
    private final Set<String> indices = ConcurrentHashMap.newKeySet();
    private final Map<String, String> aliases = new ConcurrentHashMap<>();

    private record ScoredDoc(ProductSearchDocument doc, double score) {}

    public InMemorySearchIndexClient() {
        indices.add("products_v1");
        aliases.put("products_search", "products_v1");
        seedSampleData();
    }

    private void seedSampleData() {
        // 1. Chunky Hand-Knit Merino Wool Blanket
        indexDocument(ProductSearchDocument.builder()
                .id("knit-01")
                .title("Chunky Hand-Knit Merino Wool Blanket")
                .slug("chunky-hand-knit-merino-wool-blanket")
                .shortDescription("Ultra-soft 100% Australian merino wool chunky knit throw, handmade with care by artisan weavers.")
                .description("Artisan woven chunky merino wool blanket designed for maximum softness, luxury warmth, and decorative charm.")
                .categoryName("Women")
                .categorySlug("women")
                .brand("Nani's Knitts")
                .price(new BigDecimal("4599.00"))
                .compareAtPrice(new BigDecimal("5999.00"))
                .averageRating(4.95)
                .reviewCount(88)
                .stockQuantity(25)
                .stockStatus("IN_STOCK")
                .thumbnailUrl("https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80")
                .badge("BESTSELLER")
                .isActive(true)
                .suggest(List.of("blanket", "merino wool", "chunky", "knit", "throw", "handmade", "pink"))
                .version(1L)
                .build());

        // 2. Hand-Spun Alpaca Cable Knit Scarf
        indexDocument(ProductSearchDocument.builder()
                .id("knit-02")
                .title("Hand-Spun Alpaca Cable Knit Scarf")
                .slug("hand-spun-alpaca-cable-knit-scarf")
                .shortDescription("Warm and lightweight luxury alpaca wool scarf featuring an intricate heritage cable knit stitch.")
                .description("Handcrafted from sustainably sourced Peruvian baby alpaca fiber with traditional cable twisting.")
                .categoryName("Women")
                .categorySlug("women")
                .brand("Nani's Knitts")
                .price(new BigDecimal("2499.00"))
                .compareAtPrice(new BigDecimal("3200.00"))
                .averageRating(4.88)
                .reviewCount(45)
                .stockQuantity(30)
                .stockStatus("IN_STOCK")
                .thumbnailUrl("https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80")
                .badge("NEW")
                .isActive(true)
                .suggest(List.of("scarf", "alpaca", "cable knit", "hand-spun", "wool", "mustard"))
                .version(1L)
                .build());

        // 3. Vintage Fisherman Ribbed Knit Sweater
        indexDocument(ProductSearchDocument.builder()
                .id("knit-03")
                .title("Vintage Fisherman Ribbed Knit Sweater")
                .slug("vintage-fisherman-ribbed-knit-sweater")
                .shortDescription("Heavyweight pure wool pullover with raglan sleeves and natural moisture-resistant lanolin finish.")
                .description("Heritage maritime ribbed knit sweater spun from pure sheep wool.")
                .categoryName("Men")
                .categorySlug("men")
                .brand("Nani's Knitts")
                .price(new BigDecimal("5899.00"))
                .compareAtPrice(new BigDecimal("7200.00"))
                .averageRating(4.90)
                .reviewCount(62)
                .stockQuantity(18)
                .stockStatus("IN_STOCK")
                .thumbnailUrl("https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80")
                .badge("FEATURED")
                .isActive(true)
                .suggest(List.of("sweater", "pullover", "fisherman", "ribbed", "wool", "green", "knit"))
                .version(1L)
                .build());

        // 4. Handmade Crocheted Fox Stuffed Animal
        indexDocument(ProductSearchDocument.builder()
                .id("knit-04")
                .title("Handmade Crocheted Fox Stuffed Animal")
                .slug("handmade-crocheted-fox-stuffed-animal")
                .shortDescription("Adorable amigurumi forest fox crafted with organic certified non-toxic cotton yarn.")
                .description("Charming crochet woodland animal toy lovingly hand-stitched for little adventurers.")
                .categoryName("Kids")
                .categorySlug("kids")
                .brand("Nani's Knitts")
                .price(new BigDecimal("1299.00"))
                .compareAtPrice(new BigDecimal("1699.00"))
                .averageRating(4.96)
                .reviewCount(104)
                .stockQuantity(40)
                .stockStatus("IN_STOCK")
                .thumbnailUrl("https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80")
                .badge("FAVORITE")
                .isActive(true)
                .suggest(List.of("fox", "crochet", "stuffed animal", "toy", "amigurumi", "kids", "coral"))
                .version(1L)
                .build());

        // 5. Warm Woven Slouchy Beanie Cap
        indexDocument(ProductSearchDocument.builder()
                .id("knit-05")
                .title("Warm Woven Slouchy Beanie Cap")
                .slug("warm-woven-slouchy-beanie-cap")
                .shortDescription("Chunky ribbed double-folded wool beanie cap tailored for wind protection and cozy everyday warmth.")
                .description("Slouchy winter beanie hat tailored from breathable thermal wool blend.")
                .categoryName("Men")
                .categorySlug("men")
                .brand("Nani's Knitts")
                .price(new BigDecimal("1499.00"))
                .compareAtPrice(new BigDecimal("1899.00"))
                .averageRating(4.85)
                .reviewCount(52)
                .stockQuantity(50)
                .stockStatus("IN_STOCK")
                .thumbnailUrl("https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=80")
                .isActive(true)
                .suggest(List.of("beanie", "cap", "slouchy", "hat", "wool", "charcoal", "knit"))
                .version(1L)
                .build());

        // 6. Organic Merino Hand-Knitted Baby Booties
        indexDocument(ProductSearchDocument.builder()
                .id("knit-06")
                .title("Organic Merino Hand-Knitted Baby Booties")
                .slug("organic-cotton-hand-knitted-baby-booties")
                .shortDescription("Gentle hand-knitted woolen booties with adjustable tie-cuffs for infants and toddlers.")
                .description("Soft non-scratch organic merino wool booties crafted for baby's delicate feet.")
                .categoryName("Kids")
                .categorySlug("kids")
                .brand("Nani's Knitts")
                .price(new BigDecimal("999.00"))
                .compareAtPrice(new BigDecimal("1299.00"))
                .averageRating(4.92)
                .reviewCount(39)
                .stockQuantity(35)
                .stockStatus("IN_STOCK")
                .thumbnailUrl("https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80")
                .badge("NEW")
                .isActive(true)
                .suggest(List.of("booties", "baby", "merino", "infant", "socks", "knit", "lavender"))
                .version(1L)
                .build());

        // 7. Heirloom Honeycomb Knitted Throw
        indexDocument(ProductSearchDocument.builder()
                .id("knit-07")
                .title("Heirloom Honeycomb Knitted Throw")
                .slug("heirloom-honeycomb-knitted-throw")
                .shortDescription("Intricate textured waffle-knit blanket crafted with un-dyed organic sheep wool.")
                .description("Heirloom quality honeycomb blanket created using heritage artisan knit methods.")
                .categoryName("Women")
                .categorySlug("women")
                .brand("Nani's Knitts")
                .price(new BigDecimal("5299.00"))
                .compareAtPrice(new BigDecimal("6500.00"))
                .averageRating(4.91)
                .reviewCount(71)
                .stockQuantity(15)
                .stockStatus("IN_STOCK")
                .thumbnailUrl("https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80")
                .badge("BESTSELLER")
                .isActive(true)
                .suggest(List.of("throw", "honeycomb", "heirloom", "blanket", "waffle", "cream", "wool"))
                .version(1L)
                .build());

        // 8. Hand-Knitted Fair Isle Wool Cardigan (also mapped to legacy UUID)
        ProductSearchDocument cardigan = ProductSearchDocument.builder()
                .id("c1f76d20-8e10-48e2-9b2f-4a0b271e8c91")
                .title("Hand-Knitted Fair Isle Wool Cardigan")
                .slug("hand-knitted-fair-isle-wool-cardigan")
                .shortDescription("Traditional Scottish Fair Isle patterned buttoned cardigan knitted from 100% Shetland wool.")
                .description("Bespoke buttoned cardigan with authentic Fair Isle motif and horn buttons.")
                .categoryName("Men")
                .categorySlug("men")
                .brand("Nani's Knitts")
                .price(new BigDecimal("6499.00"))
                .compareAtPrice(new BigDecimal("7999.00"))
                .averageRating(4.88)
                .reviewCount(56)
                .stockQuantity(20)
                .stockStatus("IN_STOCK")
                .thumbnailUrl("https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80")
                .badge("FEATURED")
                .isActive(true)
                .suggest(List.of("cardigan", "fair isle", "shetland wool", "sweater", "scottish", "blue", "keyboard"))
                .version(1L)
                .build();
        indexDocument(cardigan);
        ProductSearchDocument cardiganAlias = ProductSearchDocument.builder()
                .id("knit-08")
                .title(cardigan.getTitle())
                .slug(cardigan.getSlug())
                .shortDescription(cardigan.getShortDescription())
                .description(cardigan.getDescription())
                .categoryName(cardigan.getCategoryName())
                .categorySlug(cardigan.getCategorySlug())
                .brand(cardigan.getBrand())
                .price(cardigan.getPrice())
                .compareAtPrice(cardigan.getCompareAtPrice())
                .averageRating(cardigan.getAverageRating())
                .reviewCount(cardigan.getReviewCount())
                .stockQuantity(cardigan.getStockQuantity())
                .stockStatus(cardigan.getStockStatus())
                .thumbnailUrl(cardigan.getThumbnailUrl())
                .badge(cardigan.getBadge())
                .isActive(true)
                .suggest(cardigan.getSuggest())
                .version(1L)
                .build();
        indexDocument(cardiganAlias);

        // 9. Cozy Cable-Knit Wool Mittens (also mapped to legacy UUID)
        ProductSearchDocument mittens = ProductSearchDocument.builder()
                .id("d2e87c31-9f21-49f3-ac30-5b1c382f9d02")
                .title("Cozy Cable-Knit Wool Mittens")
                .slug("cozy-cable-knit-wool-mittens")
                .shortDescription("Fleece-lined hand-knitted woolen mittens with decorative diamond cable stitches.")
                .description("Soft fleece insulated cable knit mittens for snowy winter days.")
                .categoryName("Women")
                .categorySlug("women")
                .brand("Nani's Knitts")
                .price(new BigDecimal("1199.00"))
                .compareAtPrice(new BigDecimal("1599.00"))
                .averageRating(4.82)
                .reviewCount(43)
                .stockQuantity(45)
                .stockStatus("IN_STOCK")
                .thumbnailUrl("https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80")
                .badge("SALE")
                .isActive(true)
                .suggest(List.of("mittens", "gloves", "cable", "wool", "fleece", "oatmeal", "mouse"))
                .version(1L)
                .build();
        indexDocument(mittens);
        ProductSearchDocument mittensAlias = ProductSearchDocument.builder()
                .id("knit-09")
                .title(mittens.getTitle())
                .slug(mittens.getSlug())
                .shortDescription(mittens.getShortDescription())
                .description(mittens.getDescription())
                .categoryName(mittens.getCategoryName())
                .categorySlug(mittens.getCategorySlug())
                .brand(mittens.getBrand())
                .price(mittens.getPrice())
                .compareAtPrice(mittens.getCompareAtPrice())
                .averageRating(mittens.getAverageRating())
                .reviewCount(mittens.getReviewCount())
                .stockQuantity(mittens.getStockQuantity())
                .stockStatus(mittens.getStockStatus())
                .thumbnailUrl(mittens.getThumbnailUrl())
                .badge(mittens.getBadge())
                .isActive(true)
                .suggest(mittens.getSuggest())
                .version(1L)
                .build();
        indexDocument(mittensAlias);

        // 10. Chunky Bobble Crochet Beanie with Pom (also mapped to legacy UUID)
        ProductSearchDocument beanie = ProductSearchDocument.builder()
                .id("a3b98d42-0a32-40a4-bd41-6c2d493a0e13")
                .title("Chunky Bobble Crochet Beanie with Pom")
                .slug("chunky-bobble-crochet-beanie-with-pom")
                .shortDescription("Textured bobble-stitch crochet winter hat topped with a handcrafted yarn pom-pom.")
                .description("Handcrafted bobble stitch winter cap with fluffy yarn pom-pom accent.")
                .categoryName("Women")
                .categorySlug("women")
                .brand("Nani's Knitts")
                .price(new BigDecimal("1399.00"))
                .compareAtPrice(new BigDecimal("1799.00"))
                .averageRating(4.90)
                .reviewCount(67)
                .stockQuantity(30)
                .stockStatus("IN_STOCK")
                .thumbnailUrl("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80")
                .badge("FAVORITE")
                .isActive(true)
                .suggest(List.of("beanie", "bobble", "pom", "crochet", "orange", "cap", "monitor"))
                .version(1L)
                .build();
        indexDocument(beanie);
        ProductSearchDocument beanieAlias = ProductSearchDocument.builder()
                .id("knit-10")
                .title(beanie.getTitle())
                .slug(beanie.getSlug())
                .shortDescription(beanie.getShortDescription())
                .description(beanie.getDescription())
                .categoryName(beanie.getCategoryName())
                .categorySlug(beanie.getCategorySlug())
                .brand(beanie.getBrand())
                .price(beanie.getPrice())
                .compareAtPrice(beanie.getCompareAtPrice())
                .averageRating(beanie.getAverageRating())
                .reviewCount(beanie.getReviewCount())
                .stockQuantity(beanie.getStockQuantity())
                .stockStatus(beanie.getStockStatus())
                .thumbnailUrl(beanie.getThumbnailUrl())
                .badge(beanie.getBadge())
                .isActive(true)
                .suggest(beanie.getSuggest())
                .version(1L)
                .build();
        indexDocument(beanieAlias);

        // 11. Handcrafted Amigurumi Bunny Stuffed Toy
        indexDocument(ProductSearchDocument.builder()
                .id("knit-11")
                .title("Handcrafted Amigurumi Bunny Stuffed Toy")
                .slug("handcrafted-amigurumi-bunny-stuffed-toy")
                .shortDescription("Sweet long-eared crocheted bunny toy dressed in a tiny handmade pastel pinafore.")
                .description("Handmade heirloom crochet bunny doll crafted with love and child-safe materials.")
                .categoryName("Kids")
                .categorySlug("kids")
                .brand("Nani's Knitts")
                .price(new BigDecimal("1449.00"))
                .compareAtPrice(new BigDecimal("1899.00"))
                .averageRating(4.97)
                .reviewCount(92)
                .stockQuantity(22)
                .stockStatus("IN_STOCK")
                .thumbnailUrl("https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80")
                .badge("BESTSELLER")
                .isActive(true)
                .suggest(List.of("bunny", "rabbit", "amigurumi", "toy", "crochet", "mint", "handmade"))
                .version(1L)
                .build());

        // 12. Nordic Geometric Wool Knitted Scarf
        indexDocument(ProductSearchDocument.builder()
                .id("knit-12")
                .title("Nordic Geometric Wool Knitted Scarf")
                .slug("nordic-geometric-wool-knitted-scarf")
                .shortDescription("Double-thick jacquard knit muffler with classic Scandinavian snowflake and diamond motifs.")
                .description("Geometric jacquard scarf offering wind resistance and distinctive winter styling.")
                .categoryName("Men")
                .categorySlug("men")
                .brand("Nani's Knitts")
                .price(new BigDecimal("2799.00"))
                .compareAtPrice(new BigDecimal("3499.00"))
                .averageRating(4.89)
                .reviewCount(50)
                .stockQuantity(28)
                .stockStatus("IN_STOCK")
                .thumbnailUrl("https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80")
                .isActive(true)
                .suggest(List.of("scarf", "nordic", "geometric", "jacquard", "muffler", "grey", "wool"))
                .version(1L)
                .build());

        // 13. Artisan Chunky Cable Knit Cardigan (also mapped to legacy audio UUID)
        indexDocument(ProductSearchDocument.builder()
                .id("b4c09e53-1b43-41b5-ce52-7d3e5a4b1f24")
                .title("Artisan Chunky Cable Knit Cardigan")
                .slug("artisan-chunky-cable-knit-cardigan")
                .shortDescription("Oversized cozy knit coatigan with deep pockets and handcrafted mother-of-pearl buttons.")
                .description("Cozy oversized coatigan tailored with chunky cable stitches and mother-of-pearl buttons.")
                .categoryName("Women")
                .categorySlug("women")
                .brand("Nani's Knitts")
                .price(new BigDecimal("4999.00"))
                .compareAtPrice(new BigDecimal("6200.00"))
                .averageRating(4.85)
                .reviewCount(64)
                .stockQuantity(16)
                .stockStatus("IN_STOCK")
                .thumbnailUrl("https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=800&auto=format&fit=crop&q=80")
                .badge("PRO")
                .isActive(true)
                .suggest(List.of("cardigan", "chunky", "coatigan", "cable", "cream", "headphones", "wool"))
                .version(1L)
                .build());
    }

    @Override
    public void indexDocument(ProductSearchDocument doc) {
        if (doc != null && doc.getId() != null) {
            documents.put(doc.getId(), doc);
        }
    }

    @Override
    public void deleteDocument(String id) {
        if (id != null) {
            documents.remove(id);
        }
    }

    @Override
    public ProductSearchDocument getDocument(String id) {
        return documents.get(id);
    }

    @Override
    public SearchResultDto search(SearchRequest request, SearchProperties.Ranking ranking) {
        String rawQuery = request.getQ() != null ? request.getQ().trim().toLowerCase() : "";
        List<String> queryTokens = Arrays.stream(rawQuery.split("\\s+"))
                .filter(t -> !t.isBlank())
                .collect(Collectors.toList());

        // Check for spelling suggestion
        String didYouMean = null;
        if (!rawQuery.isBlank()) {
            didYouMean = detectSpellingCorrection(rawQuery);
        }

        // Filter and score documents
        List<ScoredDoc> scoredDocs = new ArrayList<>();
        for (ProductSearchDocument doc : documents.values()) {
            if (Boolean.FALSE.equals(doc.getIsActive())) {
                continue;
            }

            // Apply Facet Filters
            if (request.getCategory() != null && !request.getCategory().isBlank()) {
                boolean matchCat = request.getCategory().equalsIgnoreCase(doc.getCategorySlug())
                        || request.getCategory().equalsIgnoreCase(doc.getCategoryName());
                if (!matchCat) continue;
            }

            if (request.getBrand() != null && !request.getBrand().isBlank()) {
                if (doc.getBrand() == null || !request.getBrand().equalsIgnoreCase(doc.getBrand())) {
                    continue;
                }
            }

            if (request.getMinPrice() != null && doc.getPrice() != null) {
                if (doc.getPrice().compareTo(request.getMinPrice()) < 0) continue;
            }

            if (request.getMaxPrice() != null && doc.getPrice() != null) {
                if (doc.getPrice().compareTo(request.getMaxPrice()) > 0) continue;
            }

            if (request.getMinRating() != null && doc.getAverageRating() != null) {
                if (doc.getAverageRating() < request.getMinRating().doubleValue()) continue;
            }

            if (Boolean.TRUE.equals(request.getInStockOnly())) {
                if (!"IN_STOCK".equalsIgnoreCase(doc.getStockStatus()) && (doc.getStockQuantity() == null || doc.getStockQuantity() <= 0)) {
                    continue;
                }
            }

            // Calculate Relevance Score
            double score = calculateScore(doc, queryTokens, ranking);
            if (queryTokens.isEmpty() || score > 0) {
                scoredDocs.add(new ScoredDoc(doc, score));
            }
        }

        // Sorting
        String sort = request.getSort() != null ? request.getSort() : "relevance";
        Comparator<ScoredDoc> comparator = switch (sort) {
            case "price_asc" -> Comparator.comparing(s -> s.doc().getPrice() != null ? s.doc().getPrice() : BigDecimal.ZERO);
            case "price_desc" -> Comparator.comparing((ScoredDoc s) -> s.doc().getPrice() != null ? s.doc().getPrice() : BigDecimal.ZERO).reversed();
            case "rating_desc" -> Comparator.comparing((ScoredDoc s) -> s.doc().getAverageRating() != null ? s.doc().getAverageRating() : 0.0).reversed();
            default -> Comparator.comparingDouble((ScoredDoc s) -> s.score()).reversed();
        };
        scoredDocs.sort(comparator);

        // Deduplicate documents by slug/title to avoid duplicate product cards
        Map<String, ScoredDoc> deduplicatedBySlug = new LinkedHashMap<>();
        for (ScoredDoc sd : scoredDocs) {
            String key = sd.doc().getSlug() != null ? sd.doc().getSlug() : sd.doc().getTitle();
            if (!deduplicatedBySlug.containsKey(key) || deduplicatedBySlug.get(key).score() < sd.score()) {
                deduplicatedBySlug.put(key, sd);
            }
        }
        scoredDocs = new ArrayList<>(deduplicatedBySlug.values());

        // Calculate Facets across filtered documents
        List<ProductSearchDocument> matchedDocs = scoredDocs.stream().map(ScoredDoc::doc).toList();
        FacetResultDto facets = computeFacets(matchedDocs);

        // Pagination
        int page = request.getPage() != null ? Math.max(0, request.getPage()) : 0;
        int size = request.getSize() != null ? Math.max(1, request.getSize()) : 20;
        int totalElements = scoredDocs.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);
        List<ProductSearchHitDto> pageContent = scoredDocs.subList(fromIndex, toIndex).stream()
                .map(s -> toHitDto(s.doc(), s.score()))
                .toList();

        return SearchResultDto.builder()
                .content(pageContent)
                .facets(facets)
                .didYouMean(didYouMean)
                .pageNumber(page)
                .pageSize(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .isFirst(page == 0)
                .isLast(page >= totalPages - 1 || totalPages == 0)
                .hasNext(page < totalPages - 1)
                .hasPrevious(page > 0)
                .build();
    }

    @Override
    public SuggestionResponseDto suggest(String query, int limit) {
        if (query == null || query.trim().length() < 2) {
            return SuggestionResponseDto.builder()
                    .query(query != null ? query : "")
                    .build();
        }

        String q = query.trim().toLowerCase();
        int maxLimit = Math.max(1, limit);

        List<ProductSuggestionDto> matchedProducts = new ArrayList<>();
        Set<String> matchedCategories = new LinkedHashSet<>();
        Set<String> matchedBrands = new LinkedHashSet<>();
        Set<String> seenSlugs = new HashSet<>();

        List<String> queryVariants = expandTokenVariants(q);

        for (ProductSearchDocument doc : documents.values()) {
            if (Boolean.FALSE.equals(doc.getIsActive())) continue;
            String slugKey = doc.getSlug() != null ? doc.getSlug() : doc.getTitle();
            if (seenSlugs.contains(slugKey)) continue;

            boolean titleMatch = doc.getTitle() != null && queryVariants.stream().anyMatch(v -> doc.getTitle().toLowerCase().contains(v));
            boolean suggestMatch = doc.getSuggest() != null && doc.getSuggest().stream().anyMatch(s -> queryVariants.stream().anyMatch(v -> s.toLowerCase().contains(v)));

            if (titleMatch || suggestMatch) {
                if (matchedProducts.size() < maxLimit) {
                    matchedProducts.add(ProductSuggestionDto.builder()
                            .id(doc.getId())
                            .title(doc.getTitle())
                            .slug(doc.getSlug())
                            .categoryName(doc.getCategoryName())
                            .price(doc.getPrice())
                            .thumbnailUrl(doc.getThumbnailUrl())
                            .build());
                    seenSlugs.add(slugKey);
                }
            }

            if (doc.getCategoryName() != null && queryVariants.stream().anyMatch(v -> doc.getCategoryName().toLowerCase().contains(v))) {
                matchedCategories.add(doc.getCategoryName());
            }

            if (doc.getBrand() != null && queryVariants.stream().anyMatch(v -> doc.getBrand().toLowerCase().contains(v))) {
                matchedBrands.add(doc.getBrand());
            }
        }

        List<CategorySuggestionDto> categoryDtos = matchedCategories.stream()
                .map(cat -> CategorySuggestionDto.builder()
                        .name(cat)
                        .slug(cat.toLowerCase().replace(" ", "-").replace("&", "and"))
                        .build())
                .collect(Collectors.toList());

        return SuggestionResponseDto.builder()
                .query(query)
                .products(matchedProducts)
                .categories(categoryDtos)
                .brands(new ArrayList<>(matchedBrands))
                .build();
    }

    private double calculateScore(ProductSearchDocument doc, List<String> queryTokens, SearchProperties.Ranking ranking) {
        if (queryTokens.isEmpty()) {
            return 1.0;
        }

        double score = 0.0;
        double titleBoost = ranking != null ? ranking.getTitleBoost() : 3.0;
        double brandBoost = ranking != null ? ranking.getBrandBoost() : 2.0;
        double catBoost = ranking != null ? ranking.getCategoryBoost() : 1.5;
        double shortDescBoost = ranking != null ? ranking.getShortDescBoost() : 1.2;
        double descBoost = ranking != null ? ranking.getDescBoost() : 1.0;
        double inStockBoost = ranking != null ? ranking.getInStockBoost() : 1.5;

        String title = doc.getTitle() != null ? doc.getTitle().toLowerCase() : "";
        String brand = doc.getBrand() != null ? doc.getBrand().toLowerCase() : "";
        String cat = doc.getCategoryName() != null ? doc.getCategoryName().toLowerCase() : "";
        String shortDesc = doc.getShortDescription() != null ? doc.getShortDescription().toLowerCase() : "";
        String desc = doc.getDescription() != null ? doc.getDescription().toLowerCase() : "";

        for (String rawToken : queryTokens) {
            boolean matched = false;
            List<String> variants = expandTokenVariants(rawToken);

            for (String token : variants) {
                if (title.contains(token)) {
                    score += titleBoost;
                    if (title.startsWith(token)) score += titleBoost * 0.5;
                    matched = true;
                }
                if (brand.contains(token)) {
                    score += brandBoost;
                    matched = true;
                }
                if (cat.contains(token)) {
                    score += catBoost;
                    matched = true;
                }
                if (shortDesc.contains(token)) {
                    score += shortDescBoost;
                    matched = true;
                }
                if (desc.contains(token)) {
                    score += descBoost;
                    matched = true;
                }
                if (doc.getSuggest() != null && doc.getSuggest().stream().anyMatch(s -> s.toLowerCase().contains(token))) {
                    score += titleBoost * 0.8;
                    matched = true;
                }
                if (doc.getBadge() != null && doc.getBadge().toLowerCase().contains(token)) {
                    score += brandBoost * 0.5;
                    matched = true;
                }
                if (matched) break;
            }

            if (!matched) {
                // Return 0 if any token completely misses (AND semantics for multi-word)
                return 0.0;
            }
        }

        // Apply In-Stock Boost
        if ("IN_STOCK".equalsIgnoreCase(doc.getStockStatus()) || (doc.getStockQuantity() != null && doc.getStockQuantity() > 0)) {
            score *= inStockBoost;
        }

        // Rating bias
        if (doc.getAverageRating() != null && doc.getAverageRating() > 0) {
            score += doc.getAverageRating() * 0.2;
        }

        return score;
    }

    private List<String> expandTokenVariants(String token) {
        if (token == null || token.isBlank()) return List.of();
        Set<String> variants = new LinkedHashSet<>();
        String t = token.trim().toLowerCase();
        variants.add(t);

        // Knitting / knit / knits / knitted
        if (t.startsWith("knit")) {
            variants.addAll(List.of("knit", "knitt", "knits", "knitts", "knitted", "knitting"));
        } else if (t.equals("crochet") || t.equals("crocheting") || t.equals("crocheted")) {
            variants.addAll(List.of("crochet", "crocheted", "crocheting"));
        } else if (t.equals("scarves") || t.equals("scarf")) {
            variants.addAll(List.of("scarf", "scarves"));
        } else if (t.equals("shawl") || t.equals("shawls")) {
            variants.addAll(List.of("shawl", "shawls", "throw", "blanket", "wrap"));
        } else if (t.equals("cloth") || t.equals("clothes") || t.equals("clothing") || t.equals("wear") || t.equals("apparel")) {
            variants.addAll(List.of("sweater", "cardigan", "pullover", "muffler", "beanie", "booties", "romper"));
        } else if (t.equals("gift") || t.equals("gifts")) {
            variants.addAll(List.of("handmade", "handcrafted", "artisan", "amigurumi", "toy", "heirloom"));
        } else if (t.endsWith("ies") && t.length() > 3) {
            variants.add(t.substring(0, t.length() - 3) + "y");
            variants.add(t.substring(0, t.length() - 1));
            variants.add(t.substring(0, t.length() - 3) + "ie");
        } else if (t.endsWith("es") && t.length() > 3) {
            variants.add(t.substring(0, t.length() - 2));
            variants.add(t.substring(0, t.length() - 1));
        } else if (t.endsWith("s") && t.length() > 2) {
            variants.add(t.substring(0, t.length() - 1));
        } else {
            variants.add(t + "s");
            variants.add(t + "es");
        }

        if (t.endsWith("ing") && t.length() > 4) {
            variants.add(t.substring(0, t.length() - 3));
            variants.add(t.substring(0, t.length() - 3) + "e");
        }

        return new ArrayList<>(variants);
    }

    private String detectSpellingCorrection(String query) {
        String lowerQuery = query.toLowerCase();
        // Common dictionary terms collected from titles and suggestions
        Set<String> dictionary = new HashSet<>();
        for (ProductSearchDocument doc : documents.values()) {
            if (doc.getTitle() != null) {
                Arrays.stream(doc.getTitle().toLowerCase().split("\\s+"))
                        .map(w -> w.replaceAll("[^a-z0-9]", ""))
                        .filter(w -> w.length() > 3)
                        .forEach(dictionary::add);
            }
            if (doc.getSuggest() != null) {
                doc.getSuggest().forEach(s -> {
                    Arrays.stream(s.toLowerCase().split("\\s+"))
                            .map(w -> w.replaceAll("[^a-z0-9]", ""))
                            .filter(w -> w.length() > 3)
                            .forEach(dictionary::add);
                });
            }
        }

        String[] words = lowerQuery.split("\\s+");
        List<String> correctedWords = new ArrayList<>();
        boolean hasCorrection = false;

        for (String word : words) {
            String clean = word.replaceAll("[^a-z0-9]", "");
            if (clean.length() <= 3 || dictionary.contains(clean)) {
                correctedWords.add(word);
                continue;
            }

            // Find closest term within Levenshtein distance 2
            String bestMatch = null;
            int minDistance = Integer.MAX_VALUE;

            for (String dictTerm : dictionary) {
                int dist = levenshteinDistance(clean, dictTerm);
                if (dist <= 2 && dist < minDistance) {
                    minDistance = dist;
                    bestMatch = dictTerm;
                }
            }

            if (bestMatch != null && minDistance <= 2) {
                correctedWords.add(bestMatch);
                hasCorrection = true;
            } else {
                correctedWords.add(word);
            }
        }

        return hasCorrection ? String.join(" ", correctedWords) : null;
    }

    private int levenshteinDistance(String a, String b) {
        int[] costs = new int[b.length() + 1];
        for (int j = 0; j < costs.length; j++) costs[j] = j;
        for (int i = 1; i <= a.length(); i++) {
            costs[0] = i;
            int nw = i - 1;
            for (int j = 1; j <= b.length(); j++) {
                int cj = Math.min(1 + Math.min(costs[j], costs[j - 1]),
                        a.charAt(i - 1) == b.charAt(j - 1) ? nw : nw + 1);
                nw = costs[j];
                costs[j] = cj;
            }
        }
        return costs[b.length()];
    }

    private FacetResultDto computeFacets(List<ProductSearchDocument> docs) {
        Map<String, Long> categoryCounts = new HashMap<>();
        Map<String, Long> brandCounts = new HashMap<>();
        Map<String, Long> stockCounts = new HashMap<>();

        long under5k = 0, fiveto15k = 0, fifteento30k = 0, over30k = 0;
        long rating45 = 0, rating40 = 0, rating35 = 0;

        for (ProductSearchDocument doc : docs) {
            if (doc.getCategoryName() != null) {
                categoryCounts.merge(doc.getCategoryName(), 1L, Long::sum);
            }
            if (doc.getBrand() != null) {
                brandCounts.merge(doc.getBrand(), 1L, Long::sum);
            }
            if (doc.getStockStatus() != null) {
                stockCounts.merge(doc.getStockStatus(), 1L, Long::sum);
            }

            if (doc.getPrice() != null) {
                double p = doc.getPrice().doubleValue();
                if (p < 5000) under5k++;
                else if (p < 15000) fiveto15k++;
                else if (p < 30000) fifteento30k++;
                else over30k++;
            }

            if (doc.getAverageRating() != null) {
                double r = doc.getAverageRating();
                if (r >= 4.5) rating45++;
                if (r >= 4.0) rating40++;
                if (r >= 3.5) rating35++;
            }
        }

        List<FacetBucketDto> categories = categoryCounts.entrySet().stream()
                .map(e -> FacetBucketDto.builder().key(e.getKey()).count(e.getValue()).build())
                .sorted(Comparator.comparingLong(FacetBucketDto::getCount).reversed())
                .collect(Collectors.toList());

        List<FacetBucketDto> brands = brandCounts.entrySet().stream()
                .map(e -> FacetBucketDto.builder().key(e.getKey()).count(e.getValue()).build())
                .sorted(Comparator.comparingLong(FacetBucketDto::getCount).reversed())
                .collect(Collectors.toList());

        List<FacetBucketDto> stockStatuses = stockCounts.entrySet().stream()
                .map(e -> FacetBucketDto.builder().key(e.getKey()).count(e.getValue()).build())
                .collect(Collectors.toList());

        List<RangeFacetBucketDto> priceRanges = List.of(
                RangeFacetBucketDto.builder().key("Under ₹5,000").count(under5k).from(0.0).to(5000.0).build(),
                RangeFacetBucketDto.builder().key("₹5,000 - ₹15,000").count(fiveto15k).from(5000.0).to(15000.0).build(),
                RangeFacetBucketDto.builder().key("₹15,000 - ₹30,000").count(fifteento30k).from(15000.0).to(30000.0).build(),
                RangeFacetBucketDto.builder().key("Over ₹30,000").count(over30k).from(30000.0).to(null).build()
        );

        List<RangeFacetBucketDto> ratings = List.of(
                RangeFacetBucketDto.builder().key("4.5 & up").count(rating45).from(4.5).to(5.0).build(),
                RangeFacetBucketDto.builder().key("4.0 & up").count(rating40).from(4.0).to(5.0).build(),
                RangeFacetBucketDto.builder().key("3.5 & up").count(rating35).from(3.5).to(5.0).build()
        );

        return FacetResultDto.builder()
                .categories(categories)
                .brands(brands)
                .priceRanges(priceRanges)
                .ratings(ratings)
                .stockStatuses(stockStatuses)
                .build();
    }

    private ProductSearchHitDto toHitDto(ProductSearchDocument doc, double score) {
        return ProductSearchHitDto.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .slug(doc.getSlug())
                .shortDescription(doc.getShortDescription())
                .categoryName(doc.getCategoryName())
                .categorySlug(doc.getCategorySlug())
                .brand(doc.getBrand())
                .price(doc.getPrice())
                .compareAtPrice(doc.getCompareAtPrice())
                .averageRating(doc.getAverageRating())
                .reviewCount(doc.getReviewCount())
                .stockStatus(doc.getStockStatus())
                .thumbnailUrl(doc.getThumbnailUrl())
                .badge(doc.getBadge())
                .score(Math.round(score * 100.0) / 100.0)
                .build();
    }

    @Override
    public void createIndex(String indexName) {
        indices.add(indexName);
    }

    @Override
    public void swapAlias(String aliasName, String oldIndex, String newIndex) {
        if (oldIndex != null) {
            indices.remove(oldIndex);
        }
        aliases.put(aliasName, newIndex);
    }

    @Override
    public long countDocuments() {
        return documents.size();
    }

    @Override
    public void clear() {
        documents.clear();
    }

    @Override
    public boolean isHealthy() {
        return true;
    }
}
