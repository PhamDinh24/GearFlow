package com.gearflow.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

/**
 * Utility to clean Flyway schema history
 * Run this if you get checksum mismatch errors
 */
public class FlywayCleanUtil {
    
    private static final String DB_URL = "jdbc:postgresql://localhost:5432/gearflow";
    private static final String DB_USER = "postgres";
    private static final String DB_PASSWORD = "123456";
    
    public static void main(String[] args) {
        System.out.println("============================================");
        System.out.println("GearFlow Flyway Clean Utility");
        System.out.println("============================================");
        System.out.println();
        
        try {
            // Load PostgreSQL driver
            Class.forName("org.postgresql.Driver");
            
            // Connect to database
            System.out.println("Connecting to database...");
            Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
            
            // Delete Flyway history
            System.out.println("Cleaning Flyway schema history...");
            Statement stmt = conn.createStatement();
            int deleted = stmt.executeUpdate("DELETE FROM flyway_schema_history");
            
            System.out.println("✓ Deleted " + deleted + " records from flyway_schema_history");
            System.out.println();
            System.out.println("Success! Flyway history cleaned.");
            System.out.println("Now you can restart the backend application.");
            System.out.println();
            
            // Close connections
            stmt.close();
            conn.close();
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
