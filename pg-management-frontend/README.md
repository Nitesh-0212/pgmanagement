PG Management - Spring Boot Backend
Minimal backend for PG Management app using Spring Boot & MySQL.
Setup
Prerequisites: JDK 17+, Maven, MySQL Server.
Database: Create MySQL database named pg_management.
Credentials: Update src/main/resources/application.properties with your MySQL username and password.
Run:
mvn spring-boot:run
(Server starts on http://localhost:8080. Tables are created/updated automatically)
API Base URL
http://localhost:8080/api
(See source code controllers for specific endpoints: /auth, /rooms, /tenants, /payments, /complaints, /dashboard)
Frontend
Connect React frontend (from pg-management-frontend) to the API Base URL above.