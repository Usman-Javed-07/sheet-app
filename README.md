# Sheet Management Application

A comprehensive collaborative spreadsheet management platform built with React, Node.js/Express, and MySQL. Features role-based access control, real-time cell editing, sheet sharing, activity logging, and notifications.

## 🏗️ Architecture

### Tech Stack

**Backend:**

- Node.js + Express.js
- MySQL with Sequelize ORM
- JWT Authentication with bcrypt
- Nodemailer for email notifications

**Frontend:**

- React 18+ with React Router v6
- Tailwind CSS for modern styling
- Axios for API requests
- Context API for state management
- Lucide React for icons

**Database:**

- MySQL 8.0+
- Fully normalized schema with proper indexes

## 📁 Project Structure

```
sheet app/
├── server/                 # Backend (Node.js/Express)
│   ├── config/            # Configuration files
│   ├── controllers/        # Business logic
│   ├── models/           # Sequelize models
│   ├── middleware/        # Auth & error handling
│   ├── routes/           # API routes
│   ├── services/         # Email & notification services
│   ├── utils/            # Utility functions
│   ├── scripts/          # Database seed scripts
│   ├── index.js          # Main server file
│   ├── package.json
│   └── .env.example
│
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context (Auth)
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service
│   │   ├── styles/       # Global styles
│   │   ├── App.js
│   │   └── index.js
│   ├── public/           # Static files
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
│
├── ARCHITECTURE.md        # Detailed architecture documentation
└── README.md             # This file
```

## 🔐 User Roles & Permissions

### 1. **Admin**

- Full system access
- Create/manage branches
- Create/manage any user
- View all data and activity logs

### 2. **Manager**

- Branch-level management
- Create sheets for their branch
- Create users (user, agent, team_lead)
- View branch data only
- Share sheets within branch

### 3. **Team Lead**

- Team-level management
- Create sheets for their team
- View team data
- Share sheets with team members

### 4. **User**

- View and edit shared sheets
- Limited permissions based on shares

### 5. **Agent**

- View-only access to shared sheets
- Cannot edit

## 🚀 Getting Started

### Prerequisites

- Node.js 14+
- MySQL 8.0+
- npm or yarn

### Backend Setup

1. **Navigate to server directory:**

   ```bash
   cd server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create .env file:**

   ```bash
   cp .env.example .env
   ```

4. **Configure database in .env:**

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=sheet_app
   DB_PORT=3306

   JWT_SECRET=your-super-secret-jwt-key-change-this
   PORT=5000
   NODE_ENV=development

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@sheetapp.com

   FRONTEND_URL=http://localhost:3000
   ```

5. **Create MySQL database:**

   ```bash
   mysql -u root -p
   CREATE DATABASE sheet_app;
   EXIT;
   ```

6. **Run seed script to create admin user:**

   ```bash
   npm run seed
   ```

   This will create:

   - Database schema with all tables
   - Default roles (admin, manager, team_lead, user, agent)
   - Initial admin user with temporary password

7. **Start development server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory:**

   ```bash
   cd client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create .env file:**

   ```bash
   cp .env.example .env
   ```

4. **Configure API URL in .env:**

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. **Start development server:**
   ```bash
   npm start
   ```
   App runs on `http://localhost:3000`

## 📚 API Documentation

### Authentication

- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Users

- `GET /api/users` - List users (role-filtered)
- `POST /api/users` - Create user (Admin/Manager)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

### Sheets

- `GET /api/sheets` - List sheets (role-filtered)
- `POST /api/sheets` - Create sheet
- `GET /api/sheets/:id` - Get sheet with cells
- `PUT /api/sheets/:id` - Update sheet
- `DELETE /api/sheets/:id` - Delete sheet

### Sheet Cells

- `GET /api/sheets/:sheetId/cells` - Get all cells
- `POST /api/sheets/:sheetId/cells` - Save/update cell
- `DELETE /api/sheets/:sheetId/cells/:row/:col` - Delete cell

### Sheet Sharing

- `GET /api/sheets/:sheetId/shares` - Get sheet shares
- `POST /api/sheets/:sheetId/share` - Share sheet
- `PUT /api/sheets/:sheetId/shares/:userId` - Update permission
- `DELETE /api/sheets/:sheetId/shares/:userId` - Remove share

### Notifications

- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Activity Logs

- `GET /api/activity-logs` - Get activity logs (Admin/Manager)
- `GET /api/activity-logs/user/:userId` - Get user logs (Admin)

### Branches

- `GET /api/branches` - List branches
- `POST /api/branches` - Create branch (Admin)
- `GET /api/branches/:id` - Get branch details
- `PUT /api/branches/:id` - Update branch (Admin)
- `DELETE /api/branches/:id` - Delete branch (Admin)

## 🎯 Features

### Implemented

- ✅ Role-based access control
- ✅ User authentication with JWT
- ✅ Password hashing with bcrypt
- ✅ Database schema with proper relationships
- ✅ API endpoints for all operations
- ✅ Modern React UI with Tailwind CSS
- ✅ Protected routes
- ✅ Admin dashboard
- ✅ Activity logging system

### In Development

- 🔄 Sheet editor with spreadsheet grid
- 🔄 Sheet sharing interface
- 🔄 Notifications dashboard
- 🔄 Activity logs viewer
- 🔄 User management panel
- 🔄 Branch management panel

### To Do

- ⏳ Email notifications
- ⏳ Real-time collaboration (WebSockets)
- ⏳ File export/import
- ⏳ Advanced cell formatting
- ⏳ Comments and mentions

## 📊 Database Schema

All tables properly normalized with:

- Foreign key constraints
- Appropriate indexes
- Timestamps for audit trails
- JSON fields for flexible metadata

Key tables:

- `users` - User accounts
- `roles` - User roles
- `branches` - Organization branches
- `teams` - Teams within branches
- `sheets` - Spreadsheet documents
- `sheet_cells` - Individual cells (only non-empty)
- `sheet_shares` - Sheet sharing permissions
- `notifications` - User notifications
- `activity_logs` - Audit trail

## 🔒 Security

- JWT-based authentication with expiration
- Password hashing with bcrypt (10 salt rounds)
- CORS configuration for frontend
- Request validation and sanitization
- Role-based authorization on all endpoints
- Activity logging for audit trails

## 🧪 Testing the Application

1. **Login**

   - Use the default admin credentials from seed script
   - Check server logs for admin password

2. **Create Branch**

   - Admin only: Navigate to Branches
   - Create a new branch

3. **Create Users**

   - Admin/Manager: Go to Users
   - Create users with different roles
   - Assign to appropriate branches

4. **Create Sheets**

   - Manager/Team Lead: Create sheets
   - Add data using the grid editor
   - Share with team members

5. **Monitor Activity**
   - Admin/Manager: View Activity Logs
   - Check notifications for events
   - Review who modified what and when

## 📝 Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=sheet_app
DB_PORT=3306

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-password

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions, please refer to the ARCHITECTURE.md file for detailed design documentation.

## 🗺️ Roadmap

**v1.1**

- Sheet sharing UI
- Sheet editor with grid component
- Notifications system UI

**v1.2**

- WebSocket real-time collaboration
- Advanced cell formatting
- Import/Export functionality

**v1.3**

- Comments and mentions
- Sheet version history
- Advanced search and filtering

---

**Last Updated:** November 2025
**Status:** In Active Development
# sheet-app
