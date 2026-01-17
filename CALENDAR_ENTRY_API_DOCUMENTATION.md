# Calendar Entry API Documentation

## Overview

The Calendar Entry API allows doctors to schedule clinic visits with patient appointments. Each calendar entry represents one clinic visit on a specific date with a time range, and can contain multiple patient appointments.

## Base URL

All endpoints are prefixed with `/calendar-entry`

## Authentication

All endpoints require authentication via `authMiddleware()` and are restricted to doctors only (`doctorOnly` middleware).

## Endpoints

### 1. Create Calendar Entry

**POST** `/calendar-entry`

Creates a new calendar entry (clinic visit). Appointments can be added separately using the appointment endpoints.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "clinicId": "ABC",
  "startTime": "09:00",
  "endTime": "12:00"
}
```

**Note:** `appointments` field is optional. You can create a calendar entry without appointments and add them later using the appointment endpoints.

**Validation Rules:**
- `date`: Required, format `YYYY-MM-DD`, must be today or future date (past dates not allowed)
- `clinicId`: Required, must exist and belong to the doctor
- `startTime`: Required, format `HH:mm` (24-hour), must be before `endTime`
- `endTime`: Required, format `HH:mm` (24-hour), must be after `startTime`
- `appointments`: Optional array (can be empty or omitted)

**Conflict Prevention:**
- Clinic visit time ranges cannot overlap with existing entries on the same date

**Response:**
- **201 Created** - Success
```json
{
  "success": true,
  "message": "Resource created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- **400 Bad Request** - Validation error (invalid format, past date, time conflicts, etc.)
- **404 Not Found** - Clinic, patient, or treatment not found
- **409 Conflict** - Time overlap detected

---

### 2. Add Appointment to Calendar Entry

**POST** `/calendar-entry/:id/appointments`

Adds a new appointment to an existing calendar entry.

**URL Parameters:**
- `id`: Calendar entry ID

**Request Body:**
```json
{
  "patientId": "patient123",
  "treatmentId": "treatment456",
  "startTime": "09:30",
  "endTime": "10:00",
  "notes": "Follow-up appointment",
  "completed": false
}
```

**Validation Rules:**
- `patientId`: Required, must exist and belong to the doctor
- `treatmentId`: Required, must exist and belong to the doctor
- `startTime`: Required, format `HH:mm`, must be within clinic hours (`startTime >= clinic.startTime && endTime <= clinic.endTime`)
- `endTime`: Required, format `HH:mm`, must be after `startTime` and within clinic hours
- `notes`: Optional string
- `completed`: Optional boolean, defaults to `false`

**Conflict Prevention:**
- Appointment time cannot overlap with existing appointments in the same calendar entry
- Appointments can be back-to-back (e.g., 09:00-10:00 and 10:00-11:00 is allowed)

**Response:**
- **201 Created** - Success

**Error Responses:**
- **400 Bad Request** - Validation error
- **404 Not Found** - Calendar entry, patient, or treatment not found
- **409 Conflict** - Appointment time overlaps with existing appointment

---

### 3. Get Appointments for Calendar Entry

**GET** `/calendar-entry/:id/appointments`

Retrieves all appointments for a specific calendar entry.

**URL Parameters:**
- `id`: Calendar entry ID

**Response:**
- **200 OK** - Returns the full calendar entry with all appointments (same structure as GET by ID)

---

### 4. Update Appointment

**PATCH** `/calendar-entry/:id/appointments/:appointmentIndex`

Updates an existing appointment in a calendar entry.

**URL Parameters:**
- `id`: Calendar entry ID
- `appointmentIndex`: Index of the appointment (0-based: 0, 1, 2, ...)

**Request Body:**
```json
{
  "patientId": "patient123",
  "treatmentId": "treatment456",
  "startTime": "09:45",
  "endTime": "10:15",
  "notes": "Updated notes",
  "completed": true
}
```

**Validation Rules:**
- Same as Add Appointment endpoint
- All fields are required in the request body

**Response:**
- **200 OK** - Success

**Error Responses:**
- **400 Bad Request** - Validation error
- **404 Not Found** - Calendar entry or appointment index not found
- **409 Conflict** - Appointment time overlaps with another appointment

---

### 5. Delete Appointment

**DELETE** `/calendar-entry/:id/appointments/:appointmentIndex`

Deletes an appointment from a calendar entry.

**URL Parameters:**
- `id`: Calendar entry ID
- `appointmentIndex`: Index of the appointment (0-based: 0, 1, 2, ...)

**Response:**
- **200 OK** - Success

**Error Responses:**
- **404 Not Found** - Calendar entry or appointment index not found

---

### 6. Get Calendar Entries

**GET** `/calendar-entry`

Retrieves calendar entries. Supports querying by single date or date range.

**Query Parameters:**
- `date` (optional): Single date in format `YYYY-MM-DD`
- `startDate` (optional): Start date for range in format `YYYY-MM-DD`
- `endDate` (optional): End date for range in format `YYYY-MM-DD`

**Note:** Either provide `date` OR both `startDate` and `endDate`. Cannot mix both.

**Examples:**
- Get entries for a specific date: `GET /calendar-entry?date=2024-01-15`
- Get entries for a date range: `GET /calendar-entry?startDate=2024-01-01&endDate=2024-01-31`

**Response:**
- **200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "entry123",
      "doctorId": "doctor456",
      "date": "2024-01-15T00:00:00.000Z",
      "clinicId": "ABC",
      "startTime": "09:00",
      "endTime": "12:00",
      "appointments": [
        {
          "patientId": "patient123",
          "treatmentId": "treatment456",
          "startTime": "09:30",
          "endTime": "10:00",
          "notes": "Follow-up appointment",
          "completed": false
        }
      ],
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T10:00:00.000Z"
    }
  ],
  "message": "Resource retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- **400 Bad Request** - Invalid query parameters (missing date/range, invalid format)

---

### 7. Get Single Calendar Entry

**GET** `/calendar-entry/:id`

Retrieves a specific calendar entry by ID.

**Response:**
- **200 OK** - Same structure as array item in GET all endpoint

**Error Responses:**
- **404 Not Found** - Entry not found or doesn't belong to doctor

---

### 8. Update Calendar Entry

**PATCH** `/calendar-entry/:id`

Updates an existing calendar entry. All fields are optional (partial update).

**Request Body:**
```json
{
  "date": "2024-01-16",
  "clinicId": "ABC",
  "startTime": "10:00",
  "endTime": "13:00",
  "appointments": [
    { 
      "patientId": "patient123",
      "treatmentId": "treatment456",
      "startTime": "10:30",
      "endTime": "11:00",
      "notes": "Updated notes",
      "completed": true
    }
  ]
}
```

**Validation Rules:**
- All fields are optional (partial update)
- If updating date, cannot set to past date
- If updating time ranges, must check for overlaps (excluding current entry)
- **Note:** When updating clinic visit time range, existing appointments are not automatically validated. You may need to adjust appointments separately if they fall outside the new time range.

**Response:**
- **200 OK** - Success
```json
{
  "success": true,
  "message": "Resource updated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- **400 Bad Request** - Validation error
- **404 Not Found** - Entry not found
- **409 Conflict** - Time overlap detected

---

### 9. Delete Calendar Entry

**DELETE** `/calendar-entry/:id`

Deletes a calendar entry.

**Response:**
- **200 OK** - Success
```json
{
  "success": true,
  "message": "Resource deleted successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- **404 Not Found** - Entry not found or doesn't belong to doctor

---

## Important Notes for Frontend

### 1. Time Format
- All times use 24-hour format: `HH:mm` (e.g., `09:00`, `17:30`)
- Times are strings, not Date objects

### 2. Date Format
- Dates use ISO format: `YYYY-MM-DD` (e.g., `2024-01-15`)
- In responses, dates are returned as ISO Date strings

### 3. Past Date Prevention
- Cannot create or update entries for past dates
- Only today and future dates are allowed

### 4. Time Conflict Detection
- **Clinic Visit Level**: Cannot have overlapping clinic visits on the same date
  - Example: If entry exists 09:00-12:00, cannot create 11:00-14:00
- **Appointment Level**: Appointments within same clinic visit cannot overlap
  - Example: If appointment exists 09:30-10:00, cannot add 09:45-10:30
  - Back-to-back is allowed: 09:00-10:00 and 10:00-11:00 is OK

### 5. Appointment Constraints
- Appointment times must be completely within clinic visit hours
  - If clinic visit is 09:00-12:00, appointments must be between 09:00 and 12:00
- Each appointment must have valid time range (endTime > startTime)

### 6. Completed Status
- `completed` field defaults to `false` when creating appointments
- Can be updated to `true` when marking appointments as completed
- Used to track appointment status (pending/completed)

### 7. Error Handling
- All validation errors return **400 Bad Request** with descriptive messages
- Resource not found errors return **404 Not Found**
- Conflict errors (overlaps) return **409 Conflict**

### 8. Query Examples

**Get today's entries:**
```
GET /calendar-entry?date=2024-01-15
```

**Get this month's entries:**
```
GET /calendar-entry?startDate=2024-01-01&endDate=2024-01-31
```

**Get next week's entries:**
```
GET /calendar-entry?startDate=2024-01-15&endDate=2024-01-21
```

### 9. Typical Workflow

1. **Create Calendar Entry**: Doctor schedules a clinic visit (without appointments initially)
2. **Add Appointments**: Add patient appointments to the calendar entry
3. **View Calendar**: Query entries by date or date range
4. **Update Appointments**: Modify individual appointments (time, patient, treatment, notes, completed status)
5. **Delete Appointments**: Remove appointments as needed
6. **Update Entry**: Modify clinic visit time or date (appointments can be adjusted separately)
7. **Delete Entry**: Remove calendar entry if needed (all appointments are deleted with the entry)

### 10. Response Structure

All successful responses follow this structure:
```json
{
  "success": true,
  "data": <response_data>,
  "message": "Success message",
  "timestamp": "ISO timestamp"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  },
  "timestamp": "ISO timestamp"
}
```

---

## Example Frontend Implementation

### Create Calendar Entry
```javascript
const createCalendarEntry = async (entryData) => {
  const response = await fetch('/calendar-entry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      date: '2024-01-15',
      clinicId: 'ABC',
      startTime: '09:00',
      endTime: '12:00'
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return await response.json();
};
```

### Add Appointment to Calendar Entry
```javascript
const addAppointment = async (entryId, appointment) => {
  const response = await fetch(`/calendar-entry/${entryId}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      patientId: 'patient123',
      treatmentId: 'treatment456',
      startTime: '09:30',
      endTime: '10:00',
      notes: 'Follow-up',
      completed: false
    })
  });
  
  return await response.json();
};
```

### Update Appointment
```javascript
const updateAppointment = async (entryId, appointmentIndex, appointment) => {
  const response = await fetch(`/calendar-entry/${entryId}/appointments/${appointmentIndex}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      patientId: 'patient123',
      treatmentId: 'treatment456',
      startTime: '09:45',
      endTime: '10:15',
      notes: 'Updated notes',
      completed: true
    })
  });
  
  return await response.json();
};
```

### Delete Appointment
```javascript
const deleteAppointment = async (entryId, appointmentIndex) => {
  const response = await fetch(`/calendar-entry/${entryId}/appointments/${appointmentIndex}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

### Get Calendar Entries for Date Range
```javascript
const getCalendarEntries = async (startDate, endDate) => {
  const params = new URLSearchParams({
    startDate: startDate,
    endDate: endDate
  });
  
  const response = await fetch(`/calendar-entry?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

### Mark Appointment as Completed
```javascript
const markAppointmentCompleted = async (entryId, appointmentIndex) => {
  // First get the appointment
  const entryResponse = await fetch(`/calendar-entry/${entryId}/appointments`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const entry = await entryResponse.json();
  const appointment = entry.data.appointments[appointmentIndex];
  
  // Update the appointment's completed status
  const updateResponse = await fetch(`/calendar-entry/${entryId}/appointments/${appointmentIndex}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...appointment,
      completed: true
    })
  });
  
  return await updateResponse.json();
};
```

---

## Testing Checklist

### Calendar Entry Operations
- [ ] Create entry with valid data (without appointments)
- [ ] Create entry with past date (should fail)
- [ ] Create entry with overlapping clinic visit times (should fail)
- [ ] Get entries by single date
- [ ] Get entries by date range
- [ ] Update entry with valid data
- [ ] Update entry to past date (should fail)
- [ ] Delete entry

### Appointment Operations
- [ ] Add appointment to calendar entry
- [ ] Add appointment with overlapping time (should fail)
- [ ] Add appointment outside clinic hours (should fail)
- [ ] Get appointments for calendar entry
- [ ] Update appointment
- [ ] Update appointment with overlapping time (should fail)
- [ ] Mark appointment as completed
- [ ] Delete appointment
- [ ] Delete appointment with invalid index (should fail)

### Error Handling
- [ ] Handle 404 errors (entry not found, appointment index not found)
- [ ] Handle 409 conflict errors (time overlaps)
- [ ] Handle 400 validation errors (invalid format, past dates, etc.)

