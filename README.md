# Library Management System API

A RESTful API for managing a library system built with NestJS, TypeScript, and PostgreSQL.

## Features

### Core Functionality
- ✅ **Books Management**: Add, update, delete, list, and search books
- ✅ **Borrowers Management**: Register, update, delete, and list borrowers  
- ✅ **Borrowing Process**: Check out books, return books, track borrows, monitor overdue books

### Additional Features
- ✅ **Basic Authentication**: HTTP Basic Auth for protected endpoints
- ✅ **Analytics & Export**: Export borrowing data in CSV/XLSX formats
- ✅ **Rate Limiting**: API rate limiting protection
- ✅ **Dockerization**: Complete Docker setup with PostgreSQL
- ✅ **API Documentation**: Swagger/OpenAPI documentation
- ✅ **Input Validation**: Request validation and error handling
- ✅ **Logging**: Service logging

## Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: HTTP Basic Auth with bcrypt password hashing
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **Validation**: class-validator & class-transformer

## Installation & Setup

### Using Docker (Recommended)

1. **Clone and start**
```bash
git clone <repository-url>
cd library-management-system-api
docker-compose up -d
```

The API will be available at `http://localhost:3000/api/v1`

### Local Development

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
Create a `.env` file:
```env
API_PORT=3000
API_PREFIX=api/v1
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=library_management_system
DB_SYNC=true
CORS_ORIGIN=*
THROTTLER_TTL_IN_SECONDS=60
THROTTLER_LIMIT=100
```

3. **Start PostgreSQL and run the app**
```bash
# Start database
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=library_management_system -p 5432:5432 -d postgres

# Run application
npm run start:dev
```

## Database Schema

The system uses PostgreSQL with TypeORM and consists of three main entities:

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Borrower    │       │     Borrow      │       │      Book       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄─────┐│ id (PK)         │┌─────►│ id (PK)         │
│ name            │      ││ borrowerId (FK) ││      │ title           │
│ email (unique)  │      ││ bookId (FK)     ││      │ author          │
│ password        │      ││ borrowDate      ││      │ isbn (unique)   │
│ registeredDate  │      ││ dueDate         ││      │ availableQty    │
│ createdAt       │      ││ returnDate      ││      │ shelfLocation   │
│ updatedAt       │      │└─────────────────┘│      │ createdAt       │
└─────────────────┘      └──────────────────┘      │ updatedAt       │
                                                    └─────────────────┘
```

### Tables Schema

#### Borrower Table
```sql
CREATE TABLE borrower (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    registered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Book Table
```sql
CREATE TABLE book (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(13) UNIQUE NOT NULL,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    shelf_location VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Borrow Table
```sql
CREATE TABLE borrow (
    id SERIAL PRIMARY KEY,
    borrower_id INTEGER NOT NULL REFERENCES borrower(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES book(id) ON DELETE CASCADE,
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE NOT NULL,
    return_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Entity Relationships

- **One-to-Many**: Borrower → Borrow (One borrower can have multiple borrows)
- **One-to-Many**: Book → Borrow (One book can be borrowed multiple times)
- **Many-to-One**: Borrow → Borrower (Each borrow belongs to one borrower)
- **Many-to-One**: Borrow → Book (Each borrow is for one book)

### Key Constraints

- **Borrower.email**: Unique constraint to ensure no duplicate emails
- **Book.isbn**: Unique constraint for ISBN numbers
- **Foreign Keys**: Borrow table references both Borrower and Book tables
- **Cascade Delete**: When a borrower or book is deleted, related borrows are also deleted

### Indexes (Recommended)

```sql
-- Performance indexes
CREATE INDEX idx_borrower_email ON borrower(email);
CREATE INDEX idx_book_isbn ON book(isbn);
CREATE INDEX idx_borrow_borrower_id ON borrow(borrower_id);
CREATE INDEX idx_borrow_book_id ON borrow(book_id);
CREATE INDEX idx_borrow_due_date ON borrow(due_date);
CREATE INDEX idx_borrow_return_date ON borrow(return_date);
```

## API Documentation

Access the Swagger documentation at: `http://localhost:3000/api/v1/docs`

### Authentication

The API uses HTTP Basic Authentication for protected endpoints. Borrowers authenticate using their email and password.

**Protected Endpoints:**
- Book creation, updates, and deletion
- Borrower updates and deletion  
- All borrowing operations
- Export functionalities

**Public Endpoints:**
- Book listing and search
- Borrower registration
- Borrower listing
- Health check

### Main Endpoints

**Books**
- `POST /api/v1/book` - Create a book 🔒
- `GET /api/v1/book` - List books (with search & pagination)
- `GET /api/v1/book/:id` - Get book by ID
- `PATCH /api/v1/book/:id` - Update book 🔒
- `DELETE /api/v1/book/:id` - Delete book 🔒

**Borrowers**
- `POST /api/v1/borrower` - Register borrower
- `GET /api/v1/borrower` - List borrowers
- `GET /api/v1/borrower/:id` - Get borrower by ID
- `PATCH /api/v1/borrower/:id` - Update borrower 🔒
- `DELETE /api/v1/borrower/:id` - Delete borrower 🔒

**Borrowing**
- `POST /api/v1/borrow` - Borrow a book 🔒
- `PATCH /api/v1/borrow/:id/return` - Return a book 🔒
- `GET /api/v1/borrow` - List all borrows 🔒
- `GET /api/v1/borrow/overdue` - Get overdue borrows 🔒
- `GET /api/v1/borrow/borrower/:borrowerId` - Get borrows by borrower 🔒

**Export Features**
- `GET /api/v1/borrow/export` - Export borrows (CSV/XLSX) 🔒
- `GET /api/v1/borrow/export/last-month` - Export last month's borrows 🔒
- `GET /api/v1/borrow/export/overdue` - Export overdue borrows 🔒

🔒 = Requires Basic Authentication

### Example Usage

```bash
# Register a borrower (public endpoint)
curl -X POST http://localhost:3000/api/v1/borrower \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'

# Create a book (requires authentication)
curl -X POST http://localhost:3000/api/v1/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'john.doe@example.com:securepassword123' | base64)" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald", 
    "isbn": "9780743273565",
    "availableQuantity": 5,
    "shelfLocation": "A1-001"
  }'

# Borrow a book (requires authentication)
curl -X POST http://localhost:3000/api/v1/borrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'john.doe@example.com:securepassword123' | base64)" \
  -d '{
    "bookId": 1,
    "borrowerId": 1,
    "dueDate": "2025-09-01"
  }'
```

### JSON Examples

```json
// Register a borrower (now includes password)
POST /api/v1/borrower
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123"
}

// Create a book (requires auth header)
POST /api/v1/book
Authorization: Basic am9obi5kb2VAZXhhbXBsZS5jb206c2VjdXJlcGFzc3dvcmQxMjM=
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald", 
  "isbn": "9780743273565",
  "availableQuantity": 5,
  "shelfLocation": "A1-001"
}

// Borrow a book (requires auth header)
POST /api/v1/borrow
Authorization: Basic am9obi5kb2VAZXhhbXBsZS5jb206c2VjdXJlcGFzc3dvcmQxMjM=
{
  "bookId": 1,
  "borrowerId": 1,
  "dueDate": "2025-09-01"
}
```

## Development

```bash
# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod
```