package com.ecommerce.search.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "search")
@Getter
@Setter
public class SearchProperties {

    private Engine engine = new Engine();
    private Ranking ranking = new Ranking();
    private Topics topics = new Topics();

    @Getter
    @Setter
    public static class Engine {
        private String type = "memory"; // "memory" or "elasticsearch"
        private String elasticsearchUrl = "http://localhost:9200";
        private String aliasName = "products_search";
    }

    @Getter
    @Setter
    public static class Ranking {
        private double titleBoost = 3.0;
        private double brandBoost = 2.0;
        private double categoryBoost = 1.5;
        private double shortDescBoost = 1.2;
        private double descBoost = 1.0;
        private double inStockBoost = 1.5;
    }

    @Getter
    @Setter
    public static class Topics {
        private String products = "ecommerce.cdc.catalog.products";
        private String variants = "ecommerce.cdc.catalog.product_variants";
        private String categories = "ecommerce.cdc.catalog.categories";
        private String dlq = "ecommerce.cdc.catalog.dlq";
    }
}
