package com.agrilinker.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "cart_items")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItem {

    @Id
    private String id;

    private String userId;

    private String productId;
    private String name;
    private int price;
    private int quantity;
    private String unit;
    private String image;
    private String farmerEmail;
}
