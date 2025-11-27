# Sample Visit Response with Prescription and Media

## Request Examples

### Without include parameter (default)
```
GET /api/visits?page=1&limit=10
```

### With prescription only
```
GET /api/visits?page=1&limit=10&include=prescription
```

### With media only
```
GET /api/visits?page=1&limit=10&include=media
```

### With both prescription and media
```
GET /api/visits?page=1&limit=10&include=prescription,media
```

## Response Examples

### Response without include parameter
```json
{
  "success": true,
  "data": {
    "visits": [
      {
        "id": "507f1f77bcf86cd799439011",
        "doctorId": "507f191e810c19729de860ea",
        "patientId": "507f191e810c19729de860eb",
        "courseId": "507f191e810c19729de860ec",
        "clinicId": "507f191e810c19729de860ed",
        "visitDate": "2024-01-15T10:30:00.000Z",
        "notes": "Patient complained of headache",
        "billedAmount": 500,
        "mediaIds": ["507f191e810c19729de860ee", "507f191e810c19729de860ef"],
        "prescriptionId": "507f191e810c19729de860f0",
        "isDeleted": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Response with prescription included
```json
{
  "success": true,
  "data": {
    "visits": [
      {
        "id": "507f1f77bcf86cd799439011",
        "doctorId": "507f191e810c19729de860ea",
        "patientId": "507f191e810c19729de860eb",
        "courseId": "507f191e810c19729de860ec",
        "clinicId": "507f191e810c19729de860ed",
        "visitDate": "2024-01-15T10:30:00.000Z",
        "notes": "Patient complained of headache",
        "billedAmount": 500,
        "mediaIds": ["507f191e810c19729de860ee", "507f191e810c19729de860ef"],
        "prescriptionId": "507f191e810c19729de860f0",
        "prescription": {
          "id": "507f191e810c19729de860f0",
          "doctorId": "507f191e810c19729de860ea",
          "patientId": "507f191e810c19729de860eb",
          "visitId": "507f1f77bcf86cd799439011",
          "clinicId": "507f191e810c19729de860ed",
          "diagnosis": ["Migraine", "Tension headache"],
          "items": [
            {
              "medicineName": "Paracetamol",
              "form": "Tablet",
              "strength": "500mg",
              "dosage": "1 tablet",
              "frequency": "Twice daily",
              "duration": "5 days",
              "notes": "Take after meals"
            },
            {
              "medicineName": "Ibuprofen",
              "form": "Tablet",
              "strength": "400mg",
              "dosage": "1 tablet",
              "frequency": "As needed",
              "duration": "3 days"
            }
          ],
          "notes": "Follow up if symptoms persist",
          "createdAt": "2024-01-15T10:35:00.000Z",
          "updatedAt": "2024-01-15T10:35:00.000Z"
        },
        "isDeleted": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Response with media included
```json
{
  "success": true,
  "data": {
    "visits": [
      {
        "id": "507f1f77bcf86cd799439011",
        "doctorId": "507f191e810c19729de860ea",
        "patientId": "507f191e810c19729de860eb",
        "courseId": "507f191e810c19729de860ec",
        "clinicId": "507f191e810c19729de860ed",
        "visitDate": "2024-01-15T10:30:00.000Z",
        "notes": "Patient complained of headache",
        "billedAmount": 500,
        "mediaIds": ["507f191e810c19729de860ee", "507f191e810c19729de860ef"],
        "prescriptionId": "507f191e810c19729de860f0",
        "media": [
          {
            "id": "507f191e810c19729de860ee",
            "doctorId": "507f191e810c19729de860ea",
            "patientId": "507f191e810c19729de860eb",
            "courseId": "507f191e810c19729de860ec",
            "visitId": "507f1f77bcf86cd799439011",
            "clinicId": "507f191e810c19729de860ed",
            "url": "https://s3.amazonaws.com/bucket/xray-image-1.jpg",
            "filename": "xray-image-1.jpg",
            "mimeType": "image/jpeg",
            "size": 2048576,
            "type": "xray",
            "notes": "Chest X-ray",
            "isDeleted": false,
            "createdAt": "2024-01-15T10:32:00.000Z",
            "updatedAt": "2024-01-15T10:32:00.000Z"
          },
          {
            "id": "507f191e810c19729de860ef",
            "doctorId": "507f191e810c19729de860ea",
            "patientId": "507f191e810c19729de860eb",
            "courseId": "507f191e810c19729de860ec",
            "visitId": "507f1f77bcf86cd799439011",
            "clinicId": "507f191e810c19729de860ed",
            "url": "https://s3.amazonaws.com/bucket/lab-report-1.pdf",
            "filename": "lab-report-1.pdf",
            "mimeType": "application/pdf",
            "size": 512000,
            "type": "report",
            "notes": "Blood test results",
            "isDeleted": false,
            "createdAt": "2024-01-15T10:33:00.000Z",
            "updatedAt": "2024-01-15T10:33:00.000Z"
          }
        ],
        "isDeleted": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Response with both prescription and media included
```json
{
  "success": true,
  "data": {
    "visits": [
      {
        "id": "507f1f77bcf86cd799439011",
        "doctorId": "507f191e810c19729de860ea",
        "patientId": "507f191e810c19729de860eb",
        "courseId": "507f191e810c19729de860ec",
        "clinicId": "507f191e810c19729de860ed",
        "visitDate": "2024-01-15T10:30:00.000Z",
        "notes": "Patient complained of headache",
        "billedAmount": 500,
        "mediaIds": ["507f191e810c19729de860ee", "507f191e810c19729de860ef"],
        "prescriptionId": "507f191e810c19729de860f0",
        "prescription": {
          "id": "507f191e810c19729de860f0",
          "doctorId": "507f191e810c19729de860ea",
          "patientId": "507f191e810c19729de860eb",
          "visitId": "507f1f77bcf86cd799439011",
          "clinicId": "507f191e810c19729de860ed",
          "diagnosis": ["Migraine", "Tension headache"],
          "items": [
            {
              "medicineName": "Paracetamol",
              "form": "Tablet",
              "strength": "500mg",
              "dosage": "1 tablet",
              "frequency": "Twice daily",
              "duration": "5 days",
              "notes": "Take after meals"
            }
          ],
          "notes": "Follow up if symptoms persist",
          "createdAt": "2024-01-15T10:35:00.000Z",
          "updatedAt": "2024-01-15T10:35:00.000Z"
        },
        "media": [
          {
            "id": "507f191e810c19729de860ee",
            "doctorId": "507f191e810c19729de860ea",
            "patientId": "507f191e810c19729de860eb",
            "courseId": "507f191e810c19729de860ec",
            "visitId": "507f1f77bcf86cd799439011",
            "clinicId": "507f191e810c19729de860ed",
            "url": "https://s3.amazonaws.com/bucket/xray-image-1.jpg",
            "filename": "xray-image-1.jpg",
            "mimeType": "image/jpeg",
            "size": 2048576,
            "type": "xray",
            "notes": "Chest X-ray",
            "isDeleted": false,
            "createdAt": "2024-01-15T10:32:00.000Z",
            "updatedAt": "2024-01-15T10:32:00.000Z"
          }
        ],
        "isDeleted": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Response when prescription is not found (returns null)
```json
{
  "success": true,
  "data": {
    "visits": [
      {
        "id": "507f1f77bcf86cd799439011",
        "doctorId": "507f191e810c19729de860ea",
        "patientId": "507f191e810c19729de860eb",
        "courseId": "507f191e810c19729de860ec",
        "visitDate": "2024-01-15T10:30:00.000Z",
        "notes": "Patient complained of headache",
        "billedAmount": 500,
        "mediaIds": [],
        "prescriptionId": "507f191e810c19729de860f0",
        "prescription": null,
        "isDeleted": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Response when media is not found (returns empty array)
```json
{
  "success": true,
  "data": {
    "visits": [
      {
        "id": "507f1f77bcf86cd799439011",
        "doctorId": "507f191e810c19729de860ea",
        "patientId": "507f191e810c19729de860eb",
        "courseId": "507f191e810c19729de860ec",
        "visitDate": "2024-01-15T10:30:00.000Z",
        "notes": "Patient complained of headache",
        "billedAmount": 500,
        "mediaIds": [],
        "prescriptionId": null,
        "media": [],
        "isDeleted": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Notes

- The `include` parameter accepts comma-separated values: `prescription`, `media`, or both `prescription,media`
- If `prescription` is included but not found, the `prescription` field will be `null`
- If `media` is included but no media found for the visit, the `media` field will be an empty array `[]`
- Only media where `visitId` matches the visit ID and `isDeleted` is `false` are included
- The notes search functionality is already implemented and works with the `notes` query parameter (case-insensitive partial match)

