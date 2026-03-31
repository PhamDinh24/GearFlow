package com.gearflow.service;

import com.gearflow.dto.StockDTO;
import com.gearflow.entity.Stock;
import com.gearflow.exception.BusinessException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockService {
    private final StockRepository stockRepository;

    @Transactional(readOnly = true)
    public Page<StockDTO> getAllStock(Pageable pageable) {
        log.info("Fetching all stock");
        return stockRepository.findAll(pageable).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public StockDTO getStockByVariantId(String variantId) {
        log.info("Fetching stock for variant: {}", variantId);
        Stock stock = stockRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for variant: " + variantId));
        return convertToDTO(stock);
    }

    @Transactional
    public StockDTO updateStock(String variantId, Integer quantity) {
        log.info("Updating stock for variant: {} to quantity: {}", variantId, quantity);
        
        Stock stock = stockRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for variant: " + variantId));

        if (quantity < 0) {
            throw new BusinessException("Stock quantity cannot be negative");
        }

        stock.setQuantity(quantity);
        Stock updated = stockRepository.save(stock);
        log.info("Stock updated for variant: {}", variantId);
        return convertToDTO(updated);
    }

    @Transactional
    public StockDTO incrementStock(String variantId, Integer amount) {
        log.info("Incrementing stock for variant: {} by: {}", variantId, amount);
        
        Stock stock = stockRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for variant: " + variantId));

        if (amount <= 0) {
            throw new BusinessException("Increment amount must be positive");
        }

        stock.setQuantity(stock.getQuantity() + amount);
        Stock updated = stockRepository.save(stock);
        log.info("Stock incremented for variant: {}", variantId);
        return convertToDTO(updated);
    }

    @Transactional
    public StockDTO decrementStock(String variantId, Integer amount) {
        log.info("Decrementing stock for variant: {} by: {}", variantId, amount);
        
        Stock stock = stockRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for variant: " + variantId));

        if (amount <= 0) {
            throw new BusinessException("Decrement amount must be positive");
        }

        if (stock.getQuantity() < amount) {
            throw new BusinessException("Insufficient stock available");
        }

        stock.setQuantity(stock.getQuantity() - amount);
        Stock updated = stockRepository.save(stock);
        log.info("Stock decremented for variant: {}", variantId);
        return convertToDTO(updated);
    }

    @Transactional(readOnly = true)
    public List<StockDTO> getLowStockItems(Integer threshold) {
        log.info("Fetching low stock items with threshold: {}", threshold);
        return stockRepository.findAll().stream()
                .filter(stock -> stock.getQuantity() <= threshold)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean canReserve(String variantId, Integer amount) {
        Stock stock = stockRepository.findById(variantId).orElse(null);
        return stock != null && stock.canReserve(amount);
    }

    @Transactional
    public void reserveStock(String variantId, Integer amount) {
        log.info("Reserving stock for variant: {} amount: {}", variantId, amount);
        
        Stock stock = stockRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for variant: " + variantId));

        if (!stock.canReserve(amount)) {
            throw new BusinessException("Insufficient stock available for reservation");
        }

        stock.setReserved(stock.getReserved() + amount);
        stockRepository.save(stock);
    }

    @Transactional
    public void releaseReservedStock(String variantId, Integer amount) {
        log.info("Releasing reserved stock for variant: {} amount: {}", variantId, amount);
        
        Stock stock = stockRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for variant: " + variantId));

        stock.setReserved(Math.max(0, stock.getReserved() - amount));
        stockRepository.save(stock);
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
