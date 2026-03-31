package com.gearflow.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

/**
 * Utility to repair Flyway schema history
 * Run this once to fix V3 migration checksum mismatch
 */
public class FlywayRepair {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/gearflow";
        String user = "postgres";
        String password = "123456";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            // Delete V3 migration entry
            int deleted = stmt.executeUpdate("DELETE FROM flyway_schema_history WHERE version = '3'");
            System.out.println("Deleted " + deleted + " row(s) from flyway_schema_history");
            System.out.println("Flyway repair completed successfully!");
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
