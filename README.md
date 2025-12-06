# 🎓 School Management System

A complete, modern school management web application built with Node.js, Express, MongoDB, and vanilla JavaScript.

## ✨ Features

### 🔐 1. Authentication System
- **Multi-role Login**: Admin, Teacher, and Student
- **JWT-based Authentication**: Secure token-based auth
- **Session Management**: Persistent login sessions
- **Password Hashing**: bcrypt for secure password storage

### 👨‍🎓 2. Student Management
- ✅ Add new students with complete profile
- ✅ Auto-generated Student ID (Format: STU20240001)
- ✅ Edit student information
- ✅ Delete student records
- ✅ View student profiles
- ✅ Student list with search and filter
- ✅ Parent/Guardian information
- ✅ Medical information tracking

### 👨‍🏫 3. Teacher Management
- ✅ Add/Edit/Delete teachers
- ✅ Auto-generated Teacher ID (Format: TCH20240001)
- ✅ Assign subjects to teachers
- ✅ View teacher profiles
- ✅ Track qualifications and experience
- ✅ Salary management

### 🏫 4. Class Management
- ✅ Create and manage classes
- ✅ Assign class teachers
- ✅ Add students to classes
- ✅ Subject-teacher mapping
- ✅ Promote students to next class
- ✅ Class capacity management

### 📋 5. Attendance System
- ✅ Mark daily attendance (Present/Absent/Late/Excused)
- ✅ Class-wise attendance tracking
- ✅ Student-wise attendance history
- ✅ Daily, Weekly, Monthly summaries
- ✅ Attendance percentage calculation
- ✅ Date-wise attendance reports

### 📝 6. Exam & Results Management
- ✅ Create exams (Mid-Term, Final, Unit Test, Quiz, Practical)
- ✅ Add student marks
- ✅ Auto-calculate percentage
- ✅ Auto-generate grades (A+, A, B+, B, C, D, F)
- ✅ View result cards
- ✅ Export results as JSON
- ✅ Subject-wise results

### 💰 7. Fee Management
- ✅ Multiple fee categories (Tuition, Transport, Library, Lab, Sports)
- ✅ Create fee structures
- ✅ Record payments (Cash, Card, Online, Cheque)
- ✅ Auto-generated receipt numbers
- ✅ Track due fees
- ✅ Payment history
- ✅ Fee status (Paid, Partial, Pending, Overdue)
- ✅ Print/Download receipts

### 📊 8. Dashboard
- ✅ Total students count
- ✅ Total teachers count
- ✅ Total classes count
- ✅ Today's attendance summary
- ✅ Attendance chart (7-day trend)
- ✅ Recent students list
- ✅ Class distribution

### 🎨 9. UI/UX Features
- ✅ Modern, clean design with gradients
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Dark mode toggle
- ✅ Smooth animations and transitions
- ✅ Toast notifications
- ✅ Interactive charts (Chart.js)
- ✅ Sidebar navigation
- ✅ Search functionality

## 🛠️ Technology Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with variables
- **JavaScript (ES6+)**: Client-side logic
- **Chart.js**: Data visualization
- **Font Awesome**: Icons
- **Google Fonts**: Typography (Inter)

## 📁 Project Structure

```
school-management-system/
├── models/              # Mongoose models
│   ├── User.js         # User authentication model
│   ├── Student.js      # Student model
│   ├── Teacher.js      # Teacher model
│   ├── Class.js        # Class model
│   ├── Attendance.js   # Attendance model
│   ├── Exam.js         # Exam & results model
│   └── Fee.js          # Fee management model
├── routes/             # Express routes
│   ├── auth.js         # Authentication routes
│   ├── students.js     # Student CRUD routes
│   ├── teachers.js     # Teacher CRUD routes
│   ├── classes.js      # Class management routes
│   ├── attendance.js   # Attendance routes
│   ├── exams.js        # Exam & results routes
│   ├── fees.js         # Fee management routes
│   └── dashboard.js    # Dashboard stats routes
├── middleware/         # Custom middleware
│   └── auth.js         # JWT authentication middleware
├── public/             # Frontend files
│   ├── index.html      # Main HTML file
│   ├── css/
│   │   └── style.css   # Stylesheet
│   └── js/
│       ├── api.js      # API client
│       └── app.js      # Main application logic
├── sample-data/        # Sample JSON data
│   ├── users.json
│   ├── classes.json
│   └── fee-categories.json
├── .env                # Environment variables
├── server.js           # Express server
├── package.json        # Dependencies
└── README.md           # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

### Step 3: Configure Environment Variables
The `.env` file is already created with default values:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` in production!

### Step 4: Create Initial Admin User
You need to create an admin user first. You can do this by:

**Option A: Using MongoDB Compass or Shell**
```javascript
// Connect to MongoDB and run:
use school_management

// Create admin user (password will be hashed automatically by the model)
db.users.insertOne({
  username: "admin",
  email: "admin@school.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash "admin123"
  role: "admin",
  fullName: "Admin User",
  phone: "1234567890",
  address: "School Address",
  isActive: true,
  createdAt: new Date()
})
```

**Option B: Using the API**
After starting the server, make a POST request to `/api/auth/register`:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@school.com",
    "password": "admin123",
    "role": "admin",
    "fullName": "Admin User",
    "phone": "1234567890",
    "address": "School Address"
  }'
```

### Step 5: Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

### Step 6: Access the Application
Open your browser and navigate to:
```
http://localhost:5000
```

## 🔑 Default Login Credentials

After creating the admin user:

**Admin Login:**
- Username: `admin`
- Password: `admin123`
- Role: Admin

**Create Teacher/Student accounts through the admin panel after logging in.**

## 📖 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Register (Admin only)
```http
POST /api/auth/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@school.com",
  "password": "password123",
  "role": "student",
  "fullName": "New User",
  "phone": "1234567890"
}
```

### Student Endpoints

```http
GET    /api/students              # Get all students
GET    /api/students/:id          # Get student by ID
POST   /api/students              # Create student (Admin)
PUT    /api/students/:id          # Update student (Admin)
DELETE /api/students/:id          # Delete student (Admin)
```

### Teacher Endpoints

```http
GET    /api/teachers              # Get all teachers
GET    /api/teachers/:id          # Get teacher by ID
POST   /api/teachers              # Create teacher (Admin)
PUT    /api/teachers/:id          # Update teacher (Admin)
DELETE /api/teachers/:id          # Delete teacher (Admin)
PUT    /api/teachers/:id/subjects # Assign subjects (Admin)
```

### Class Endpoints

```http
GET    /api/classes                      # Get all classes
GET    /api/classes/:id                  # Get class by ID
POST   /api/classes                      # Create class (Admin)
PUT    /api/classes/:id                  # Update class (Admin)
DELETE /api/classes/:id                  # Delete class (Admin)
POST   /api/classes/:id/students         # Add students to class (Admin)
DELETE /api/classes/:id/students/:sid    # Remove student (Admin)
POST   /api/classes/promote              # Promote students (Admin)
```

### Attendance Endpoints

```http
POST   /api/attendance                   # Mark attendance (Teacher)
PUT    /api/attendance/:id               # Update attendance (Teacher)
GET    /api/attendance/class/:classId    # Get by class
GET    /api/attendance/student/:studentId # Get by student
GET    /api/attendance/summary/:classId  # Get summary
GET    /api/attendance/date/:date        # Get by date
```

### Exam Endpoints

```http
GET    /api/exams                    # Get all exams
GET    /api/exams/:id                # Get exam by ID
POST   /api/exams                    # Create exam (Teacher)
PUT    /api/exams/:id                # Update exam (Teacher)
DELETE /api/exams/:id                # Delete exam (Teacher)
POST   /api/exams/:id/results        # Add results (Teacher)
GET    /api/exams/student/:studentId # Get student exams
GET    /api/exams/:id/export         # Export results
```

### Fee Endpoints

```http
GET    /api/fees                        # Get all fees
GET    /api/fees/student/:studentId     # Get student fees
GET    /api/fees/due                    # Get due fees (Admin)
POST   /api/fees                        # Create fee (Admin)
POST   /api/fees/:id/payment            # Add payment (Admin)
GET    /api/fees/receipt/:feeId/:index  # Get receipt
PUT    /api/fees/:id                    # Update fee (Admin)
DELETE /api/fees/:id                    # Delete fee (Admin)
```

### Dashboard Endpoints

```http
GET    /api/dashboard/stats              # Get statistics
GET    /api/dashboard/recent-students    # Get recent students
GET    /api/dashboard/attendance-chart   # Get attendance chart data
GET    /api/dashboard/class-distribution # Get class distribution
```

## 🎯 Important Functions Explained

### Auto-Generated IDs

**Student ID Generation** (models/Student.js):
```javascript
// Pre-save hook automatically generates student ID
// Format: STU + Year + 4-digit counter
// Example: STU20240001, STU20240002, etc.
studentSchema.pre('save', async function(next) {
  if (!this.studentId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Student').countDocuments();
    this.studentId = `STU${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});
```

**Teacher ID Generation** (models/Teacher.js):
```javascript
// Similar to student ID
// Format: TCH + Year + 4-digit counter
// Example: TCH20240001
```

**Receipt Number Generation** (models/Fee.js):
```javascript
// Auto-generates receipt number for each payment
// Format: RCP + Year + 6-digit counter
// Example: RCP2024000001
```

### Grade Calculation

**Automatic Grade Assignment** (models/Exam.js):
```javascript
// Pre-save hook calculates percentage and assigns grade
examSchema.pre('save', function(next) {
  this.results.forEach(result => {
    // Calculate percentage
    result.percentage = ((result.marksObtained / this.totalMarks) * 100).toFixed(2);
    
    // Assign grade based on percentage
    const percentage = result.percentage;
    if (percentage >= 90) result.grade = 'A+';
    else if (percentage >= 80) result.grade = 'A';
    else if (percentage >= 70) result.grade = 'B+';
    else if (percentage >= 60) result.grade = 'B';
    else if (percentage >= 50) result.grade = 'C';
    else if (percentage >= 40) result.grade = 'D';
    else result.grade = 'F';
  });
  next();
});
```

### Fee Status Calculation

**Automatic Status Update** (models/Fee.js):
```javascript
// Pre-save hook calculates due amount and updates status
feeSchema.pre('save', function(next) {
  this.dueAmount = this.totalAmount - this.paidAmount;
  
  // Update status based on payment
  if (this.paidAmount === 0) {
    this.status = 'Pending';
  } else if (this.paidAmount >= this.totalAmount) {
    this.status = 'Paid';
  } else {
    this.status = 'Partial';
  }
  
  // Check if overdue
  if (this.dueDate && new Date() > this.dueDate && this.dueAmount > 0) {
    this.status = 'Overdue';
  }
  
  next();
});
```

## 🔒 Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **JWT Authentication**: Secure token-based authentication
3. **Role-Based Access Control**: Different permissions for admin, teacher, student
4. **Input Validation**: Server-side validation for all inputs
5. **CORS Protection**: Configured CORS policy
6. **Error Handling**: Comprehensive error handling middleware

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile devices (320px and up)
- 📱 Tablets (768px and up)
- 💻 Desktops (1024px and up)
- 🖥️ Large screens (1440px and up)

## 🎨 Dark Mode

Toggle between light and dark themes:
- Click the moon/sun icon in the header
- Preference is saved in localStorage
- Smooth transitions between themes

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change the PORT in `.env` file or kill the process using port 5000

### JWT Token Invalid
**Solution**: Clear browser localStorage and login again

## 📝 Sample Data

Sample data files are provided in the `sample-data/` directory:
- `users.json`: Sample users (admin, teacher, student)
- `classes.json`: Sample class structures
- `fee-categories.json`: Common fee categories

## 🚀 Deployment

### Deploy to Heroku
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Add MongoDB Atlas
heroku addons:create mongolab

# Set environment variables
heroku config:set JWT_SECRET=your_production_secret

# Deploy
git push heroku main
```

### Deploy to Vercel/Netlify
For frontend-only deployment, build the static files and deploy the `public/` directory.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer Notes

- All API responses follow a consistent format: `{ success: boolean, message: string, data: object }`
- Dates are stored in ISO format
- All monetary values are in INR (₹)
- Student/Teacher IDs are unique and auto-generated
- Attendance can only be marked once per class per day
- Exam results automatically calculate percentage and grade

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@schoolmanagement.com or create an issue in the repository.

---

**Built with ❤️ for modern education management**
