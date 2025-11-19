# Quick Start Guide

## 🚀 Get the App Running in 10 Minutes

### Step 1: Start the Backend

```bash
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```

**Expected Output:**

```
Database connection established
Database synchronized
Server running on port 5000
✓ Admin user created successfully!
```

The seed script will display your admin credentials.

### Step 2: Start the Frontend

```bash
cd client
npm install
cp .env.example .env
npm start
```

The app will open at `http://localhost:3000`

### Step 3: Login

Use the admin credentials from the server console output:

- Email: `admin@sheetapp.com`
- Password: (shown in seed output)

## 📋 Initial Setup Tasks

After logging in as admin:

### 1. Change Your Password

Go to Settings and update your password from the temporary one.

### 2. Create a Branch

- Click "Branches" in sidebar (Admin only)
- Click "Create Branch"
- Fill in name and description
- Save

### 3. Create Manager User

- Click "Users" in sidebar
- Click "Create User"
- Fill in details
- Select role: Manager
- Assign to a branch
- Save (user gets email with temp password)

### 4. Create Regular Users

- Switch to Manager account or stay as Admin
- Create users with role "user" or "agent"
- Assign to branch/team

### 5. Create a Sheet

- Click "Sheets" in sidebar
- Click "Create Sheet"
- Select branch
- Add sheet name
- Click "Create"

### 6. Share Sheet

- Open sheet
- Click "Share"
- Select user to share with
- Choose permission (view/edit)
- Save

### 7. Edit Cells

- Click on any cell in the grid
- Type content
- Press Enter to save
- Cell auto-saves to database

## 🧪 Test Scenarios

### Admin Flow

1. Create branch
2. Create manager for that branch
3. Create users under branch
4. Create sheet
5. View activity logs

### Manager Flow

1. Create sheets for branch
2. Create users (user/agent/team_lead only)
3. Share sheets with team
4. View branch activity

### User Flow

1. Login
2. View shared sheets in "Sheets" section
3. Edit sheets (if edit permission granted)
4. Check notifications

### Agent Flow

1. Login
2. View shared sheets (read-only)
3. Cannot edit
4. Check notifications

## 🔍 Troubleshooting

### Backend Won't Start

```
Error: Database connection failed
```

✅ Check MySQL is running
✅ Check DB credentials in .env
✅ Verify database exists

### Frontend Won't Connect

```
Error: Failed to fetch from API
```

✅ Check backend is running on port 5000
✅ Check REACT_APP_API_URL in .env
✅ Check CORS is not blocking requests

### Seed Script Fails

```
Error: Table already exists
```

✅ This is fine! It means admin already exists
✅ Just use the credentials in console

### Login Fails

```
401 Invalid credentials
```

✅ Make sure you ran `npm run seed` in server
✅ Use exact credentials from seed output
✅ Check JWT_SECRET is set in .env

## 📊 Database Reset (if needed)

```bash
# In MySQL
DROP DATABASE sheet_app;
CREATE DATABASE sheet_app;

# Then run seed again
npm run seed
```

## 🎯 Key Features to Try

1. **Role-based Access**

   - Login as different roles
   - Notice different menu options

2. **Sheet Sharing**

   - Create sheet as manager
   - Share with user
   - Login as user and see shared sheet

3. **Activity Logging**

   - Create/modify data
   - Go to Activity Logs (Admin/Manager only)
   - See complete history

4. **Notifications**

   - Perform actions
   - Check notification bell
   - See events logged

5. **Permissions**
   - Try accessing pages you don't have permission for
   - Get permission denied message

## 🐛 Check Logs

**Backend Logs:**
Watch console when running `npm run dev` - all API calls logged

**Frontend Logs:**
Open browser DevTools (F12) → Console tab to see client errors

**Database:**
Connect with MySQL client to inspect data:

```bash
mysql -u root -p sheet_app
SELECT * FROM users;
```

## 📱 Default Ports

- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- MySQL: localhost:3306

## ✅ Checklist

- [ ] MySQL running
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] Can login with admin credentials
- [ ] Dashboard loads
- [ ] Can navigate to different pages
- [ ] Can see correct menu based on role

## 🎓 Next Steps

1. Read ARCHITECTURE.md for detailed API documentation
2. Explore React components in client/src/components/
3. Check Express routes in server/routes/
4. Review database schema in ARCHITECTURE.md
5. Extend with more features!

## 💡 Pro Tips

- Use "Test" in Login form to try as different users
- Check browser Network tab to see API calls
- Use MySQL Workbench to visually explore database
- All timestamps are UTC in database
- Passwords are bcrypt hashed (not reversible)

---

**Need help?** Check ARCHITECTURE.md or review the code comments!
