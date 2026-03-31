package com.gearflow.service;

import com.gearflow.dto.StockDTO;
import com.gearflow.entity.Stock;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockTrackingService {
    private final StockRepository stockRepository;

    @Transactional(readOnly = true)
    public Page<StockDTO> getStockHistory(Pageable pageable) {
        log.info("Fetching stock history");
        return stockRepository.findAll(pageable).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public StockDTO getStockSnapshot(String variantId) {
        log.info("Fetching stock snapshot for variant: {}", variantId);
        
        Stock stock = stockRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for variant: " + variantId));
        
        return convertToDTO(stock);
    }

    @Transactional(readOnly = true)
    public List<StockDTO> getStockMovements(String variantId) {
        log.info("Fetching stock movements for variant: {}", variantId);
        
        Stock stock = stockRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for variant: " + variantId));
        
        return List.of(convertToDTO(stock));
    }

    @Transactional(readOnly = true)
    public List<StockDTO> getRecentStockChanges(int days) {
        log.info("Fetching stock changes from last {} days", days);
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        
        return stockRepository.findAll().stream()
                .filter(stock -> stock.getUpdatedAt().isAfter(cutoffDate))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StockDTO> getStockByQuantityRange(Integer minQuantity, Integer maxQuantity) {
        log.info("Fetching stock with quantity between {} and {}", minQuantity, maxQuantity);
        
        return stockRepository.findAll().stream()
                .filter(stock -> stock.getQuantity() >= minQuantity && stock.getQuantity() <= maxQuantity)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StockDTO> getHighReservedStock() {
        log.info("Fetching stock with high reserved quantities");
        
        return stockRepository.findAll().stream()
                .filter(stock -> stock.getReserved() > 0)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private StockDTO convertToDTO(Stock stock) {
        return StockDTO.builder()
                .variantId(stock.getVariantId())
                .quantity(stock.getQuantity())
                .reserved(stock.getReserved())
                .available(stock.getAvailable())
                .updatedAt(stock.getUpdatedAt())
                .build();
    }
}
