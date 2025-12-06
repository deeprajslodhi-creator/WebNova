/**
 * School Management System - Main Application Logic
 * Handles UI interactions, navigation, and data management
 */

// ===== GLOBAL STATE =====
let currentUser = null;
let currentView = 'dashboard';
let attendanceChart = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Check if user is logged in
    const token = getAuthToken();
    const user = getCurrentUser();

    if (token && user) {
        currentUser = user;
        showDashboard();
        loadDashboardData();
    } else {
        showLoginPage();
    }

    // Setup event listeners
    setupEventListeners();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });

    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Add buttons
    document.getElementById('addStudentBtn')?.addEventListener('click', () => showAddStudentModal());
    document.getElementById('addTeacherBtn')?.addEventListener('click', () => showAddTeacherModal());
    document.getElementById('addClassBtn')?.addEventListener('click', () => showAddClassModal());
    document.getElementById('markAttendanceBtn')?.addEventListener('click', () => showMarkAttendanceModal());
    document.getElementById('addExamBtn')?.addEventListener('click', () => showAddExamModal());
    document.getElementById('addFeeBtn')?.addEventListener('click', () => showAddFeeModal());
}

// ===== AUTHENTICATION =====
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = '';

    try {
        const response = await authAPI.login({ username, password });

        if (response.success) {
            // Check if role matches
            if (response.user.role !== role) {
                errorDiv.textContent = 'Invalid role selected';
                return;
            }

            // Save token and user
            setAuthToken(response.token);
            setCurrentUser(response.user);
            currentUser = response.user;

            // Show dashboard
            showDashboard();
            loadDashboardData();
            showToast('Login successful!', 'success');
        }
    } catch (error) {
        errorDiv.textContent = error.message || 'Login failed';
    }
}

function handleLogout() {
    removeAuthToken();
    currentUser = null;
    showLoginPage();
    showToast('Logged out successfully', 'success');
}

// ===== PAGE NAVIGATION =====
function showLoginPage() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('dashboardPage').classList.remove('active');
}

function showDashboard() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');

    // Update user info in header
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.fullName;
        document.getElementById('userRole').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    }
}

function navigateTo(page) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });

    // Update active view
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`${page}View`);
    if (targetView) {
        targetView.classList.add('active');
        currentView = page;

        // Load data for the view
        loadViewData(page);
    }
}

// ===== DATA LOADING =====
async function loadViewData(view) {
    switch (view) {
        case 'dashboard':
            await loadDashboardData();
            break;
        case 'students':
            await loadStudents();
            break;
        case 'teachers':
            await loadTeachers();
            break;
        case 'classes':
            await loadClasses();
            break;
        case 'attendance':
            await loadAttendance();
            break;
        case 'exams':
            await loadExams();
            break;
        case 'fees':
            await loadFees();
            break;
    }
}

// ===== DASHBOARD =====
async function loadDashboardData() {
    try {
        // Load stats
        const statsData = await dashboardAPI.getStats();
        if (statsData.success) {
            document.getElementById('totalStudents').textContent = statsData.stats.totalStudents;
            document.getElementById('totalTeachers').textContent = statsData.stats.totalTeachers;
            document.getElementById('totalClasses').textContent = statsData.stats.totalClasses;
            document.getElementById('attendancePercentage').textContent = statsData.stats.todayAttendance.percentage + '%';
        }

        // Load recent students
        const recentData = await dashboardAPI.getRecentStudents();
        if (recentData.success) {
            displayRecentStudents(recentData.students);
        }

        // Load attendance chart
        const chartData = await dashboardAPI.getAttendanceChart();
        if (chartData.success) {
            renderAttendanceChart(chartData.chartData);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

function displayRecentStudents(students) {
    const container = document.getElementById('recentStudents');
    if (!container) return;

    if (students.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No recent students</p>';
        return;
    }

    container.innerHTML = students.map(student => `
        <div class="list-item">
            <div>
                <strong>${student.userId?.fullName || 'N/A'}</strong>
                <br>
                <small style="color: var(--text-secondary);">${student.studentId} - ${student.class?.className || 'No Class'}</small>
            </div>
            <span class="badge success">${student.status}</span>
        </div>
    `).join('');
}

function renderAttendanceChart(data) {
    const canvas = document.getElementById('attendanceChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (attendanceChart) {
        attendanceChart.destroy();
    }

    attendanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: 'Present',
                    data: data.map(d => d.present),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Absent',
                    data: data.map(d => d.absent),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// ===== STUDENTS =====
async function loadStudents() {
    try {
        const response = await studentsAPI.getAll();
        if (response.success) {
            displayStudentsTable(response.students);
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showToast('Error loading students', 'error');
    }
}

function displayStudentsTable(students) {
    const container = document.getElementById('studentsTable');
    if (!container) return;

    if (students.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No students found</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${students.map(student => `
                    <tr>
                        <td>${student.studentId}</td>
                        <td>${student.userId?.fullName || 'N/A'}</td>
                        <td>${student.class?.className || 'No Class'} ${student.class?.section || ''}</td>
                        <td>${student.userId?.email || 'N/A'}</td>
                        <td>${student.parentPhone || 'N/A'}</td>
                        <td><span class="badge ${student.status === 'Active' ? 'success' : 'danger'}">${student.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="viewStudent('${student._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="editStudent('${student._id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ===== TEACHERS =====
async function loadTeachers() {
    try {
        const response = await teachersAPI.getAll();
        if (response.success) {
            displayTeachersTable(response.teachers);
        }
    } catch (error) {
        console.error('Error loading teachers:', error);
        showToast('Error loading teachers', 'error');
    }
}

function displayTeachersTable(teachers) {
    const container = document.getElementById('teachersTable');
    if (!container) return;

    if (teachers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No teachers found</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Teacher ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subjects</th>
                    <th>Qualification</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${teachers.map(teacher => `
                    <tr>
                        <td>${teacher.teacherId}</td>
                        <td>${teacher.userId?.fullName || 'N/A'}</td>
                        <td>${teacher.userId?.email || 'N/A'}</td>
                        <td>${teacher.subjects?.join(', ') || 'None'}</td>
                        <td>${teacher.qualification || 'N/A'}</td>
                        <td><span class="badge ${teacher.status === 'Active' ? 'success' : 'danger'}">${teacher.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="viewTeacher('${teacher._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="editTeacher('${teacher._id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTeacher('${teacher._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ===== CLASSES =====
async function loadClasses() {
    try {
        const response = await classesAPI.getAll();
        if (response.success) {
            displayClassesTable(response.classes);
        }
    } catch (error) {
        console.error('Error loading classes:', error);
        showToast('Error loading classes', 'error');
    }
}

function displayClassesTable(classes) {
    const container = document.getElementById('classesTable');
    if (!container) return;

    if (classes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No classes found</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Class Name</th>
                    <th>Section</th>
                    <th>Class Teacher</th>
                    <th>Students</th>
                    <th>Capacity</th>
                    <th>Academic Year</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${classes.map(cls => `
                    <tr>
                        <td>${cls.className}</td>
                        <td>${cls.section}</td>
                        <td>${cls.classTeacher?.userId?.fullName || 'Not Assigned'}</td>
                        <td>${cls.students?.length || 0}</td>
                        <td>${cls.capacity}</td>
                        <td>${cls.academicYear}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="viewClass('${cls._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="editClass('${cls._id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteClass('${cls._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ===== ATTENDANCE =====
async function loadAttendance() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await attendanceAPI.getByDate(today);
        if (response.success) {
            displayAttendanceTable(response.attendance);
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
        showToast('Error loading attendance', 'error');
    }
}

function displayAttendanceTable(attendance) {
    const container = document.getElementById('attendanceTable');
    if (!container) return;

    if (attendance.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No attendance records for today</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Class</th>
                    <th>Date</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Marked By</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${attendance.map(att => {
        const present = att.records.filter(r => r.status === 'Present').length;
        const absent = att.records.filter(r => r.status === 'Absent').length;
        return `
                        <tr>
                            <td>${att.class?.className} ${att.class?.section}</td>
                            <td>${new Date(att.date).toLocaleDateString()}</td>
                            <td><span class="badge success">${present}</span></td>
                            <td><span class="badge danger">${absent}</span></td>
                            <td>${att.markedBy?.fullName || 'N/A'}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewAttendance('${att._id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `;
    }).join('')}
            </tbody>
        </table>
    `;
}

// ===== EXAMS =====
async function loadExams() {
    try {
        const response = await examsAPI.getAll();
        if (response.success) {
            displayExamsTable(response.exams);
        }
    } catch (error) {
        console.error('Error loading exams:', error);
        showToast('Error loading exams', 'error');
    }
}

function displayExamsTable(exams) {
    const container = document.getElementById('examsTable');
    if (!container) return;

    if (exams.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No exams found</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Exam Name</th>
                    <th>Type</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Total Marks</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${exams.map(exam => `
                    <tr>
                        <td>${exam.examName}</td>
                        <td><span class="badge info">${exam.examType}</span></td>
                        <td>${exam.class?.className} ${exam.class?.section}</td>
                        <td>${exam.subject}</td>
                        <td>${new Date(exam.examDate).toLocaleDateString()}</td>
                        <td>${exam.totalMarks}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="viewExam('${exam._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="addResults('${exam._id}')">
                                <i class="fas fa-plus"></i> Results
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="exportExam('${exam._id}')">
                                <i class="fas fa-download"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ===== FEES =====
async function loadFees() {
    try {
        const response = await feesAPI.getAll();
        if (response.success) {
            displayFeesTable(response.fees);
        }
    } catch (error) {
        console.error('Error loading fees:', error);
        showToast('Error loading fees', 'error');
    }
}

function displayFeesTable(fees) {
    const container = document.getElementById('feesTable');
    if (!container) return;

    if (fees.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No fee records found</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Student</th>
                    <th>Academic Year</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Due Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${fees.map(fee => `
                    <tr>
                        <td>${fee.student?.userId?.fullName || 'N/A'}</td>
                        <td>${fee.academicYear}</td>
                        <td>₹${fee.totalAmount}</td>
                        <td>₹${fee.paidAmount}</td>
                        <td>₹${fee.dueAmount}</td>
                        <td><span class="badge ${fee.status === 'Paid' ? 'success' : fee.status === 'Pending' ? 'warning' : 'danger'}">${fee.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="viewFee('${fee._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="addPayment('${fee._id}')">
                                <i class="fas fa-money-bill"></i> Pay
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ===== UTILITY FUNCTIONS =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);

    const icon = document.querySelector('#themeToggle i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

// Load theme preference
const savedTheme = localStorage.getItem('darkMode');
if (savedTheme === 'true') {
    document.body.classList.add('dark-mode');
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = 'fas fa-sun';
}

// ===== MODAL FUNCTIONS (Placeholders) =====
function showAddStudentModal() {
    showToast('Add Student feature - Create modal form', 'info');
}

function showAddTeacherModal() {
    showToast('Add Teacher feature - Create modal form', 'info');
}

function showAddClassModal() {
    showToast('Add Class feature - Create modal form', 'info');
}

function showMarkAttendanceModal() {
    showToast('Mark Attendance feature - Create modal form', 'info');
}

function showAddExamModal() {
    showToast('Add Exam feature - Create modal form', 'info');
}

function showAddFeeModal() {
    showToast('Add Fee feature - Create modal form', 'info');
}

// View/Edit/Delete functions (to be implemented with modals)
function viewStudent(id) { showToast('View Student: ' + id, 'info'); }
function editStudent(id) { showToast('Edit Student: ' + id, 'info'); }
async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            await studentsAPI.delete(id);
            showToast('Student deleted successfully', 'success');
            loadStudents();
        } catch (error) {
            showToast('Error deleting student', 'error');
        }
    }
}

function viewTeacher(id) { showToast('View Teacher: ' + id, 'info'); }
function editTeacher(id) { showToast('Edit Teacher: ' + id, 'info'); }
async function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        try {
            await teachersAPI.delete(id);
            showToast('Teacher deleted successfully', 'success');
            loadTeachers();
        } catch (error) {
            showToast('Error deleting teacher', 'error');
        }
    }
}

function viewClass(id) { showToast('View Class: ' + id, 'info'); }
function editClass(id) { showToast('Edit Class: ' + id, 'info'); }
async function deleteClass(id) {
    if (confirm('Are you sure you want to delete this class?')) {
        try {
            await classesAPI.delete(id);
            showToast('Class deleted successfully', 'success');
            loadClasses();
        } catch (error) {
            showToast('Error deleting class', 'error');
        }
    }
}

function viewAttendance(id) { showToast('View Attendance: ' + id, 'info'); }
function viewExam(id) { showToast('View Exam: ' + id, 'info'); }
function addResults(id) { showToast('Add Results for Exam: ' + id, 'info'); }
async function exportExam(id) {
    try {
        const response = await examsAPI.exportResults(id);
        if (response.success) {
            // Download as JSON
            const dataStr = JSON.stringify(response.data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `exam_results_${id}.json`;
            link.click();
            showToast('Results exported successfully', 'success');
        }
    } catch (error) {
        showToast('Error exporting results', 'error');
    }
}

function viewFee(id) { showToast('View Fee: ' + id, 'info'); }
function addPayment(id) { showToast('Add Payment for Fee: ' + id, 'info'); }
