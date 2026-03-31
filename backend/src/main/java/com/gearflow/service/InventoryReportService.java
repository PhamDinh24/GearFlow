package com.gearflow.service;

import com.gearflow.entity.Stock;
import com.gearflow.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryReportService {
    private final StockRepository stockRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLowStockReport(Integer threshold) {
        log.info("Generating low stock report with threshold: {}", threshold);
        
        return stockRepository.findAll().stream()
                .filter(stock -> stock.getQuantity() <= threshold)
                .map(this::convertToReportMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOutOfStockReport() {
        log.info("Generating out of stock report");
        
        return stockRepository.findAll().stream()
                .filter(stock -> stock.getQuantity() == 0)
                .map(this::convertToReportMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInventorySummary() {
        log.info("Generating inventory summary");
        
        List<Stock> allStock = stockRepository.findAll();
        
        int totalQuantity = allStock.stream()
                .mapToInt(Stock::getQuantity)
                .sum();
        
        int totalReserved = allStock.stream()
                .mapToInt(Stock::getReserved)
                .sum();
        
        int totalAvailable = allStock.stream()
                .mapToInt(Stock::getAvailable)
                .sum();
        
        long lowStockCount = allStock.stream()
                .filter(stock -> stock.getQuantity() <= 10)
                .count();
        
        long outOfStockCount = allStock.stream()
                .filter(stock -> stock.getQuantity() == 0)
                .count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalItems", allStock.size());
        summary.put("totalQuantity", totalQuantity);
        summary.put("totalReserved", totalReserved);
        summary.put("totalAvailable", totalAvailable);
        summary.put("lowStockCount", lowStockCount);
        summary.put("outOfStockCount", outOfStockCount);
        
        return summary;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getInventoryByVariant() {
        log.info("Generating inventory by variant report");
        
        return stockRepository.findAll().stream()
                .map(this::convertToReportMap)
                .collect(Collectors.toList());
    }

    private Map<String, Object> convertToReportMap(Stock stock) {
        Map<String, Object> map = new HashMap<>();
        map.put("variantId", stock.getVariantId());
        map.put("quantity", stock.getQuantity());
        map.put("reserved", stock.getReserved());
        map.put("available", stock.getAvailable());
        map.put("updatedAt", stock.getUpdatedAt());
        return map;
    }
}
