package com.gearflow.config;

import com.gearflow.entity.User;
import com.gearflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create test user if not exists
        if (!userRepository.existsByUsername("testuser")) {
            User testUser = User.builder()
                    .id(java.util.UUID.randomUUID().toString())
                    .username("testuser")
                    .password(passwordEncoder.encode("password123"))
                    .phone("0123456789")
                    .address("Hanoi, Vietnam")
                    .role(User.UserRole.USER)
                    .build();
            userRepository.save(testUser);
            log.info("✅ Created test user: testuser / password123");
        }

        // Create admin user if not exists
        if (!userRepository.existsByUsername("admin")) {
            User adminUser = User.builder()
                    .id(java.util.UUID.randomUUID().toString())
                    .username("admin")
                    .password(passwordEncoder.encode("password123"))
                    .phone("0987654321")
                    .address("Hanoi, Vietnam")
                    .role(User.UserRole.ADMIN)
                    .build();
            userRepository.save(adminUser);
            log.info("✅ Created admin user: admin / password123");
        }

        log.info("🚀 Data initialization completed!");
        log.info("📝 Test accounts:");
        log.info("   - Username: testuser, Password: password123 (USER)");
        log.info("   - Username: admin, Password: password123 (ADMIN)");
    }
}
