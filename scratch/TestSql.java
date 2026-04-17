
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class TestSql {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://localhost:5432/gearflow";
        String user = "postgres";
        String password = "123456";
        String sql = new String(Files.readAllBytes(Paths.get("backend/src/main/resources/db/migration/V1__Initial_Schema.sql")));
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            stmt.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
            System.out.println("Cleaned public schema");
            stmt.execute(sql);
            System.out.println("Successfully executed SQL!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

