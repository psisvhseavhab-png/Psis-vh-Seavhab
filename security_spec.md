# Firebase Security Specification

## Data Invariants
1. Students, Classes, and Invoices must have valid structure.
2. Only Admins can modify global settings.
3. Users can read their own profiles and related academic data.
4. Telegram Chat IDs are sensitive and should only be readable by authorized staff.

## The Dirty Dozen Payloads (Targeting Rejection)

| Target Collection | Operation | Payload / Action | Expected Result |
|-------------------|-----------|------------------|-----------------|
| `settings` | `update` | `{ "telegramBotToken": "stolen_token" }` by non-admin | `PERMISSION_DENIED` |
| `students` | `create` | `{ "name": "Fake Student", "id": "admin_uid" }` | `PERMISSION_DENIED` |
| `invoices` | `update` | `{ "status": "paid" }` by student | `PERMISSION_DENIED` |
| `users` | `update` | `{ "role": "admin" }` by self (teacher/parent) | `PERMISSION_DENIED` |
| `employees` | `create` | `{ "role": "super-admin" }` | `PERMISSION_DENIED` |
| `grades` | `update` | `{ "score": 100 }` by student | `PERMISSION_DENIED` |
| `settings` | `get` | fetching `global` document by student | `PERMISSION_DENIED` |
| `publicHolidays` | `delete`| deleting a holiday by parent | `PERMISSION_DENIED` |
| `attendance` | `create` | `{ "status": "present" }` for wrong date/class | `PERMISSION_DENIED` |
| `classes` | `update` | changing `teacherId` by regular teacher | `PERMISSION_DENIED` |
| `invoices` | `create` | creating invoice for another student | `PERMISSION_DENIED` |
| `scholarships` | `update`| changing percentage by parent | `PERMISSION_DENIED` |
| `projects` | `update` | `{ "budget": 1000000 }` by manager | `PERMISSION_DENIED` |
| `tasks` | `delete` | deleting a task by a non-admin | `PERMISSION_DENIED` |
| `expenses` | `read` | viewing school expenses by a teacher | `PERMISSION_DENIED` |
| `website_gallery` | `update`| changing `isPublic` by a visitor | `PERMISSION_DENIED` |

## Test Runner (Logic Check)
The `firestore.rules` will be verified against these patterns.
