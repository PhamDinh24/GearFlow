package com.gearflow.repository;

import com.gearflow.entity.JwtToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JwtTokenRepository extends JpaRepository<JwtToken, String> {

    Optional<JwtToken> findByToken(String token);

    List<JwtToken> findByUserId(String userId);

    @Query("SELECT t FROM JwtToken t WHERE t.userId = :userId AND t.status = 'ACTIVE'")
    List<JwtToken> findActiveTokensByUserId(@Param("userId") String userId);

    @Query("SELECT t FROM JwtToken t WHERE t.userId = :userId AND t.expiresAt > :now")
    List<JwtToken> findValidTokensByUserId(@Param("userId") String userId, @Param("now") LocalDateTime now);

    @Query("DELETE FROM JwtToken t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);

    @Query("SELECT t FROM JwtToken t WHERE t.userId = :userId AND t.status = 'ACTIVE' AND t.expiresAt > :now ORDER BY t.createdAt DESC LIMIT 1")
    Optional<JwtToken> findLatestActiveTokenByUserId(@Param("userId") String userId, @Param("now") LocalDateTime now);

    Long countByUserIdAndStatus(String userId, String status);
}
