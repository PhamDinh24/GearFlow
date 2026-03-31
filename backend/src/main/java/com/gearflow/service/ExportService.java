package com.gearflow.service;

import com.gearflow.entity.Order;
import com.gearflow.entity.Product;
import com.gearflow.repository.OrderRepository;
import com.gearflow.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExportService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public byte[] exportOrdersAsCSV() {
        log.info("Exporting orders as CSV");
        
        List<Order> orders = orderRepository.findAll();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        try (PrintWriter writer = new PrintWriter(outputStream)) {
            writer.println("Order ID,User ID,Status,Total Amount,Created At,Updated At");
            
            for (Order order : orders) {
                writer.printf("%s,%s,%s,%s,%s,%s%n",
                        order.getId(),
                        order.getUserId(),
                        order.getStatus(),
                        order.getTotalAmount(),
                        order.getCreatedAt(),
                        order.getUpdatedAt()
                );
            }
            
            writer.flush();
        }
        
        return outputStream.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] exportProductsAsCSV() {
        log.info("Exporting products as CSV");
        
        List<Product> products = productRepository.findAll();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        try (PrintWriter writer = new PrintWriter(outputStream)) {
            writer.println("Product ID,Name,Description,Base Price,Category ID,Brand ID,Support,Created At,Updated At");
            
            for (Product product : products) {
                writer.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                        product.getId(),
                        escapeCSV(product.getName()),
                        escapeCSV(product.getDescription()),
                        product.getBasePrice(),
                        product.getCategoryId(),
                        product.getBrandId(),
                        escapeCSV(product.getSupport()),
                        product.getCreatedAt(),
                        product.getUpdatedAt()
                );
            }
            
            writer.flush();
        }
        
        return outputStream.toByteArray();
    }

    private String escapeCSV(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
