# Library Management System API

A RESTful API for managing a library system built with NestJS, TypeScript, and PostgreSQL.

## Features

### Core Functionality
- ✅ **Books Management**: Add, update, delete, list, and search books
- ✅ **Borrowers Management**: Register, update, delete, and list borrowers  
- ✅ **Borrowing Process**: Check out books, return books, track borrows, monitor overdue books

### Additional Features
- ✅ **Analytics & Export**: Export borrowing data in CSV/XLSX formats
- ✅ **Rate Limiting**: API rate limiting protection
- ✅ **Dockerization**: Complete Docker setup with PostgreSQL
- ✅ **API Documentation**: Swagger/OpenAPI documentation
- ✅ **Input Validation**: Request validation and error handling

## Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
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

## API Documentation

Access the Swagger documentation at: `http://localhost:${API_PORT}/api/v1/docs`

### Main Endpoints

**Books**
- `POST /api/v1/book` - Create a book
- `GET /api/v1/book` - List books (with search & pagination)
- `GET /api/v1/book/:id` - Get book by ID
- `PATCH /api/v1/book/:id` - Update book
- `DELETE /api/v1/book/:id` - Delete book

**Borrowers**
- `POST /api/v1/borrower` - Register borrower
- `GET /api/v1/borrower` - List borrowers
- `GET /api/v1/borrower/:id` - Get borrower by ID
- `PATCH /api/v1/borrower/:id` - Update borrower
- `DELETE /api/v1/borrower/:id` - Delete borrower

**Borrowing**
- `POST /api/v1/borrow` - Borrow a book
- `PATCH /api/v1/borrow/:id/return` - Return a book
- `GET /api/v1/borrow` - List all borrows
- `GET /api/v1/borrow/overdue` - Get overdue borrows
- `GET /api/v1/borrow/borrower/:borrowerId` - Get borrows by borrower

**Export Features**
- `GET /api/v1/borrow/export` - Export borrows (CSV/XLSX)
- `GET /api/v1/borrow/export/last-month` - Export last month's borrows
- `GET /api/v1/borrow/export/overdue` - Export overdue borrows

### Example Usage

```json
// Create a book
POST /api/v1/book
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald", 
  "isbn": "9780743273565",
  "availableQuantity": 5,
  "shelfLocation": "A1-001"
}

// Register a borrower
POST /api/v1/borrower
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}

// Borrow a book
POST /api/v1/borrow
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