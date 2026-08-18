# Banking System

A comprehensive banking application built with Spring Boot that provides secure banking operations including user authentication, account management, transactions, and transfers.

## Features

- **User Authentication**: Secure login, registration, and password management with JWT token-based authentication
- **Account Management**: Create and manage bank accounts with deposit and withdrawal capabilities
- **Transaction History**: View detailed transaction history for accounts
- **Money Transfers**: Secure transfer of funds between accounts
- **RESTful API**: Well-documented API endpoints for all banking operations
- **Security**: JWT-based authentication with role-based access control
- **Frontend Interface**: Responsive web interface for user interactions

## Technology Stack

- **Backend**: Spring Boot 4.1.0, Java 21
- **Database**: PostgreSQL with Spring Data JPA
- **Security**: Spring Security, JWT (JSON Web Tokens)
- **Build Tool**: Maven
- **Frontend**: HTML5, CSS3, JavaScript
- **Validation**: Bean Validation (Jakarta Validation)
- **Logging**: SLF4J with Logback

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/system/banking/
│   │       ├── auth/                 # Authentication components
│   │       ├── account/              # Account management
│   │       ├── transaction/          # Transaction processing
│   │       ├── transfer/             # Money transfer functionality
│   │       ├── user/                 # User management
│   │       ├── security/             # Security configuration
│   │       ├── exception/            # Custom exception handling
│   │       └── common/               # Shared entities and utilities
│   └── resources/
│       ├── application.properties    # Database and application configuration
│       └── static/                   # Frontend resources
│           ├── index.html            # Main entry point
│           ├── css/                  # Stylesheets
│           ├── js/                   # JavaScript modules
│           └── templates/            # HTML templates for modals
└── test/
    └� java/
        └── com/system/banking/       # Test classes
```

## Getting Started

### Prerequisites

- Java 21 or higher
- Maven 3.8+
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/banking-system.git
   cd banking-system
   ```

2. **Configure the database**
   - Create a PostgreSQL database named `banking_db` (or modify the name in `application.properties`)
   - Update `src/main/resources/application.properties` with your database credentials:
     ```
     spring.datasource.url=jdbc:postgresql://localhost:5432/banking_db
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     ```

3. **Build the project**
   ```bash
   mvn clean install
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```
   or
   ```bash
   java -jar target/banking-0.0.1-SNAPSHOT.jar
   ```

5. **Access the application**
   - Frontend: http://localhost:8080
   - API Documentation: http://localhost:8080/swagger-ui.html (if Swagger is enabled)
   - API Base URL: http://localhost:8080/api

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and receive JWT token
- `POST /api/auth/change-password` - Change user password

### Accounts
- `GET /api/accounts` - Get all accounts for authenticated user
- `POST /api/accounts` - Create a new account
- `GET /api/accounts/{id}` - Get account by ID
- `PUT /api/accounts/{id}/deposit` - Deposit funds
- `PUT /api/accounts/{id}/withdraw` - Withdraw funds

### Transactions
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/{id}` - Get transaction by ID

### Transfers
- `POST /api/transfers` - Transfer money between accounts
- `GET /api/transfers` - Get transfer history

## Security

The application implements JWT-based authentication:
- All API endpoints (except authentication and public resources) require a valid JWT token
- Tokens are passed in the Authorization header: `Bearer <token>`
- Passwords are encrypted using BCrypt
- CORS is configured to allow frontend access
- CSRF protection is disabled for API (appropriate for JWT)

## Database Schema

The application uses JPA/Hibernate to automatically create the database schema. Key entities include:

- **User**: Stores user information (username, email, encrypted password)
- **Account**: Bank account details (balance, account number, type)
- **Transaction**: Record of financial transactions (deposits, withdrawals, transfers)
- **Transfer**: Money transfer records between accounts

## Configuration

Key configuration files:
- `src/main/resources/application.properties`: Main application configuration
- `pom.xml`: Maven dependencies and build configuration

## Testing

Run the test suite:
```bash
mvn test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Spring Boot team for the excellent framework
- The open-source community for various libraries used
- TESDA for the opportunity to build this banking system as part of the learning activity