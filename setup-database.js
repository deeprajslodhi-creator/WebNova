const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');

/**
 * Database Setup Script
 * Creates initial admin user and sample data
 */

async function setupDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Student.deleteMany({});
        await Teacher.deleteMany({});
        await Class.deleteMany({});
        console.log('✅ Existing data cleared');

        // Create Admin User
        console.log('👤 Creating admin user...');
        const adminUser = new User({
            username: 'admin',
            email: 'admin@school.com',
            password: 'admin123', // Will be hashed automatically
            role: 'admin',
            fullName: 'Admin User',
            phone: '1234567890',
            address: 'School Main Office'
        });
        await adminUser.save();
        console.log('✅ Admin user created');
        console.log('   Username: admin');
        console.log('   Password: admin123');

        // Create Sample Teacher Users
        console.log('👨‍🏫 Creating sample teachers...');

        const teacher1User = new User({
            username: 'teacher1',
            email: 'john.smith@school.com',
            password: 'teacher123',
            role: 'teacher',
            fullName: 'John Smith',
            phone: '9876543210',
            address: '123 Teacher Street'
        });
        await teacher1User.save();

        const teacher2User = new User({
            username: 'teacher2',
            email: 'sarah.johnson@school.com',
            password: 'teacher123',
            role: 'teacher',
            fullName: 'Sarah Johnson',
            phone: '9876543211',
            address: '456 Teacher Avenue'
        });
        await teacher2User.save();

        // Create Teacher Records
        const teacher1 = new Teacher({
            userId: teacher1User._id,
            employeeId: 'EMP001',
            joiningDate: new Date('2020-01-15'),
            qualification: 'M.Sc. Mathematics',
            experience: 5,
            subjects: ['Mathematics', 'Physics'],
            specialization: 'Mathematics',
            salary: 50000,
            dateOfBirth: new Date('1990-05-15'),
            gender: 'Male',
            bloodGroup: 'O+',
            emergencyContact: '9999999999'
        });
        await teacher1.save();

        const teacher2 = new Teacher({
            userId: teacher2User._id,
            employeeId: 'EMP002',
            joiningDate: new Date('2019-08-20'),
            qualification: 'M.A. English',
            experience: 6,
            subjects: ['English', 'Social Studies'],
            specialization: 'English Literature',
            salary: 48000,
            dateOfBirth: new Date('1988-11-22'),
            gender: 'Female',
            bloodGroup: 'A+',
            emergencyContact: '9999999998'
        });
        await teacher2.save();

        console.log('✅ Sample teachers created');

        // Create Sample Classes
        console.log('🏫 Creating sample classes...');

        const class7A = new Class({
            className: 'Class 7',
            section: 'A',
            classTeacher: teacher1._id,
            academicYear: '2024-2025',
            capacity: 40,
            room: 'Room 701',
            subjects: [
                { subjectName: 'Mathematics', teacher: teacher1._id },
                { subjectName: 'English', teacher: teacher2._id },
                { subjectName: 'Science', teacher: teacher1._id },
                { subjectName: 'Social Studies', teacher: teacher2._id }
            ]
        });
        await class7A.save();

        const class8A = new Class({
            className: 'Class 8',
            section: 'A',
            classTeacher: teacher2._id,
            academicYear: '2024-2025',
            capacity: 35,
            room: 'Room 801',
            subjects: [
                { subjectName: 'Mathematics', teacher: teacher1._id },
                { subjectName: 'English', teacher: teacher2._id },
                { subjectName: 'Science', teacher: teacher1._id },
                { subjectName: 'Social Studies', teacher: teacher2._id }
            ]
        });
        await class8A.save();

        console.log('✅ Sample classes created');

        // Create Sample Student Users
        console.log('👨‍🎓 Creating sample students...');

        const studentUsers = [];
        const students = [];

        for (let i = 1; i <= 5; i++) {
            const studentUser = new User({
                username: `student${i}`,
                email: `student${i}@school.com`,
                password: 'student123',
                role: 'student',
                fullName: `Student ${i}`,
                phone: `555000000${i}`,
                address: `${i} Student Lane`
            });
            await studentUser.save();
            studentUsers.push(studentUser);

            const student = new Student({
                userId: studentUser._id,
                admissionNumber: `ADM2024000${i}`,
                admissionDate: new Date('2024-04-01'),
                class: i <= 3 ? class7A._id : class8A._id,
                rollNumber: i <= 3 ? i : i - 3,
                dateOfBirth: new Date(`2010-0${i}-15`),
                gender: i % 2 === 0 ? 'Female' : 'Male',
                bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-'][i - 1],
                parentName: `Parent of Student ${i}`,
                parentPhone: `999000000${i}`,
                parentEmail: `parent${i}@email.com`,
                emergencyContact: `888000000${i}`,
                previousSchool: i === 1 ? 'New Admission' : 'Previous School',
                medicalInfo: 'No known allergies'
            });
            await student.save();
            students.push(student);

            // Add student to class
            if (i <= 3) {
                class7A.students.push(student._id);
            } else {
                class8A.students.push(student._id);
            }
        }

        await class7A.save();
        await class8A.save();

        console.log('✅ Sample students created');

        // Summary
        console.log('\n📊 Database Setup Complete!');
        console.log('================================');
        console.log(`✅ Users created: ${await User.countDocuments()}`);
        console.log(`✅ Teachers created: ${await Teacher.countDocuments()}`);
        console.log(`✅ Students created: ${await Student.countDocuments()}`);
        console.log(`✅ Classes created: ${await Class.countDocuments()}`);
        console.log('================================');
        console.log('\n🔑 Login Credentials:');
        console.log('--------------------------------');
        console.log('Admin:');
        console.log('  Username: admin');
        console.log('  Password: admin123');
        console.log('  Role: admin');
        console.log('\nTeacher:');
        console.log('  Username: teacher1');
        console.log('  Password: teacher123');
        console.log('  Role: teacher');
        console.log('\nStudent:');
        console.log('  Username: student1');
        console.log('  Password: student123');
        console.log('  Role: student');
        console.log('================================\n');

        // Close connection
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error setting up database:', error);
        process.exit(1);
    }
}

// Run setup
setupDatabase();
