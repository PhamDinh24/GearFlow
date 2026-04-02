# 🔧 Backend Development Guide

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/gearflow/
│   │   │   ├── GearFlowApplication.java       # Main app
│   │   │   ├── config/                        # Spring configs
│   │   │   ├── controller/                    # REST endpoints
│   │   │   ├── dto/                           # Data Transfer Objects
│   │   │   ├── entity/                        # JPA entities
│   │   │   ├── exception/                     # Custom exceptions
│   │   │   ├── repository/                    # Spring Data JPA repos
│   │   │   ├── security/                      # Security configs
│   │   │   ├── service/                       # Business logic
│   │   │   └── util/                          # Utilities
│   │   └── resources/
│   │       ├── application.yml                # Configuration
│   │       └── db/migration/                  # Flyway migrations
│   └── test/                                  # Test classes
└── pom.xml                                    # Maven dependencies
```

## REST Endpoint Conventions

### Standard CRUD Endpoints

```
GET    /api/{resource}              → Get all (paginated)
GET    /api/{resource}/{id}         → Get by ID
POST   /api/{resource}              → Create new
PUT    /api/{resource}/{id}         → Update
DELETE /api/{resource}/{id}         → Delete
```

### Admin-Only Endpoints

Prefix with `/admin` or use `@PreAuthorize("hasRole('ADMIN')")`:

```java
@PostMapping
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
}
```

### Authentication

Use `@AuthenticationPrincipal UserPrincipal` to get current user:

```java
@GetMapping
public ResponseEntity<List<OrderDTO>> getUserOrders(
    @AuthenticationPrincipal UserPrincipal user) {
    return ResponseEntity.ok(orderService.getUserOrders(user.getId()));
}
```

## Service Layer Pattern

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {
    private final CategoryRepository categoryRepository;
    
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        log.info("Fetching all categories");
        return categoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public CategoryDTO createCategory(CategoryDTO dto) {
        log.info("Creating category: {}", dto.getName());
        Category category = Category.builder()
                .id(UUID.randomUUID().toString())
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
        Category saved = categoryRepository.save(category);
        return convertToDTO(saved);
    }
    
    @Transactional
    public CategoryDTO updateCategory(String id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        Category updated = categoryRepository.save(category);
        return convertToDTO(updated);
    }
    
    @Transactional
    public void deleteCategory(String id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found");
        }
        categoryRepository.deleteById(id);
    }
    
    private CategoryDTO convertToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
```

## Entity Pattern

```java
@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @Column(name = "categories_id", length = 36)
    private String id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

## DTO Pattern

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {
    private String id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer productCount;  // Derived/computed field
}
```

## Repository Pattern

```java
@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    Optional<Category> findByName(String name);
    List<Category> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT c FROM Category c WHERE c.name LIKE %:keyword%")
    Page<Category> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
```

## Controller Pattern

```java
@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {
    private final CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        log.info("GET /api/categories");
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable String id) {
        log.info("GET /api/categories/{}", id);
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO dto) {
        log.info("POST /api/categories - Name: {}", dto.getName());
        CategoryDTO created = categoryService.createCategory(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable String id,
            @RequestBody CategoryDTO dto) {
        log.info("PUT /api/categories/{}", id);
        CategoryDTO updated = categoryService.updateCategory(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        log.info("DELETE /api/categories/{}", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
```

## Exception Handling

### Custom Exceptions

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
```

### Global Exception Handler

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, e.getMessage()));
    }
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, e.getMessage()));
    }
}
```

## Transaction Management

```java
@Transactional  // Read-write transaction
public void updateEntity() {
    // Can read and write
}

@Transactional(readOnly = true)  // Read-only transaction
public List<Data> getEntities() {
    // Can only read, better performance
    return repository.findAll();
}
```

## Logging Best Practices

```java
@Slf4j  // Lombok annotation for logger
public class CategoryService {
    
    public CategoryDTO getCategory(String id) {
        log.info("Fetching category with id: {}", id);
        try {
            Category category = repository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Not found"));
            log.debug("Category found: {}", category.getName());
            return convertToDTO(category);
        } catch (Exception e) {
            log.error("Error fetching category: {}", id, e);
            throw e;
        }
    }
}
```

## Pagination

```java
@Service
public class ProductService {
    
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        log.info("Fetching products - page: {}, size: {}", 
                 pageable.getPageNumber(), pageable.getPageSize());
        return productRepository.findAll(pageable)
                .map(this::convertToDTO);
    }
}

// Controller
@GetMapping
public ResponseEntity<Page<ProductDTO>> getAllProducts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
    Pageable pageable = PageRequest.of(page, size);
    return ResponseEntity.ok(productService.getAllProducts(pageable));
}
```

## Database Migrations (Flyway)

### Create Migration File
`V9__Add_New_Feature.sql`

```sql
-- ============================================================================
-- V9: Add New Feature
-- Description of what this migration does
-- ============================================================================

CREATE TABLE new_table (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE existing_table ADD COLUMN new_column VARCHAR(100);

CREATE INDEX idx_new_table_name ON new_table(name);
```

## Common Dependencies

```xml
<!-- Spring Boot Starter Web -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- PostgreSQL Driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>

<!-- JWT tokens -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
</dependency>
```

## Configuration (application.yml)

```yaml
spring:
  application:
    name: gearflow-api
  
  datasource:
    url: jdbc:postgresql://localhost:5432/gearflow
    username: postgres
    password: password
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        jdbc:
          batch_size: 25
  
  flyway:
    enabled: true
    baseline-on-migrate: true

server:
  servlet:
    context-path: /api
  port: 8080
```

## Testing Pattern

```java
@SpringBootTest
public class CategoryServiceTest {
    
    @MockBean
    private CategoryRepository categoryRepository;
    
    @InjectMocks
    private CategoryService categoryService;
    
    @Test
    public void testGetAllCategories() {
        // Arrange
        List<Category> categories = List.of(
            Category.builder().id("1").name("Test").build()
        );
        when(categoryRepository.findAll()).thenReturn(categories);
        
        // Act
        List<CategoryDTO> result = categoryService.getAllCategories();
        
        // Assert
        assertEquals(1, result.size());
        assertEquals("Test", result.get(0).getName());
    }
}
```

## Best Practices

1. **Use DTOs** for API responses, not entities
2. **Always log** important operations
3. **Use transactions** for multi-step operations
4. **Validate input** in services, not just controllers
5. **Use PageRequest** for pagination
6. **Create custom exceptions** for business logic errors
7. **Use readOnly=true** for query-only transactions
8. **Index frequently queried columns** in database
9. **Use UUIDs** for entity IDs
10. **Document API endpoints** with detailed comments

## Performance Tips

- Lazy load relationships when needed
- Use select specific fields when not needing full entities
- Implement caching for frequently accessed data
- Use database indexes effectively
- Avoid N+1 queries (use joins or batch fetching)
- Use pagination for large result sets
