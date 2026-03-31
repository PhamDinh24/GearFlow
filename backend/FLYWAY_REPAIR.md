# Flyway Repair Instructions

## ⚠️ Issue
Migration V6 failed because it tried to add duplicate stock data that already exists in V3 migration.

## ✅ Solution
V6 migration file has been **DELETED** since it was redundant. The stock data already exists from V3.

## 🔧 Cleanup Required

**ONLY IF** you previously tried to start the backend and saw a Flyway error about V6, you need to clean up the failed migration record:

### Option 1: Using Maven (Recommended)
```bash
cd backend
mvn flyway:repair
```

This command will:
- Remove failed migration records from `flyway_schema_history` table
- Allow the application to start normally

After repair, start the backend:
```bash
mvn spring-boot:run
```

### Option 2: Manual SQL (Alternative)
If Maven doesn't work, connect to PostgreSQL and run:

```sql
-- Check for failed migrations
SELECT version, description, success, installed_on 
FROM flyway_schema_history 
WHERE success = false;

-- Delete the failed V6 migration record (if it exists)
DELETE FROM flyway_schema_history WHERE version = '6';

-- Verify - should only show V1 through V5
SELECT version, description, success 
FROM flyway_schema_history 
ORDER BY installed_rank;
```

Then restart the application:
```bash
cd backend
mvn spring-boot:run
```

## 📋 Current Migration Status

| Version | Description | Status |
|---------|-------------|--------|
| V1 | Initial Schema | ✅ Applied |
| V2 | Add Cart Tables | ✅ Applied |
| V3 | Insert Sample Data (includes products, variants, and stock) | ✅ Applied |
| V4 | Add Coupons And Notifications | ✅ Applied |
| V5 | Fix Payment Table | ✅ Applied |
| V6 | ~~Add Stock Data~~ | ❌ DELETED (redundant) |

## 📝 Notes

- **V3 already includes stock data** for all 5 sample products (12 variants total)
- V6 was attempting to add duplicate data, which caused foreign key constraint violations
- After deleting V6 file and running `flyway:repair`, the system will work normally
- No data loss - all stock information is preserved in V3 migration

## ✨ What's in V3 Migration?

V3 includes:
- 3 categories (Mechanical, Gaming, Office keyboards)
- 4 brands (Keychron, Ducky, Leopold, Varmilo)
- 5 products (prod-001 to prod-005)
- 12 product variants (var-001 to var-012)
- 12 stock records (one for each variant)
- Product attributes for each product

All inventory data is complete and ready to use!
