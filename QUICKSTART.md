# 🚀 Quick Start Guide - School Management System

## Prerequisites Check
Before starting, make sure you have:
- ✅ Node.js installed (v14 or higher) - Check: `node --version`
- ✅ MongoDB installed and running - Check: `mongod --version`
- ✅ npm installed - Check: `npm --version`

## Installation Steps (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```
This will install all required packages (Express, MongoDB, JWT, etc.)

### Step 2: Start MongoDB
Make sure MongoDB is running:

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or run mongod directly
mongod
```

**Linux/Mac:**
```bash
sudo systemctl start mongod
```

### Step 3: Setup Database with Sample Data
Run the setup script to create admin user and sample data:
```bash
node setup-database.js
```

This will create:
- ✅ 1 Admin user
- ✅ 2 Teachers
- ✅ 5 Students
- ✅ 2 Classes (Class 7A and Class 8A)

### Step 4: Start the Server
```bash
# Development mode (recommended)
npm run dev

# OR Production mode
npm start
```

Server will start at: **http://localhost:5000**

### Step 5: Open in Browser
Navigate to: **http://localhost:5000**

## 🔑 Default Login Credentials

### Admin Login
- **Username:** admin
- **Password:** admin123
- **Role:** Admin

### Teacher Login
- **Username:** teacher1
- **Password:** teacher123
- **Role:** Teacher

### Student Login
- **Username:** student1
- **Password:** student123
- **Role:** Student

## 🎯 What to Try First

### As Admin:
1. ✅ Login with admin credentials
2. ✅ View Dashboard (see statistics)
3. ✅ Go to Students → View all students
4. ✅ Click "Add Student" to create a new student
5. ✅ Go to Classes → View class details
6. ✅ Go to Fees → Create fee structure
7. ✅ Toggle Dark Mode (moon icon in header)

### As Teacher:
1. ✅ Login with teacher credentials
2. ✅ Go to Attendance → Mark attendance
3. ✅ Go to Exams → Create new exam
4. ✅ Add exam results for students

### As Student:
1. ✅ Login with student credentials
2. ✅ View your profile
3. ✅ Check attendance records
4. ✅ View exam results
5. ✅ Check fee status

## 📱 Features to Explore

### Student Management
- Add new students (auto-generates Student ID)
- Edit student information
- View student profiles
- Delete students

### Teacher Management
- Add teachers (auto-generates Teacher ID)
- Assign subjects to teachers
- View teacher list

### Class Management
- Create classes
- Assign class teachers
- Add students to classes
- Promote students to next class

### Attendance System
- Mark daily attendance
- View attendance by class
- View attendance by student
- Check attendance summaries (daily/weekly/monthly)

### Exam & Results
- Create exams
- Add student marks
- Auto-calculate percentage and grades
- Export results as JSON

### Fee Management
- Create fee structures
- Record payments
- Generate receipts (auto-generated receipt numbers)
- View due fees

## 🎨 UI Features

- **Dark Mode:** Click moon/sun icon in header
- **Responsive:** Works on mobile, tablet, and desktop
- **Charts:** Attendance trends visualization
- **Notifications:** Toast messages for actions
- **Search:** Search functionality in header

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### Issue 2: Port 5000 Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change port in `.env` file:
```
PORT=3000
```

### Issue 3: Cannot Login
**Solution:** 
1. Make sure you ran `node setup-database.js`
2. Check MongoDB is running
3. Clear browser cache and try again

### Issue 4: "npm install" Fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## 📂 Project Structure Overview

```
├── models/          # Database models (User, Student, Teacher, etc.)
├── routes/          # API endpoints
├── middleware/      # Authentication middleware
├── public/          # Frontend files (HTML, CSS, JS)
├── sample-data/     # Sample JSON data
├── server.js        # Main server file
└── setup-database.js # Database setup script
```

## 🔧 Development Tips

### Auto-reload on Changes
Use `npm run dev` for automatic server restart on file changes (requires nodemon)

### View Database
Use MongoDB Compass to view database:
```
Connection String: mongodb://localhost:27017/school_management
```

### API Testing
Use Postman or Thunder Client to test API endpoints:
```
Base URL: http://localhost:5000/api
```

### Check Logs
Server logs will show in the terminal:
- ✅ MongoDB connection status
- ✅ API requests
- ✅ Errors and warnings

## 📚 Next Steps

1. **Customize:** Modify colors, logos, and branding in `public/css/style.css`
2. **Add Features:** Extend functionality in routes and models
3. **Deploy:** Follow deployment guide in README.md
4. **Secure:** Change JWT_SECRET in production
5. **Backup:** Setup regular MongoDB backups

## 🆘 Need Help?

- 📖 Read full documentation in `README.md`
- 🐛 Check troubleshooting section
- 💬 Create an issue on GitHub
- 📧 Contact support

## ✅ Checklist

Before going to production:
- [ ] Change JWT_SECRET in .env
- [ ] Setup MongoDB Atlas (cloud database)
- [ ] Enable HTTPS
- [ ] Setup proper CORS policy
- [ ] Add rate limiting
- [ ] Setup logging
- [ ] Create backups
- [ ] Test all features
- [ ] Update default passwords

---

**🎉 You're all set! Start managing your school efficiently!**
