# Dashboard Data Analysis & Visualization Guide

## Overview
This document outlines all possible dashboard metrics, KPIs, and visualizations that can be derived from the Doctor Management System entities.

---

## 1. FINANCIAL DASHBOARD

### 1.1 Revenue Metrics
**Data Sources:** `Payment`, `Visit`, `TreatmentCourse`

#### Key Metrics (Cards/Widgets):
- **Total Revenue** (All Time)
  - Sum of all `Payment.amount` where `refunded = false`
- **Revenue This Month**
  - Sum of `Payment.amount` where `paidAt` is in current month
- **Revenue This Year**
  - Sum of `Payment.amount` where `paidAt` is in current year
- **Average Revenue Per Visit**
  - Total revenue / Total visits
- **Average Revenue Per Patient**
  - Total revenue / Total active patients

#### Charts & Graphs:
1. **Revenue Trend Line Chart** (Time Series)
   - X-axis: Date (daily/weekly/monthly)
   - Y-axis: Revenue amount
   - Show: Daily/Weekly/Monthly revenue trends
   - Filters: Date range, Clinic

2. **Revenue by Payment Method** (Pie/Donut Chart)
   - Breakdown: Cash, Card, UPI, Bank Transfer, etc.
   - Data: Group `Payment.method` and sum amounts

3. **Revenue by Clinic** (Bar Chart)
   - X-axis: Clinic names
   - Y-axis: Total revenue
   - Compare performance across clinics

4. **Monthly Revenue Comparison** (Bar Chart)
   - X-axis: Months
   - Y-axis: Revenue
   - Compare current month vs previous months


### 1.2 Payment Status
**Data Sources:** `Payment`, `TreatmentCourse`

#### Key Metrics:
- **Outstanding Amount**
  - Sum of `TreatmentCourse.remaining` (totalCost - totalPaid) for active courses
- **Payment Completion Rate**
  - (Completed payments / Total payments) × 100



## 2. PATIENT DASHBOARD

### 2.1 Patient Overview
**Data Sources:** `Patient`

#### Key Metrics:
- **Total Patients**
  - Count of all patients where `isDeleted = false`
- **Active Patients**
  - Count where `isActive = true` and `isDeleted = false`
- **New Patients This Month**
  - Count where `createdAt` is in current month
- **New Patients This Year**
  - Count where `createdAt` is in current year
- **Average Visits Per Patient**
  - Total visits / Total patients
- **Patients with No Visits**
  - Count where `visitCount = 0`

#### Charts:
1. **Patient Growth Trend** (Line Chart)
   - X-axis: Date (monthly)
   - Y-axis: Cumulative patient count
   - Show growth over time

2. **New Patients Per Month** (Bar Chart)
   - Monthly new patient registrations
   - Identify trends

3. **Patient Status Distribution** (Pie Chart)
   - Active, Inactive, Deleted

4. **Patient Age Distribution** (Histogram/Bar Chart)
   - Age groups: 0-18, 19-30, 31-45, 46-60, 60+
   - Based on `Patient.age` or calculated from `Patient.dob`

5. **Patient Gender Distribution** (Pie Chart)
   - Male, Female, Other, Unknown
   - Based on `Patient.gender`

6. **Consultation Type Distribution** (Pie/Donut Chart)
   - One-time vs Treatment-plan patients

### 2.2 Patient Activity
**Data Sources:** `Patient`, `Visit`

#### Metrics:
- **Most Active Patients** (Top 10)
  - Sort by `Patient.visitCount`
- **Patients Needing Follow-up**
  - Patients with `lastVisitAt` older than X days
- **Patient Retention Rate**
  - (Patients with >1 visit / Total patients) × 100

#### Charts:
1. **Visit Frequency Distribution** (Bar Chart)
   - X-axis: Visit count ranges (0, 1-3, 4-10, 11-20, 20+)
   - Y-axis: Number of patients

2. **Last Visit Analysis** (Heatmap/Calendar)
   - Show when patients last visited
   - Identify inactive patients

3. **Patient Lifetime Value** (Bar Chart)
   - Top patients by total revenue generated
   - Combine `Patient` with `Payment` data

---

## 3. VISIT DASHBOARD

### 3.1 Visit Statistics
**Data Sources:** `Visit`

#### Key Metrics:
- **Total Visits** (All Time)
- **Visits This Month**
- **Visits This Week**
- **Visits Today**
- **Average Visits Per Day**
- **Average Visits Per Week**
- **Average Visits Per Month**

#### Charts:
1. **Visit Trend** (Line Chart)
   - Daily/Weekly/Monthly visit counts
   - Identify peak days/periods

2. **Visits by Day of Week** (Bar Chart)
   - Monday through Sunday
   - Identify busiest days

3. **Visits by Month** (Bar Chart)
   - Monthly visit comparison
   - Seasonal patterns

4. **Visits by Clinic** (Bar/Pie Chart)
   - Distribution across clinics
   - Performance comparison

5. **Visit Distribution by Time** (Heatmap)
   - Hour of day vs Day of week
   - Identify peak hours

### 3.2 Visit Analysis
**Data Sources:** `Visit`, `Patient`, `TreatmentCourse`

#### Metrics:
- **Average Visit Duration**
  - Calculate from visit timestamps (if available)
- **Visits with Prescriptions**
  - Count where `prescriptionId` exists
- **Visits with Media**
  - Count where `mediaIds.length > 0`
- **Average Billed Amount Per Visit**
  - Average of `Visit.billedAmount`

#### Charts:
1. **Visit Completion Rate** (Gauge/Progress Chart)
   - Completed visits / Total scheduled visits

2. **Visit Types Distribution** (Pie Chart)
   - First visit, Follow-up, Treatment visit

---

## 4. TREATMENT DASHBOARD

### 4.1 Treatment Overview
**Data Sources:** `Treatment`, `TreatmentCourse`

#### Key Metrics:
- **Total Treatments**
  - Count of active treatments (`isActive = true`)
- **Active Treatment Courses**
  - Count where `status = 'active'`
- **Completed Treatment Courses**
  - Count where `status = 'completed'`
- **Paused Treatment Courses**
  - Count where `status = 'paused'`
- **Cancelled Treatment Courses**
  - Count where `status = 'cancelled'`
- **Average Treatment Duration**
  - Average of `TreatmentCourse` duration (expectedEndDate - startDate)
- **Treatment Completion Rate**
  - (Completed courses / Total courses) × 100

#### Charts:
1. **Most Popular Treatments** (Horizontal Bar Chart)
   - Top 10 treatments by number of courses
   - Based on `TreatmentCourse.treatmentId` frequency

2. **Treatment Course Status Distribution** (Pie Chart)
   - Active, Paused, Completed, Cancelled

3. **Treatment Revenue** (Bar Chart)
   - Revenue generated per treatment type
   - Combine `Treatment` with `Payment` data

4. **Treatment Completion Timeline** (Line Chart)
   - Average time to complete each treatment
   - Compare expected vs actual duration

5. **Treatment Course Trends** (Stacked Area Chart)
   - New courses started over time
   - Completed courses over time
   - Show growth patterns

### 4.2 Treatment Performance
**Data Sources:** `TreatmentCourse`, `Visit`

#### Metrics:
- **Average Visits Per Treatment Course**
  - Average of `TreatmentCourse.visits.length`
- **Treatment Success Rate**
  - (Medically completed / Total courses) × 100
- **Average Cost Per Treatment**
  - Average of `TreatmentCourse.totalCost`

#### Charts:
1. **Treatment Duration Distribution** (Histogram)
   - Distribution of treatment course durations

2. **Treatment Revenue vs Cost** (Scatter Plot)
   - Revenue generated vs treatment cost
   - Identify profitable treatments

---

## 5. APPOINTMENT & CALENDAR DASHBOARD

### 5.1 Appointment Overview
**Data Sources:** `CalendarEntry`

#### Key Metrics:
- **Upcoming Appointments** (Next 7 days)
- **Appointments Today**
- **Appointments This Week**
- **Appointments This Month**
- **Appointment Completion Rate**
  - (Completed appointments / Total appointments) × 100
- **Average Appointments Per Day**
- **Appointment Utilization Rate**
  - (Scheduled appointments / Available slots) × 100

#### Charts:
1. **Appointment Calendar View** (Calendar Widget)
   - Daily appointment count
   - Color-coded by density

2. **Appointment Status** (Pie Chart)
   - Completed vs Pending

3. **Appointments by Clinic** (Bar Chart)
   - Distribution across clinics

4. **Appointment Trends** (Line Chart)
   - Daily/Weekly appointment counts
   - Identify booking patterns

5. **Peak Appointment Hours** (Bar Chart)
   - Most popular appointment times
   - Based on `Appointment.startTime`

6. **Appointment No-Show Rate** (Gauge Chart)
   - Track missed appointments

### 5.2 Schedule Analysis
**Data Sources:** `CalendarEntry`, `Clinic`

#### Metrics:
- **Clinic Hours Utilization**
  - (Scheduled time / Available time) × 100
- **Average Appointment Duration**
  - Calculate from appointment time slots
- **Busiest Days**
  - Days with most appointments

#### Charts:
1. **Schedule Heatmap** (Heatmap)
   - Day of week vs Hour of day
   - Show appointment density

2. **Clinic Schedule Comparison** (Multi-line Chart)
   - Compare schedules across clinics

---

## 6. PRESCRIPTION DASHBOARD

### 6.1 Prescription Statistics
**Data Sources:** `Prescription`

#### Key Metrics:
- **Total Prescriptions**
- **Prescriptions This Month**
- **Average Prescriptions Per Visit**
- **Most Prescribed Medicines** (Top 10)
  - Based on `PrescriptionItem.medicineName` frequency
- **Common Diagnoses** (Top 10)
  - Based on `Prescription.diagnosis` frequency

#### Charts:
1. **Prescription Trends** (Line Chart)
   - Monthly prescription counts

2. **Medicine Prescription Frequency** (Horizontal Bar Chart)
   - Top prescribed medicines

3. **Diagnosis Distribution** (Word Cloud/Bar Chart)
   - Most common diagnoses

4. **Prescription Items Distribution** (Pie Chart)
   - Average items per prescription

---

## 7. CLINIC DASHBOARD

### 7.1 Clinic Performance
**Data Sources:** `Clinic`, `Visit`, `Payment`, `Patient`

#### Key Metrics:
- **Total Clinics**
- **Active Clinics**
- **Patients Per Clinic**
- **Revenue Per Clinic**
- **Visits Per Clinic**
- **Average Revenue Per Clinic**

#### Charts:
1. **Clinic Performance Comparison** (Multi-metric Bar Chart)
   - Revenue, Visits, Patients per clinic
   - Side-by-side comparison

2. **Clinic Utilization** (Gauge Chart)
   - Working hours utilization per clinic

3. **Clinic Growth** (Line Chart)
   - Patient growth per clinic over time

4. **Geographic Distribution** (Map/Bar Chart)
   - If location data available (`Clinic.city`, `Clinic.state`)

---

## 8. STAFF DASHBOARD

### 8.1 Staff Overview
**Data Sources:** `Staff`

#### Key Metrics:
- **Total Staff Members**
- **Active Staff**
- **Staff Per Clinic**
- **Staff Utilization**

#### Charts:
1. **Staff Distribution by Clinic** (Bar Chart)
   - Staff count per clinic

2. **Staff Activity** (Table/List)
   - Staff performance metrics (if tracked)

---

## 9. MEDIA DASHBOARD

### 9.1 Media Statistics
**Data Sources:** `Media`

#### Key Metrics:
- **Total Media Files**
- **Media by Type** (Image, X-ray, Report, Other)
- **Total Storage Used**
  - Sum of `Media.size`
- **Average File Size**
- **Media Per Patient**
- **Media Per Visit**

#### Charts:
1. **Media Type Distribution** (Pie Chart)
   - Image, X-ray, Report, Other

2. **Media Upload Trends** (Line Chart)
   - Media uploads over time

3. **Storage Usage** (Bar Chart)
   - Storage per media type

---

## 10. TIME-BASED ANALYTICS

### 10.1 Trends & Patterns
**Data Sources:** All entities with `createdAt`, `updatedAt`

#### Charts:
1. **Activity Timeline** (Timeline Chart)
   - Combined view of visits, payments, appointments over time

2. **Growth Metrics** (Multi-line Chart)
   - Patients, Visits, Revenue growth over time
   - Compare growth rates

3. **Seasonal Patterns** (Line Chart)
   - Identify seasonal trends in visits/revenue

4. **Year-over-Year Comparison** (Bar Chart)
   - Compare current year vs previous year

---

## 11. OPERATIONAL METRICS

### 11.1 Efficiency Metrics
**Data Sources:** Multiple entities

#### Key Metrics:
- **Patient Retention Rate**
- **Treatment Completion Rate**
- **Payment Collection Rate**
- **Appointment Show-up Rate**
- **Average Time Between Visits**
- **Average Treatment Duration**

#### Charts:
1. **KPI Dashboard** (Gauge Cards)
   - Visual representation of key metrics

2. **Efficiency Trends** (Line Chart)
   - Track efficiency metrics over time

---

## 12. COMPARATIVE ANALYTICS

### 12.1 Comparison Charts
**Data Sources:** Multiple entities

#### Charts:
1. **This Month vs Last Month** (Comparison Cards)
   - Revenue, Visits, Patients, etc.

2. **This Year vs Last Year** (Bar Chart)
   - Year-over-year comparison

3. **Clinic Comparison** (Radar Chart)
   - Multi-metric comparison across clinics

4. **Treatment Comparison** (Bar Chart)
   - Compare treatments by various metrics

---

## 13. PREDICTIVE ANALYTICS

### 13.1 Forecasting
**Data Sources:** Historical data

#### Charts:
1. **Revenue Forecast** (Line Chart with Projection)
   - Predict future revenue based on trends

2. **Patient Growth Forecast** (Line Chart)
   - Predict patient growth

3. **Visit Forecast** (Line Chart)
   - Predict future visit patterns

---

## 14. DASHBOARD LAYOUT SUGGESTIONS

### 14.1 Main Dashboard (Overview)
**Top Row (Key Metrics Cards):**
- Total Revenue (This Month)
- Total Patients
- Total Visits (This Month)
- Active Treatment Courses
- Upcoming Appointments (Next 7 days)

**Second Row (Charts):**
- Revenue Trend (Line Chart - Last 6 months)
- Patient Growth (Line Chart - Last 12 months)
- Visit Distribution by Day (Bar Chart)

**Third Row:**
- Treatment Status Distribution (Pie Chart)
- Top 5 Treatments (Horizontal Bar Chart)
- Appointment Calendar (Calendar Widget)

### 14.2 Financial Dashboard
- Revenue metrics cards
- Revenue trend chart
- Payment method distribution
- Revenue by clinic
- Outstanding amounts table
- Refund analysis

### 14.3 Patient Dashboard
- Patient metrics cards
- Patient growth chart
- Demographics (Age, Gender)
- Patient activity heatmap
- Top patients by visits/revenue

### 14.4 Treatment Dashboard
- Treatment course metrics
- Treatment status distribution
- Most popular treatments
- Treatment completion rates
- Treatment revenue analysis

### 14.5 Appointment Dashboard
- Appointment metrics
- Calendar view
- Schedule heatmap
- Appointment trends
- Peak hours analysis

---

## 15. DATA AGGREGATION QUERIES NEEDED

### 15.1 Time-based Aggregations
- Daily aggregations (visits, payments, patients)
- Weekly aggregations
- Monthly aggregations
- Yearly aggregations

### 15.2 Grouped Aggregations
- By Clinic
- By Treatment
- By Patient
- By Payment Method
- By Gender
- By Age Group

### 15.3 Calculated Fields
- Remaining amount (totalCost - totalPaid)
- Visit frequency (visits / time period)
- Average revenue per patient
- Treatment completion rate
- Payment collection rate

---

## 16. FILTERS & INTERACTIONS

### 16.1 Date Range Filters
- Today, This Week, This Month, This Year
- Custom date range
- Last 7 days, Last 30 days, Last 90 days
- Year-to-date

### 16.2 Clinic Filters
- All Clinics
- Specific Clinic
- Multiple Clinics

### 16.3 Treatment Filters
- All Treatments
- Specific Treatment
- Treatment Category (if available)

### 16.4 Patient Filters
- All Patients
- Active Only
- By Gender
- By Age Group
- By Consultation Type

---

## 17. REAL-TIME METRICS

### 17.1 Live Updates
- Today's visits count
- Today's revenue
- Today's appointments
- New patients today
- Pending payments

---

## 18. EXPORT CAPABILITIES

### 18.1 Export Options
- Export charts as images (PNG, SVG)
- Export data as CSV/Excel
- Generate PDF reports
- Scheduled email reports

---

## 19. RECOMMENDED CHART LIBRARIES

### 19.1 Frontend Options
- **Chart.js** - Simple, lightweight
- **Recharts** - React-based, declarative
- **D3.js** - Highly customizable
- **ApexCharts** - Modern, interactive
- **Plotly.js** - Scientific charts
- **ECharts** - Powerful, feature-rich

### 19.2 Dashboard Frameworks
- **React Dashboard** - Custom React components
- **Material-UI Dashboard** - Material Design
- **Ant Design Charts** - Enterprise-grade
- **Shadcn/ui** - Modern, customizable

---

## 20. API ENDPOINTS NEEDED

### 20.1 Analytics Endpoints
```
GET /analytics/overview
GET /analytics/revenue?startDate=&endDate=&clinicId=
GET /analytics/patients?startDate=&endDate=
GET /analytics/visits?startDate=&endDate=&clinicId=
GET /analytics/treatments?startDate=&endDate=
GET /analytics/appointments?startDate=&endDate=
GET /analytics/prescriptions?startDate=&endDate=
GET /analytics/clinic-performance?clinicId=
GET /analytics/trends?metric=&period=
```

### 20.2 Data Aggregation Endpoints
```
GET /analytics/revenue-by-method
GET /analytics/revenue-by-clinic
GET /analytics/patient-demographics
GET /analytics/treatment-popularity
GET /analytics/appointment-patterns
```

---

## SUMMARY

This dashboard system provides comprehensive insights into:
- **Financial Performance**: Revenue, payments, outstanding amounts
- **Patient Management**: Growth, demographics, activity
- **Operational Efficiency**: Visits, appointments, treatments
- **Clinic Performance**: Multi-clinic comparison
- **Treatment Analytics**: Popularity, completion rates
- **Predictive Insights**: Forecasting and trends

All metrics can be visualized using various chart types (line, bar, pie, heatmap, etc.) and filtered by date range, clinic, treatment, and other dimensions.

