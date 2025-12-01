# Sample Daily Activity Response

## Request Example

```
GET /api/daily-activities?date=2024-01-15&page=1&limit=10
```

### Query Parameters
- `date` (required): Date in YYYY-MM-DD format
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `clinicId` (optional): Filter by specific clinic

## Response Structure

### Success Response (Page 1)

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPatientsVisited": 8,
      "totalVisits": 10,
      "totalAmount": 12500,
      "averageAmountPerVisit": 1250,
      "visitStartTime": "2024-01-15T09:00:00.000Z",
      "visitEndTime": "2024-01-15T17:30:00.000Z",
      "totalHoursWorked": 8.5,
      "clinicNames": [
        "Downtown Medical Center",
        "City Clinic",
        "Health Plus"
      ]
    },
    "activities": [
      {
        "visitId": "507f1f77bcf86cd799439011",
        "visitTime": "2024-01-15T09:00:00.000Z",
        "patientId": "507f191e810c19729de860eb",
        "patientName": "John Doe",
        "courseId": "507f191e810c19729de860ec",
        "treatmentName": "Laser Hair Removal",
        "amountPaid": 1500,
        "clinicId": "507f191e810c19729de860ed",
        "clinicName": "Downtown Medical Center"
      },
      {
        "visitId": "507f1f77bcf86cd799439012",
        "visitTime": "2024-01-15T09:30:00.000Z",
        "patientId": "507f191e810c19729de860f1",
        "patientName": "Jane Smith",
        "courseId": "507f191e810c19729de860f2",
        "treatmentName": "Skin Whitening",
        "amountPaid": 2000,
        "clinicId": "507f191e810c19729de860ed",
        "clinicName": "Downtown Medical Center"
      },
      {
        "visitId": "507f1f77bcf86cd799439013",
        "visitTime": "2024-01-15T10:15:00.000Z",
        "patientId": "507f191e810c19729de860f3",
        "patientName": "Robert Johnson",
        "courseId": "507f191e810c19729de860f4",
        "treatmentName": "Acne Treatment",
        "amountPaid": 1000,
        "clinicId": "507f191e810c19729de860f5",
        "clinicName": "City Clinic"
      },
      {
        "visitId": "507f1f77bcf86cd799439014",
        "visitTime": "2024-01-15T11:00:00.000Z",
        "patientId": "507f191e810c19729de860eb",
        "patientName": "John Doe",
        "courseId": "507f191e810c19729de860f6",
        "treatmentName": "Facial Treatment",
        "amountPaid": 800,
        "clinicId": "507f191e810c19729de860ed",
        "clinicName": "Downtown Medical Center"
      },
      {
        "visitId": "507f1f77bcf86cd799439015",
        "visitTime": "2024-01-15T12:00:00.000Z",
        "patientId": "507f191e810c19729de860f7",
        "patientName": "Emily Davis",
        "courseId": "507f191e810c19729de860f8",
        "treatmentName": "Hair Treatment",
        "amountPaid": 1200,
        "clinicId": "507f191e810c19729de860f9",
        "clinicName": "Health Plus"
      },
      {
        "visitId": "507f1f77bcf86cd799439016",
        "visitTime": "2024-01-15T13:30:00.000Z",
        "patientId": "507f191e810c19729de860fa",
        "patientName": "Michael Brown",
        "courseId": "507f191e810c19729de860fb",
        "treatmentName": "Laser Hair Removal",
        "amountPaid": 1500,
        "clinicId": "507f191e810c19729de860ed",
        "clinicName": "Downtown Medical Center"
      },
      {
        "visitId": "507f1f77bcf86cd799439017",
        "visitTime": "2024-01-15T14:15:00.000Z",
        "patientId": "507f191e810c19729de860fc",
        "patientName": "Sarah Wilson",
        "courseId": "507f191e810c19729de860fd",
        "treatmentName": "Skin Whitening",
        "amountPaid": 2000,
        "clinicId": "507f191e810c19729de860f5",
        "clinicName": "City Clinic"
      },
      {
        "visitId": "507f1f77bcf86cd799439018",
        "visitTime": "2024-01-15T15:00:00.000Z",
        "patientId": "507f191e810c19729de860fe",
        "patientName": "David Miller",
        "courseId": "507f191e810c19729de860ff",
        "treatmentName": "Acne Treatment",
        "amountPaid": 1000,
        "clinicId": "507f191e810c19729de860ed",
        "clinicName": "Downtown Medical Center"
      },
      {
        "visitId": "507f1f77bcf86cd799439019",
        "visitTime": "2024-01-15T16:00:00.000Z",
        "patientId": "507f191e810c19729de860f1",
        "patientName": "Jane Smith",
        "courseId": "507f191e810c19729de860f2",
        "treatmentName": "Skin Whitening",
        "amountPaid": 1500,
        "clinicId": "507f191e810c19729de860f9",
        "clinicName": "Health Plus"
      },
      {
        "visitId": "507f1f77bcf86cd799439020",
        "visitTime": "2024-01-15T17:30:00.000Z",
        "patientId": "507f191e810c19729de860eb",
        "patientName": "John Doe",
        "courseId": "507f191e810c19729de860ec",
        "treatmentName": "Laser Hair Removal",
        "amountPaid": 1000,
        "clinicId": "507f191e810c19729de860ed",
        "clinicName": "Downtown Medical Center"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 10,
      "totalPages": 1
    }
  },
  "message": "Daily activities retrieved successfully",
  "timestamp": "2024-01-15T18:00:00.000Z"
}
```

### Response with Pagination (Page 2 example if there were more items)

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPatientsVisited": 8,
      "totalVisits": 15,
      "totalAmount": 18750,
      "averageAmountPerVisit": 1250,
      "visitStartTime": "2024-01-15T09:00:00.000Z",
      "visitEndTime": "2024-01-15T18:00:00.000Z",
      "totalHoursWorked": 9.0,
      "clinicNames": [
        "Downtown Medical Center",
        "City Clinic",
        "Health Plus"
      ]
    },
    "activities": [
      {
        "visitId": "507f1f77bcf86cd799439021",
        "visitTime": "2024-01-15T18:00:00.000Z",
        "patientId": "507f191e810c19729de860f7",
        "patientName": "Emily Davis",
        "courseId": "507f191e810c19729de860f8",
        "treatmentName": "Hair Treatment",
        "amountPaid": 1200,
        "clinicId": "507f191e810c19729de860f9",
        "clinicName": "Health Plus"
      }
    ],
    "pagination": {
      "page": 2,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  },
  "message": "Daily activities retrieved successfully",
  "timestamp": "2024-01-15T18:30:00.000Z"
}
```

### Response with No Visits for the Day

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPatientsVisited": 0,
      "totalVisits": 0,
      "totalAmount": 0,
      "averageAmountPerVisit": 0,
      "visitStartTime": null,
      "visitEndTime": null,
      "totalHoursWorked": 0,
      "clinicNames": []
    },
    "activities": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    }
  },
  "message": "No activities found for the specified date",
  "timestamp": "2024-01-16T10:00:00.000Z"
}
```

### Response with Visit Missing Clinic

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPatientsVisited": 1,
      "totalVisits": 1,
      "totalAmount": 1000,
      "averageAmountPerVisit": 1000,
      "visitStartTime": "2024-01-15T10:00:00.000Z",
      "visitEndTime": "2024-01-15T10:00:00.000Z",
      "totalHoursWorked": 0,
      "clinicNames": []
    },
    "activities": [
      {
        "visitId": "507f1f77bcf86cd799439025",
        "visitTime": "2024-01-15T10:00:00.000Z",
        "patientId": "507f191e810c19729de860eb",
        "patientName": "John Doe",
        "courseId": "507f191e810c19729de860ec",
        "treatmentName": "Laser Hair Removal",
        "amountPaid": 1000,
        "clinicId": null,
        "clinicName": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Daily activities retrieved successfully",
  "timestamp": "2024-01-15T11:00:00.000Z"
}
```

## Field Descriptions

### Summary Section
- **totalPatientsVisited**: Count of unique patients who had visits on this day
- **totalVisits**: Total number of visits (may include multiple visits by same patient)
- **totalAmount**: Sum of all payment amounts for the day (excluding refunded payments)
- **averageAmountPerVisit**: Calculated as totalAmount / totalVisits
- **visitStartTime**: Timestamp of the first visit of the day
- **visitEndTime**: Timestamp of the last visit of the day
- **totalHoursWorked**: Hours worked calculated as (visitEndTime - visitStartTime) / (1000 * 60 * 60)
- **clinicNames**: Array of unique clinic names where visits occurred (sorted alphabetically)

### Activity Item
- **visitId**: Unique identifier for the visit
- **visitTime**: Date and time of the visit
- **patientId**: Unique identifier for the patient
- **patientName**: Full name of the patient (firstName + lastName)
- **courseId**: Unique identifier for the treatment course
- **treatmentName**: Name of the treatment
- **amountPaid**: Total amount paid for this visit (sum of all non-refunded payments for the visit)
- **clinicId**: Unique identifier for the clinic (null if no clinic assigned)
- **clinicName**: Name of the clinic (null if no clinic assigned)

### Pagination
- **page**: Current page number
- **limit**: Number of items per page
- **total**: Total number of activities/visits
- **totalPages**: Total number of pages

## Notes

1. **Date Filtering**: The date parameter filters visits from 00:00:00 to 23:59:59 of the specified day in the server's timezone
2. **Payment Aggregation**: If a visit has multiple payments, all non-refunded payment amounts are summed for `amountPaid`
3. **Null Handling**: If clinic, payment, or treatment data is missing, corresponding fields will be null
4. **Sorting**: Activities are sorted by `visitTime` in ascending order (earliest first)
5. **Authentication**: All endpoints require authentication via JWT token
6. **Refunded Payments**: Refunded payments are excluded from `totalAmount` and individual `amountPaid` calculations
7. **Unique Patients**: `totalPatientsVisited` counts distinct patients, so if a patient has multiple visits, they're counted once

