# Sheet Management Application - Architecture & Design

## 1. DATABASE SCHEMA (MySQL)

```sql
-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role_id INT NOT NULL,
  branch_id INT,
  team_id INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  INDEX idx_role_id (role_id),
  INDEX idx_branch_id (branch_id),
  INDEX idx_team_id (team_id),
  INDEX idx_email (email)
);

-- Roles Table
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branches Table
CREATE TABLE branches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_name (name)
);

-- Teams Table
CREATE TABLE teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  branch_id INT NOT NULL,
  created_by INT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_branch_id (branch_id),
  UNIQUE KEY unique_name_branch (name, branch_id)
);

-- Sheets Table
CREATE TABLE sheets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  branch_id INT NOT NULL,
  team_id INT,
  created_by INT NOT NULL,
  is_archived BOOLEAN DEFAULT false,
  rows INT DEFAULT 100,
  columns INT DEFAULT 26,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_branch_id (branch_id),
  INDEX idx_team_id (team_id),
  INDEX idx_created_by (created_by),
  FULLTEXT INDEX idx_search (name, description)
);

-- Sheet Cells Table (only stores non-empty cells)
CREATE TABLE sheet_cells (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sheet_id INT NOT NULL,
  row INT NOT NULL,
  col INT NOT NULL,
  value TEXT,
  data_type VARCHAR(50) DEFAULT 'text',
  last_modified_by INT,
  last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE,
  FOREIGN KEY (last_modified_by) REFERENCES users(id),
  UNIQUE KEY unique_cell (sheet_id, row, col),
  INDEX idx_sheet_id (sheet_id),
  INDEX idx_last_modified_by (last_modified_by)
);

-- Sheet Shares Table
CREATE TABLE sheet_shares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sheet_id INT NOT NULL,
  shared_with_user_id INT NOT NULL,
  permission_level VARCHAR(50) NOT NULL DEFAULT 'view',
  shared_by INT NOT NULL,
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by) REFERENCES users(id),
  UNIQUE KEY unique_share (sheet_id, shared_with_user_id),
  INDEX idx_sheet_id (sheet_id),
  INDEX idx_shared_with_user_id (shared_with_user_id)
);

-- Notifications Table
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  actor_id INT,
  notification_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  entity_type VARCHAR(50),
  entity_id INT,
  metadata JSON,
  is_read BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- Activity Logs Table
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_entity_type_id (entity_type, entity_id),
  INDEX idx_created_at (created_at)
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('admin', 'Full system access'),
('manager', 'Branch-level management'),
('team_lead', 'Team-level management'),
('user', 'Basic user with edit permissions'),
('agent', 'View-only user');
```

## 2. REST API ENDPOINTS

### Authentication Routes

- `POST /api/auth/login` - Login with email/username and password
- `POST /api/auth/logout` - Logout (client-side clear token)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

### User Management Routes

- `GET /api/users` - List users (filtered by role permissions)
- `POST /api/users` - Create user (Admin/Manager only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/search` - Search users

### Branch Management Routes

- `GET /api/branches` - List branches (Admin sees all, others see their own)
- `POST /api/branches` - Create branch (Admin only)
- `GET /api/branches/:id` - Get branch details
- `PUT /api/branches/:id` - Update branch (Admin only)
- `DELETE /api/branches/:id` - Delete branch (Admin only)
- `GET /api/branches/:id/users` - Get branch users
- `GET /api/branches/:id/sheets` - Get branch sheets

### Team Management Routes

- `GET /api/teams` - List teams (Manager sees branch teams, Admin sees all)
- `POST /api/teams` - Create team (Manager+ only)
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `GET /api/teams/:id/users` - Get team members

### Sheet Routes

- `GET /api/sheets` - List sheets (role-based filtering)
- `POST /api/sheets` - Create sheet
- `GET /api/sheets/:id` - Get sheet metadata and grid info
- `PUT /api/sheets/:id` - Update sheet metadata
- `DELETE /api/sheets/:id` - Delete sheet
- `GET /api/sheets/:id/cells` - Get all cells for a sheet
- `POST /api/sheets/:id/cells` - Save/Update cell
- `DELETE /api/sheets/:id/cells/:row/:col` - Delete cell
- `GET /api/sheets/:id/history` - Get sheet edit history

### Sheet Sharing Routes

- `GET /api/sheets/:id/shares` - List sheet shares
- `POST /api/sheets/:id/share` - Share sheet with user
- `DELETE /api/sheets/:id/shares/:userId` - Remove share
- `PUT /api/sheets/:id/shares/:userId` - Update share permission

### Notification Routes

- `GET /api/notifications` - List notifications for current user
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Activity Log Routes

- `GET /api/activity-logs` - List activity logs (Admin/Manager only)
- `GET /api/activity-logs/:userId` - Get logs for specific user (Admin only)

## 3. FRONTEND ROUTES (React Router)

```
/
├── /login                          # Login page
├── /dashboard                      # Main dashboard (role-based)
├── /sheets                         # Sheets list
├── /sheets/:id                     # Sheet editor
├── /sheets/:id/sharing             # Share sheet UI
├── /users                          # User management (Admin/Manager)
├── /users/:id                      # User details
├── /branches                       # Branch management (Admin only)
├── /branches/:id                   # Branch details
├── /teams                          # Team management
├── /teams/:id                      # Team details
├── /notifications                  # Notifications page
├── /activity-logs                  # Activity logs (Admin/Manager)
├── /settings                       # User settings
└── /profile                        # User profile
```

## 4. PERMISSION RULES MATRIX

| Action        | Admin  | Manager          | Team Lead    | User         | Agent |
| ------------- | ------ | ---------------- | ------------ | ------------ | ----- |
| Create Branch | ✓      | ✗                | ✗            | ✗            | ✗     |
| Create Sheet  | ✓      | ✓(own branch)    | ✓(own team)  | ✗            | ✗     |
| Edit Sheet    | ✓      | ✓(own branch)    | ✓(own team)  | ✓(if shared) | ✗     |
| Share Sheet   | ✓      | ✓(own branch)    | ✓(own team)  | ✗            | ✗     |
| Delete Sheet  | ✓      | ✓(own branch)    | ✓(own team)  | ✗            | ✗     |
| Create User   | ✓      | ✓(user/agent/TL) | ✗            | ✗            | ✗     |
| View Users    | ✓(all) | ✓(branch only)   | ✓(team only) | ✗            | ✗     |
| Delete User   | ✓      | ✗                | ✗            | ✗            | ✗     |
| View Logs     | ✓      | ✓(branch)        | ✗            | ✗            | ✗     |

## 5. NOTIFICATION TYPES

- `sheet_created` - When a sheet is created
- `sheet_updated` - When a sheet is modified
- `sheet_deleted` - When a sheet is deleted
- `sheet_shared` - When a sheet is shared
- `user_created` - When a user is created
- `login` - User login events
- `logout` - User logout events

## 6. TECH STACK SUMMARY

**Backend:**

- Node.js + Express.js
- MySQL with Sequelize ORM
- JWT for authentication
- bcrypt for password hashing
- Nodemailer for email notifications
- Multer for file uploads (if needed)

**Frontend:**

- React 18+
- React Router v6
- Tailwind CSS
- Axios for API calls
- Context API for state management
- Zustand for global state (optional)

**Database:**

- MySQL 8.0+
- Proper indexing for performance
- Foreign key constraints

---

## Implementation Order

1. Database schema creation
2. Backend initialization and auth system
3. User management APIs
4. Sheet system APIs
5. Notifications and activity logs
6. Frontend setup and authentication
7. Dashboard and layout
8. Sheet editor component
9. User/Admin management panels
10. Notifications and logs UI
11. Testing and optimization
