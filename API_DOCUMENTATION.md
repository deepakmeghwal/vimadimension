# Backend API Documentation

Complete reference for all backend REST API endpoints in the ArchiEase application.

## Table of Contents

1. [Authentication](#authentication)
2. [Projects](#projects)
3. [Phases](#phases)
4. [Resource Assignments](#resource-assignments)
5. [Tasks](#tasks)
6. [Clients](#clients)
7. [Client Contacts](#client-contacts)
8. [Invoices](#invoices)
9. [Users & Profiles](#users--profiles)
10. [Admin Operations](#admin-operations)
11. [Financial Health](#financial-health)
12. [File Management](#file-management)
13. [Time Logs](#time-logs)
14. [Other Endpoints](#other-endpoints)

---

## Authentication

Base Path: `/api/auth`

### POST `/api/auth/login`
Authenticate user and create session.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "username": "user@example.com",
  "sessionId": "session-id"
}
```

**Authorization:** None (public endpoint)

---

### GET `/api/auth/status`
Get current authentication status and user info.

**Response:**
```json
{
  "id": 1,
  "username": "user@example.com",
  "name": "John Doe",
  "email": "user@example.com",
  "enabled": true,
  "organizationId": 1,
  "organizationName": "My Organization",
  "authorities": [...],
  "roles": [...]
}
```

**Authorization:** Authenticated users

---

### POST `/api/auth/logout`
Logout current user and invalidate session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Authorization:** Authenticated users

---

### POST `/api/auth/forgot-password`
Request password reset link via email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

**Authorization:** None (public endpoint)

---

### GET `/api/auth/validate-reset-token`
Validate a password reset token.

**Query Parameters:**
- `token` (required): Reset token from email

**Response:**
```json
{
  "valid": true,
  "email": "user@example.com"
}
```

**Authorization:** None (public endpoint)

---

### POST `/api/auth/reset-password`
Reset password using token.

**Request Body:**
```json
{
  "token": "reset-token",
  "newPassword": "newpassword",
  "confirmPassword": "newpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Authorization:** None (public endpoint)

---

## Projects

Base Path: `/api/projects`

### GET `/api/projects`
List all projects for the authenticated user's organization.

**Response:** Array of Project objects

**Authorization:** Authenticated users

---

### GET `/api/projects/health`
Health check endpoint for projects service.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "projectCount": 10,
  "timestamp": 1234567890
}
```

**Authorization:** None

---

### GET `/api/projects/{projectId}`
Get project details by ID.

**Path Parameters:**
- `projectId` (required): Project ID

**Response:** Project object with full details

**Authorization:** Authenticated users (must have access to project)

---

### POST `/api/projects`
Create a new project.

**Request Body:**
```json
{
  "name": "Project Name",
  "clientId": 1,
  "startDate": "2024-01-01",
  "estimatedEndDate": "2024-12-31",
  "location": "Location",
  "chargeType": "REGULAR",
  "status": "ACTIVE",
  "projectStage": "CONCEPT",
  "description": "Description",
  "budget": 100000,
  "priority": "MEDIUM"
}
```

**Response:** Created Project object

**Authorization:** ADMIN or MANAGER

---

### PUT `/api/projects/{projectId}`
Update an existing project.

**Path Parameters:**
- `projectId` (required): Project ID

**Request Body:** Same as POST (all fields optional)

**Response:** Updated Project object

**Authorization:** ADMIN or MANAGER

---

### DELETE `/api/projects/{projectId}`
Delete a project.

**Path Parameters:**
- `projectId` (required): Project ID

**Response:** 200 OK

**Authorization:** ADMIN only

---

### GET `/api/projects/{projectId}/phases`
Get all phases for a project.

**Path Parameters:**
- `projectId` (required): Project ID

**Response:** Array of Phase objects

**Authorization:** Authenticated users

---

### GET `/api/projects/{projectId}/tasks`
Get all tasks for a project with pagination.

**Path Parameters:**
- `projectId` (required): Project ID

**Query Parameters:**
- `page` (default: 0): Page number
- `size` (default: 12): Page size

**Response:**
```json
{
  "tasks": [...],
  "currentPage": 0,
  "totalItems": 50,
  "totalPages": 5,
  "pageSize": 12,
  "hasNext": true,
  "hasPrevious": false
}
```

**Authorization:** Authenticated users

---

### GET `/api/projects/{projectId}/team`
Get all team members assigned to a project.

**Path Parameters:**
- `projectId` (required): Project ID

**Response:**
```json
{
  "success": true,
  "team": [
    {
      "id": 1,
      "username": "user@example.com",
      "name": "John Doe",
      "email": "user@example.com",
      "designation": "Architect"
    }
  ]
}
```

**Authorization:** Authenticated users

---

### GET `/api/projects/{projectId}/team/available`
Get available users who can be assigned to the project.

**Path Parameters:**
- `projectId` (required): Project ID

**Response:**
```json
{
  "success": true,
  "users": [...]
}
```

**Authorization:** Authenticated users

---

### POST `/api/projects/{projectId}/team/{userId}`
Assign a user to a project.

**Path Parameters:**
- `projectId` (required): Project ID
- `userId` (required): User ID

**Response:**
```json
{
  "success": true,
  "message": "User assigned to project successfully"
}
```

**Authorization:** Authenticated users

---

### DELETE `/api/projects/{projectId}/team/{userId}`
Remove a user from a project.

**Path Parameters:**
- `projectId` (required): Project ID
- `userId` (required): User ID

**Response:**
```json
{
  "success": true,
  "message": "User removed from project successfully"
}
```

**Authorization:** Authenticated users

---

### GET `/api/projects/{projectId}/resources`
Get all resource assignments for a project (across all phases).

**Path Parameters:**
- `projectId` (required): Project ID

**Response:**
```json
{
  "success": true,
  "assignments": [...]
}
```

**Authorization:** Authenticated users

---

## Phases

Base Path: `/api/projects/{projectId}/phases`

### GET `/api/projects/{projectId}/phases`
Get all phases for a project.

**Path Parameters:**
- `projectId` (required): Project ID

**Response:** Array of Phase objects

**Authorization:** Authenticated users

---

### POST `/api/projects/{projectId}/phases`
Create a new phase for a project.

**Path Parameters:**
- `projectId` (required): Project ID

**Request Body:**
```json
{
  "phaseNumber": "01",
  "name": "Concept Design",
  "contractAmount": 50000,
  "status": "ACTIVE",
  "phaseType": "CONCEPT_DESIGN"
}
```

**Response:** Created Phase object

**Authorization:** ADMIN or MANAGER

---

### PUT `/api/projects/{projectId}/phases/{phaseId}`
Update an existing phase.

**Path Parameters:**
- `projectId` (required): Project ID
- `phaseId` (required): Phase ID

**Request Body:** Same as POST (all fields optional)

**Response:** Updated Phase object

**Authorization:** ADMIN or MANAGER

---

### DELETE `/api/projects/{projectId}/phases/{phaseId}`
Delete a phase.

**Path Parameters:**
- `projectId` (required): Project ID
- `phaseId` (required): Phase ID

**Response:** 200 OK

**Authorization:** ADMIN only

---

### POST `/api/projects/{projectId}/phases/standard`
Create all standard Indian architectural phases for a project.

**Path Parameters:**
- `projectId` (required): Project ID

**Response:**
```json
{
  "success": true,
  "message": "Standard phases created successfully",
  "phases": [...],
  "count": 12
}
```

**Authorization:** ADMIN or MANAGER

**Note:** Creates 12 standard phases: Feasibility Study, Site Analysis, Concept Design, Preliminary Design, Design Development, Working Drawings (GFC), Statutory Approvals, Tender Documentation, Construction Documentation, Site Supervision, Completion & Handover, As-Built Drawings.

---

### GET `/api/projects/{projectId}/phases/types`
Get list of available standard phase types.

**Path Parameters:**
- `projectId` (required): Project ID

**Response:**
```json
{
  "success": true,
  "types": [
    {
      "value": "FEASIBILITY_STUDY",
      "label": "Feasibility Study",
      "sequence": 1
    },
    ...
  ]
}
```

**Authorization:** Authenticated users

---

## Resource Assignments

Base Path: `/api/projects/{projectId}/phases/{phaseId}/resources`

**Note:** Resource Assignments represent Level 2 of the three-level system: Phase-level resource planning with billing rates and planned hours.

### GET `/api/projects/{projectId}/phases/{phaseId}/resources`
Get all resource assignments for a phase.

**Path Parameters:**
- `projectId` (required): Project ID
- `phaseId` (required): Phase ID

**Response:**
```json
{
  "success": true,
  "assignments": [
    {
      "id": 1,
      "userId": 1,
      "phaseId": 1,
      "roleOnPhase": "Senior Architect",
      "billingRate": 1500.00,
      "costRate": 800.00,
      "plannedHours": 200,
      "allocatedPercentage": 50.0,
      "startDate": "2024-01-01",
      "endDate": "2024-03-31"
    }
  ]
}
```

**Authorization:** Authenticated users

---

### GET `/api/projects/{projectId}/phases/{phaseId}/resources/project`
Get all resource assignments for a project (across all phases).

**Path Parameters:**
- `projectId` (required): Project ID
- `phaseId` (required): Phase ID (not used, required for URL structure)

**Response:**
```json
{
  "success": true,
  "assignments": [...]
}
```

**Authorization:** Authenticated users

---

### POST `/api/projects/{projectId}/phases/{phaseId}/resources`
Create a new resource assignment.

**Path Parameters:**
- `projectId` (required): Project ID
- `phaseId` (required): Phase ID

**Request Body:**
```json
{
  "userId": 1,
  "roleOnPhase": "Senior Architect",
  "billingRate": 1500.00,
  "costRate": 800.00,
  "plannedHours": 200,
  "allocatedPercentage": 50.0,
  "startDate": "2024-01-01",
  "endDate": "2024-03-31"
}
```

**Response:**
```json
{
  "success": true,
  "assignment": {...},
  "message": "Resource assignment created successfully"
}
```

**Authorization:** Authenticated users

---

### PUT `/api/projects/{projectId}/phases/{phaseId}/resources/{assignmentId}`
Update an existing resource assignment.

**Path Parameters:**
- `projectId` (required): Project ID
- `phaseId` (required): Phase ID
- `assignmentId` (required): Assignment ID

**Request Body:** Same as POST (all fields optional except userId cannot be changed)

**Response:**
```json
{
  "success": true,
  "assignment": {...},
  "message": "Resource assignment updated successfully"
}
```

**Authorization:** Authenticated users

---

### DELETE `/api/projects/{projectId}/phases/{phaseId}/resources/{assignmentId}`
Delete a resource assignment.

**Path Parameters:**
- `projectId` (required): Project ID
- `phaseId` (required): Phase ID
- `assignmentId` (required): Assignment ID

**Response:**
```json
{
  "success": true,
  "message": "Resource assignment deleted successfully"
}
```

**Authorization:** Authenticated users

---

## Tasks

Base Path: `/api/tasks`

### GET `/api/tasks`
Get tasks with filtering and pagination.

**Query Parameters:**
- `filter` (default: "all"): Filter type - "assigned", "reported", "to-check", "all"
- `assigneeId`: Filter by assignee ID
- `status`: Comma-separated list of statuses (e.g., "TO_DO,IN_PROGRESS")
- `priority`: Comma-separated list of priorities
- `projectId`: Filter by project ID
- `page` (default: 0): Page number
- `size` (default: 10): Page size

**Response:**
```json
{
  "tasks": [...],
  "currentPage": 0,
  "totalItems": 50,
  "totalPages": 5,
  "hasNext": true,
  "hasPrevious": false
}
```

**Authorization:** Authenticated users

---

### GET `/api/tasks/list`
Get all tasks (no pagination).

**Response:** Array of Task objects

**Authorization:** Authenticated users

---

### GET `/api/tasks/{taskId}/details`
Get detailed task information including related entities.

**Path Parameters:**
- `taskId` (required): Task ID

**Response:**
```json
{
  "success": true,
  "task": {
    "id": 1,
    "name": "Task Name",
    "description": "Description",
    "status": "TO_DO",
    "priority": "HIGH",
    "project": {...},
    "assignee": {...},
    "reporter": {...},
    "phase": {...},
    "timeLogs": [...]
  }
}
```

**Authorization:** Authenticated users

---

### GET `/api/tasks/users`
Get all users available for task assignment.

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "username": "user@example.com",
      "name": "John Doe",
      "email": "user@example.com"
    }
  ]
}
```

**Authorization:** Authenticated users

---

### POST `/api/tasks`
Create a new task.

**Request Body:**
```json
{
  "name": "Task Name",
  "description": "Description",
  "projectId": 1,
  "phaseId": 1,
  "assigneeId": 1,
  "reporterId": 1,
  "status": "TO_DO",
  "priority": "HIGH",
  "dueDate": "2024-12-31"
}
```

**Response:** Created Task object

**Authorization:** Authenticated users

---

### PUT `/api/tasks/{taskId}`
Update an existing task.

**Path Parameters:**
- `taskId` (required): Task ID

**Request Body:** Same as POST (all fields optional)

**Response:** Updated Task object

**Authorization:** Authenticated users

---

### DELETE `/api/tasks/{taskId}`
Delete a task.

**Path Parameters:**
- `taskId` (required): Task ID

**Response:** 200 OK

**Authorization:** Authenticated users (must be task owner or admin)

---

## Clients

Base Path: `/api/clients`

### GET `/api/clients/search`
Search clients by query string.

**Query Parameters:**
- `query` (optional): Search query

**Response:** Array of Client objects matching the query

**Authorization:** Authenticated users

---

### POST `/api/clients`
Create a new client.

**Request Body:**
```json
{
  "name": "Client Name",
  "code": "CLI001",
  "email": "client@example.com",
  "billingAddress": "Address",
  "paymentTerms": "NET_30"
}
```

**Response:** Created Client object

**Authorization:** Authenticated users

---

### PUT `/api/clients/{clientId}`
Update an existing client.

**Path Parameters:**
- `clientId` (required): Client ID

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "billingAddress": "New Address",
  "state": "Maharashtra",
  "gstin": "GSTIN123",
  "paymentTerms": "NET_30"
}
```

**Response:** Updated Client object

**Authorization:** Authenticated users

---

## Client Contacts

Base Path: `/api/clients/{clientId}/contacts`

### GET `/api/clients/{clientId}/contacts`
Get all contacts for a client.

**Path Parameters:**
- `clientId` (required): Client ID

**Response:** Array of ClientContact objects

**Authorization:** Authenticated users

---

### POST `/api/clients/{clientId}/contacts`
Create a new contact for a client.

**Path Parameters:**
- `clientId` (required): Client ID

**Request Body:**
```json
{
  "name": "Contact Name",
  "email": "contact@example.com",
  "phone": "+91 1234567890",
  "role": "Project Manager"
}
```

**Response:** Created ClientContact object

**Authorization:** Authenticated users

---

## Invoices

Base Path: `/api/invoices`

### GET `/api/invoices`
Get all invoices with pagination and filtering.

**Query Parameters:**
- `page` (default: 0): Page number
- `size` (default: 10): Page size
- `status` (optional): Filter by status

**Response:**
```json
{
  "invoices": [...],
  "currentPage": 0,
  "totalItems": 50,
  "totalPages": 5,
  "hasNext": true,
  "hasPrevious": false
}
```

**Authorization:** ADMIN or MANAGER

---

### GET `/api/invoices/{id}`
Get invoice details by ID.

**Path Parameters:**
- `id` (required): Invoice ID

**Response:** InvoiceResponseDto with full invoice details

**Authorization:** ADMIN or MANAGER

---

### POST `/api/invoices`
Create a new invoice.

**Request Body:**
```json
{
  "clientId": 1,
  "projectId": 1,
  "invoiceNumber": "INV-001",
  "issueDate": "2024-01-01",
  "dueDate": "2024-01-31",
  "items": [
    {
      "description": "Service",
      "quantity": 1,
      "unitPrice": 10000,
      "type": "SERVICE"
    }
  ],
  "notes": "Notes"
}
```

**Response:** Created Invoice object

**Authorization:** ADMIN or MANAGER

---

### PUT `/api/invoices/{id}`
Update an existing invoice.

**Path Parameters:**
- `id` (required): Invoice ID

**Request Body:** Same as POST (all fields optional)

**Response:** Updated Invoice object

**Authorization:** ADMIN or MANAGER

---

### DELETE `/api/invoices/{id}`
Delete an invoice.

**Path Parameters:**
- `id` (required): Invoice ID

**Response:** 200 OK

**Authorization:** ADMIN only

---

### GET `/api/invoices/{id}/pdf`
Generate PDF for an invoice.

**Path Parameters:**
- `id` (required): Invoice ID

**Response:** PDF file download

**Authorization:** ADMIN or MANAGER

---

### POST `/api/invoices/{id}/send-email`
Send invoice via email to client.

**Path Parameters:**
- `id` (required): Invoice ID

**Request Body:**
```json
{
  "toEmail": "client@example.com",
  "subject": "Invoice",
  "message": "Please find attached invoice"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice sent successfully"
}
```

**Authorization:** ADMIN or MANAGER

---

## Users & Profiles

Base Path: `/api/profile`

### GET `/api/profile/image`
Get current user's profile image URL.

**Response:**
```json
{
  "success": true,
  "imageUrl": "/api/files/..."
}
```

**Authorization:** Authenticated users

---

### POST `/api/profile/upload-image`
Upload a profile image.

**Request:** Multipart form data with `file` field

**Response:**
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "imageUrl": "/api/files/..."
}
```

**Authorization:** Authenticated users

**File Restrictions:**
- Types: JPEG, PNG, GIF, WebP
- Max size: 2MB

---

### DELETE `/api/profile/delete-image`
Delete current user's profile image.

**Response:**
```json
{
  "success": true,
  "message": "Profile image deleted successfully"
}
```

**Authorization:** Authenticated users

---

### POST `/api/profile/update-profile`
Update user profile information.

**Request Body:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "bio": "Bio text"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Authorization:** Authenticated users

---

### POST `/api/profile/change-password`
Change user password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Authorization:** Authenticated users

---

## Admin Operations

Base Path: `/api/admin`

### GET `/api/admin/users`
Get all users in the organization.

**Response:** Array of User objects

**Authorization:** ADMIN only

---

### POST `/api/admin/users/create`
Create a new user.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password",
  "name": "User Name",
  "email": "user@example.com",
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

**Authorization:** ADMIN only

---

### POST `/api/admin/users/{userId}/grant-admin`
Grant admin role to a user.

**Path Parameters:**
- `userId` (required): User ID

**Response:** Redirect response

**Authorization:** ADMIN only

---

## Financial Health

Base Path: `/api/financial-health`

### GET `/api/financial-health/dashboard`
Get financial health dashboard data for the organization.

**Response:**
```json
{
  "totalRevenue": 1000000,
  "totalExpenses": 500000,
  "netProfit": 500000,
  "profitMargin": 50.0,
  "outstandingInvoices": 100000,
  ...
}
```

**Authorization:** ADMIN or MANAGER

---

## File Management

Base Path: `/api/files`

### GET `/api/files/**`
Serve stored files.

**Path Parameters:**
- Wildcard path to file

**Response:** File content with appropriate Content-Type

**Authorization:** Authenticated users (file access depends on organization)

---

## Time Logs

Base Path: `/api/timelogs` (assumed based on TimeLogController)

### GET `/api/timelogs`
Get time logs with filtering.

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `projectId` (optional): Filter by project ID
- `taskId` (optional): Filter by task ID
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Response:** Array of TimeLog objects

**Authorization:** Authenticated users

---

### POST `/api/timelogs`
Create a new time log entry.

**Request Body:**
```json
{
  "taskId": 1,
  "hours": 8.5,
  "date": "2024-01-01",
  "description": "Work description"
}
```

**Response:** Created TimeLog object

**Authorization:** Authenticated users

---

## Other Endpoints

### Audit Logs
Base Path: `/api/audit` (assumed based on AuditController)

### Organizations
Base Path: `/api/organizations` (assumed based on OrganizationController)

### Roles & Permissions
Base Path: `/api/roles`, `/api/permissions` (assumed based on RoleController, PermissionController)

### Invoice Templates
Base Path: `/api/invoice-templates` (assumed based on InvoiceTemplateController)

### Attendance
Base Path: `/api/attendance` (assumed based on AttendanceController)

### Payslips
Base Path: `/api/payslips` (assumed based on PayslipController)

### Project Activities
Base Path: `/api/projects/{projectId}/activities` (assumed based on ProjectActivityController)

---

## Authentication & Authorization

### Authentication Methods
- Session-based authentication (default)
- All endpoints require authentication unless explicitly marked as public

### Authorization Levels
- **Public:** No authentication required
- **Authenticated:** Any logged-in user
- **ADMIN:** Users with ROLE_ADMIN
- **MANAGER:** Users with ROLE_MANAGER or ROLE_ADMIN

### Security Notes
- All endpoints validate user organization membership
- Users can only access data from their organization
- Project access is controlled via project team membership
- Admin endpoints require explicit ADMIN role

---

## Error Responses

Standard error response format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized for this action
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Notes

1. **Base URL:** All endpoints are relative to the API base path (e.g., `http://localhost:8080/api/...`)

2. **Content-Type:** 
   - JSON requests: `application/json`
   - File uploads: `multipart/form-data`

3. **Date Formats:**
   - Dates: ISO 8601 format (YYYY-MM-DD)
   - DateTimes: ISO 8601 format with time (YYYY-MM-DDTHH:mm:ss)

4. **Pagination:**
   - Page numbers are 0-indexed
   - Default page size is typically 10-12 items

5. **Three-Level Resource System:**
   - **Level 1:** Project Team (Access List) - `/api/projects/{projectId}/team`
   - **Level 2:** Resource Assignments (Financial Planning) - `/api/projects/{projectId}/phases/{phaseId}/resources`
   - **Level 3:** Tasks (Execution) - `/api/tasks`

---

**Last Updated:** 2024






