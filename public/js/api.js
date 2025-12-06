/**
 * API Configuration and Helper Functions
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Set auth token in localStorage
const setAuthToken = (token) => {
    localStorage.setItem('authToken');
};

// Remove auth token
const removeAuthToken = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
};

// Get current user
const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Set current user
const setCurrentUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data
 */
const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// ===== AUTH API =====
const authAPI = {
    login: async (credentials) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    register: async (userData) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    verify: async () => {
        return apiRequest('/auth/verify');
    }
};

// ===== STUDENTS API =====
const studentsAPI = {
    getAll: async () => {
        return apiRequest('/students');
    },

    getById: async (id) => {
        return apiRequest(`/students/${id}`);
    },

    create: async (studentData) => {
        return apiRequest('/students', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
    },

    update: async (id, studentData) => {
        return apiRequest(`/students/${id}`, {
            method: 'PUT',
            body: JSON.stringify(studentData)
        });
    },

    delete: async (id) => {
        return apiRequest(`/students/${id}`, {
            method: 'DELETE'
        });
    }
};

// ===== TEACHERS API =====
const teachersAPI = {
    getAll: async () => {
        return apiRequest('/teachers');
    },

    getById: async (id) => {
        return apiRequest(`/teachers/${id}`);
    },

    create: async (teacherData) => {
        return apiRequest('/teachers', {
            method: 'POST',
            body: JSON.stringify(teacherData)
        });
    },

    update: async (id, teacherData) => {
        return apiRequest(`/teachers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(teacherData)
        });
    },

    delete: async (id) => {
        return apiRequest(`/teachers/${id}`, {
            method: 'DELETE'
        });
    },

    assignSubjects: async (id, subjects) => {
        return apiRequest(`/teachers/${id}/subjects`, {
            method: 'PUT',
            body: JSON.stringify({ subjects })
        });
    }
};

// ===== CLASSES API =====
const classesAPI = {
    getAll: async () => {
        return apiRequest('/classes');
    },

    getById: async (id) => {
        return apiRequest(`/classes/${id}`);
    },

    create: async (classData) => {
        return apiRequest('/classes', {
            method: 'POST',
            body: JSON.stringify(classData)
        });
    },

    update: async (id, classData) => {
        return apiRequest(`/classes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(classData)
        });
    },

    delete: async (id) => {
        return apiRequest(`/classes/${id}`, {
            method: 'DELETE'
        });
    },

    addStudents: async (id, studentIds) => {
        return apiRequest(`/classes/${id}/students`, {
            method: 'POST',
            body: JSON.stringify({ studentIds })
        });
    },

    removeStudent: async (classId, studentId) => {
        return apiRequest(`/classes/${classId}/students/${studentId}`, {
            method: 'DELETE'
        });
    },

    promoteStudents: async (fromClassId, toClassId, studentIds) => {
        return apiRequest('/classes/promote', {
            method: 'POST',
            body: JSON.stringify({ fromClassId, toClassId, studentIds })
        });
    }
};

// ===== ATTENDANCE API =====
const attendanceAPI = {
    mark: async (attendanceData) => {
        return apiRequest('/attendance', {
            method: 'POST',
            body: JSON.stringify(attendanceData)
        });
    },

    update: async (id, records) => {
        return apiRequest(`/attendance/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ records })
        });
    },

    getByClass: async (classId, startDate, endDate) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return apiRequest(`/attendance/class/${classId}?${params}`);
    },

    getByStudent: async (studentId, startDate, endDate) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return apiRequest(`/attendance/student/${studentId}?${params}`);
    },

    getSummary: async (classId, period) => {
        return apiRequest(`/attendance/summary/${classId}?period=${period}`);
    },

    getByDate: async (date) => {
        return apiRequest(`/attendance/date/${date}`);
    }
};

// ===== EXAMS API =====
const examsAPI = {
    getAll: async () => {
        return apiRequest('/exams');
    },

    getById: async (id) => {
        return apiRequest(`/exams/${id}`);
    },

    create: async (examData) => {
        return apiRequest('/exams', {
            method: 'POST',
            body: JSON.stringify(examData)
        });
    },

    update: async (id, examData) => {
        return apiRequest(`/exams/${id}`, {
            method: 'PUT',
            body: JSON.stringify(examData)
        });
    },

    delete: async (id) => {
        return apiRequest(`/exams/${id}`, {
            method: 'DELETE'
        });
    },

    addResults: async (id, results) => {
        return apiRequest(`/exams/${id}/results`, {
            method: 'POST',
            body: JSON.stringify({ results })
        });
    },

    getByStudent: async (studentId) => {
        return apiRequest(`/exams/student/${studentId}`);
    },

    exportResults: async (id) => {
        return apiRequest(`/exams/${id}/export`);
    }
};

// ===== FEES API =====
const feesAPI = {
    getAll: async () => {
        return apiRequest('/fees');
    },

    getByStudent: async (studentId) => {
        return apiRequest(`/fees/student/${studentId}`);
    },

    getDueFees: async () => {
        return apiRequest('/fees/due');
    },

    create: async (feeData) => {
        return apiRequest('/fees', {
            method: 'POST',
            body: JSON.stringify(feeData)
        });
    },

    addPayment: async (id, paymentData) => {
        return apiRequest(`/fees/${id}/payment`, {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    },

    getReceipt: async (feeId, paymentIndex) => {
        return apiRequest(`/fees/receipt/${feeId}/${paymentIndex}`);
    },

    update: async (id, feeData) => {
        return apiRequest(`/fees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(feeData)
        });
    },

    delete: async (id) => {
        return apiRequest(`/fees/${id}`, {
            method: 'DELETE'
        });
    }
};

// ===== DASHBOARD API =====
const dashboardAPI = {
    getStats: async () => {
        return apiRequest('/dashboard/stats');
    },

    getRecentStudents: async () => {
        return apiRequest('/dashboard/recent-students');
    },

    getAttendanceChart: async () => {
        return apiRequest('/dashboard/attendance-chart');
    },

    getClassDistribution: async () => {
        return apiRequest('/dashboard/class-distribution');
    }
};
