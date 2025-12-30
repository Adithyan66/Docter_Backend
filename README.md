# Doctor Management Backend API

A comprehensive backend API for managing practice operations including patients, treatments, visits, prescriptions, payments, and staff management. 

## Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **Patient Management**: Complete patient lifecycle management with unique ID generation
- **Treatment Management**: Treatment creation, updates, and tracking
- **Visit Management**: Patient visit scheduling and management
- **Prescription Management**: Digital prescription handling
- **Payment Processing**: Payment tracking and management
- **Media/Image Handling**: Image upload and download with cloud storage support (GCP, AWS S3)
- **Staff Management**: Staff member management
- **Daily Activity Tracking**: Activity logging and tracking
- **Clinic Management**: Multi-clinic support

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Dependency Injection**: TSyringe
- **Validation**: Zod
- **Storage**: Google Cloud Storage / AWS S3
- **Password Hashing**: bcrypt

## Architecture

This project follows Clean Architecture principles with clear separation of concerns:

- **Domain Layer**: Entities, repositories, value objects, errors
- **Application Layer**: Use cases, interfaces, mappers
- **Infrastructure Layer**: Database implementations, external services, configurations
- **Presentation Layer**: Controllers, routes, DTOs, validators, middleware

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or remote instance)
- npm or yarn
- Google Cloud Storage account OR AWS S3 account (for image storage)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (see `.env.example` for reference):
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env` file

5. Build the project:
```bash
npm run build
```

6. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Environment Variables

See `.env.example` for a complete list of required environment variables. Key variables include:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- `STORAGE_PROVIDER`: Storage provider (gcp/s3)
- `CORS_ORIGIN`: Allowed CORS origin

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Patients
- `GET /patients` - Get all patients
- `GET /patients/:id` - Get patient by ID
- `POST /patients` - Create new patient
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient

### Treatments
- `GET /treatments` - Get all treatments
- `GET /treatments/:id` - Get treatment by ID
- `POST /treatments` - Create new treatment
- `PUT /treatments/:id` - Update treatment
- `DELETE /treatments/:id` - Delete treatment

### Treatment Courses
- `GET /treatment-courses` - Get all treatment courses
- `GET /treatment-courses/:id` - Get treatment course by ID
- `POST /treatment-courses` - Create new treatment course
- `PUT /treatment-courses/:id` - Update treatment course
- `DELETE /treatment-courses/:id` - Delete treatment course

### Visits
- `GET /visits` - Get all visits
- `GET /visits/:id` - Get visit by ID
- `POST /visits` - Create new visit
- `PUT /visits/:id` - Update visit
- `DELETE /visits/:id` - Delete visit

### Prescriptions
- `GET /prescriptions` - Get all prescriptions
- `GET /prescriptions/:id` - Get prescription by ID
- `POST /prescriptions` - Create new prescription
- `PUT /prescriptions/:id` - Update prescription
- `DELETE /prescriptions/:id` - Delete prescription

### Payments
- `GET /payments` - Get all payments
- `GET /payments/:id` - Get payment by ID
- `POST /payments` - Create new payment
- `PUT /payments/:id` - Update payment

### Media/Images
- `POST /images/upload-url` - Generate image upload URL
- `POST /images/download-url` - Generate image download URL

### Staff
- `GET /staff` - Get all staff members
- `GET /staff/:id` - Get staff member by ID
- `POST /staff` - Create new staff member
- `PUT /staff/:id` - Update staff member
- `DELETE /staff/:id` - Delete staff member

### Clinic
- `GET /clinics` - Get all clinics
- `GET /clinics/:id` - Get clinic by ID
- `POST /clinics` - Create new clinic
- `PUT /clinics/:id` - Update clinic
- `DELETE /clinics/:id` - Delete clinic

### Daily Activities
- `GET /daily-activities` - Get all daily activities
- `GET /daily-activities/:id` - Get daily activity by ID
- `POST /daily-activities` - Create new daily activity
- `PUT /daily-activities/:id` - Update daily activity
- `DELETE /daily-activities/:id` - Delete daily activity

## Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (runs from dist/)

## Docker

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:
- MongoDB container
- Backend API container

### Using Docker only

```bash
docker build -t doctor-backend .
docker run -p 3000:3000 --env-file .env doctor-backend
```

## Project Structure

```
backend/
├── src/                    # Source TypeScript files
│   ├── application/        # Application layer (use cases, interfaces)
│   ├── domain/             # Domain layer (entities, repositories, value objects)
│   ├── infrastructure/     # Infrastructure layer (database, external services)
│   ├── presentation/       # Presentation layer (controllers, routes, DTOs)
│   └── server.ts           # Application entry point
├── dist/                   # Compiled JavaScript files
├── tests/                  # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
├── tsconfig.json
└── README.md
```

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Environment variables are used for sensitive configuration
- CORS is configured for allowed origins
- Input validation is performed using Zod schemas

## Error Handling

The application uses a centralized error handling system with:
- Custom error classes (BadRequest, NotFound, Unauthorized, Conflict, Validation)
- Consistent error response format
- Proper HTTP status codes


..................................................

