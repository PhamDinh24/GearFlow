package com.gearflow.controller;

import com.gearflow.service.ExportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/export")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class ExportController {
    private final ExportService exportService;

    @GetMapping("/orders/csv")
    public ResponseEntity<byte[]> exportOrdersAsCSV() {
        log.info("GET /api/admin/export/orders/csv");
        
        byte[] csvData = exportService.exportOrdersAsCSV();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "orders.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }

    @GetMapping("/products/csv")
    public ResponseEntity<byte[]> exportProductsAsCSV() {
        log.info("GET /api/admin/export/products/csv");
        
        byte[] csvData = exportService.exportProductsAsCSV();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "products.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }
}
