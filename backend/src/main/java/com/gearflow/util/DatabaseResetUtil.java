package com.gearflow.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Utility to reset database - drops all tables
 * Use this for clean database setup
 */
public class DatabaseResetUtil {
    
    private static final String DB_URL = "jdbc:postgresql://localhost:5432/gearflow";
    private static final String DB_USER = "postgres";
    private static final String DB_PASSWORD = "123456";
    
    public static void main(String[] args) {
        System.out.println("============================================");
        System.out.println("GearFlow Database Reset Utility");
        System.out.println("============================================");
        System.out.println();
        System.out.println("WARNING: This will drop ALL tables!");
        System.out.println();
        
        try {
            // Load PostgreSQL driver
            Class.forName("org.postgresql.Driver");
            
            // Connect to database
            System.out.println("Connecting to database...");
            Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
            Statement stmt = conn.createStatement();
            
            // Get all tables
            System.out.println("Finding all tables...");
            List<String> tables = new ArrayList<>();
            ResultSet rs = stmt.executeQuery(
                "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
            );
            while (rs.next()) {
                tables.add(rs.getString("tablename"));
            }
            rs.close();
            
            System.out.println("Found " + tables.size() + " tables");
            System.out.println();
            
            // Drop all tables
            if (!tables.isEmpty()) {
                System.out.println("Dropping tables...");
                for (String table : tables) {
                    System.out.println("  - Dropping " + table);
                    stmt.execute("DROP TABLE IF EXISTS " + table + " CASCADE");
                }
                System.out.println();
                System.out.println("✓ All tables dropped successfully");
            } else {
                System.out.println("No tables to drop");
            }
            
            System.out.println();
            System.out.println("Success! Database is clean.");
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
