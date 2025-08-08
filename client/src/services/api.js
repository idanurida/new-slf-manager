// client/src/services/api.js
import axios from 'axios';
import * as mocks from '../mocks';

// Flag untuk aktifkan mode mock
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

// Utility untuk delay mock
const mockPromise = (data, delay = 300) =>
  new Promise(resolve => setTimeout(() => resolve({ data }), delay));
const mockFailure = (message, delay = 300) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay));

// Axios instance utama
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Template creator mock handler
const createMockHandler = (serviceName, methods) => {
  const handler = {};
  for (const methodName in methods) {
    handler[methodName] = (...args) => {
      if (useMocks) {
        console.log(`MOCK API CALL: ${serviceName}.${methodName}`, ...args);
        return methods[methodName].mock(...args);
      }
      // Mode real API
      const realApiClient = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        realApiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      return methods[methodName].real(realApiClient, ...args);
    };
  }
  return handler;
};

// === MOCK USERS MULTI-ROLE ===
const mockUsers = [
  { email: 'admin@mock.com',        role: 'superadmin',    token: 'mock-jwt-superadmin',    name: 'Super Admin Mock' },
  { email: 'projectadmin@mock.com', role: 'projectadmin',  token: 'mock-jwt-projectadmin',  name: 'Project Admin Mock' },
  { email: 'inspector@mock.com',    role: 'inspector',     token: 'mock-jwt-inspector',     name: 'Inspector Mock' },
  { email: 'client@mock.com',       role: 'client',        token: 'mock-jwt-client',        name: 'Client Mock' },
  { email: 'user@mock.com',         role: 'user',          token: 'mock-jwt-user',          name: 'User Mock' },
];

// === AUTH SERVICE ===
export const authService = createMockHandler('authService', {
  login: {
    mock: (email, password) => {
      console.log('MOCK LOGIN ATTEMPT:', { email, password });

      if (password !== '123') {
        return mockFailure("Invalid mock password. Use '123'.");
      }

      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        return mockFailure('User not found in mock database.');
      }

      const response = {
        token: user.token,
        user: { name: user.name, email: user.email, role: user.role }
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', user.token);
      }

      console.log('MOCK LOGIN SUCCESS:', response);
      return mockPromise(response);
    },
    real: (client, email, password) => client.post('/auth/login', { email, password }),
  },
  register: {
    mock: () => mockPromise({ message: 'Mock registration successful!' }),
    real: (client, userData) => client.post('/auth/register', userData),
  },
  getMe: {
    mock: () => {
      console.log("MOCK API CALL: authService.getMe");
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const user = mockUsers.find(u => u.token === token);
      if (user) {
        // pastikan sama dengan axios format { data: {...} }
        return mockPromise({ 
          name: user.name, 
          email: user.email, 
          role: user.role 
        });
      }
      return mockFailure('No user found for this token.');
    },
    real: (client) => client.get('/auth/me'),
  },
  logout: {
    mock: () => {
      if (typeof window !== 'undefined') localStorage.removeItem('token');
      return Promise.resolve();
    },
    real: () => {
      if (typeof window !== 'undefined') localStorage.removeItem('token');
      return Promise.resolve();
    },
  },
});

// === GENERIC MOCK SERVICE CREATOR ===
const createGenericMockService = (name, methods) => {
  const service = {};
  methods.forEach(method => {
    const isGet = /get|fetch|list/i.test(method);
    service[method] = {
      mock: (...args) => {
        console.log(`GENERIC MOCK: ${name}.${method}`, args);
        return isGet ? mockPromise([]) : mockPromise({ message: 'Success' });
      },
      real: (client, ...args) => {
        console.warn(`Real API call for ${name}.${method} is not fully implemented.`);
        return client.get(`/${name.toLowerCase()}`);
      }
    }
  });
  return createMockHandler(name, service);
};

// === PROJECT SERVICE ===
export const projectService = createMockHandler('projectService', {
  getAllProjects: {
    mock: () => mockPromise(mocks.mockProjects?.data || []),
    real: (client, params = {}) => client.get('/projects', { params }),
  },
  getProjectById: {
    mock: (id) => mockPromise({ ...(mocks.mockProjectDetail?.data || {}), id }),
    real: (client, id) => client.get(`/projects/${id}`),
  },
  createProject: {
    mock: (data) => mockPromise({ ...data, id: `proj-${Date.now()}` }),
    real: (client, data) => client.post('/projects', data),
  },
  updateProject: {
    mock: (id, data) => mockPromise({ ...(mocks.mockProjectDetail?.data || {}), ...data }),
    real: (client, id, data) => client.put(`/projects/${id}`, data),
  },
  deleteProject: {
    mock: () => mockPromise({ message: 'Project deleted' }),
    real: (client, id) => client.delete(`/projects/${id}`),
  },
});

// === INSPECTION SERVICE ===
export const inspectionService = createMockHandler('inspectionService', {
  getProjectInspections: {
    mock: () => mockPromise(mocks.mockInspections?.data || []),
    real: (client, projectId) => client.get(`/inspections/projects/${projectId}/inspections`),
  },
  getChecklistItems: {
    mock: () => mockPromise(mocks.mockChecklistItems?.data || []),
    real: (client, params = {}) => client.get('/inspections/checklist-items', { params }),
  },
  getMyInspections: { 
    mock: () => mockPromise(mocks.mockInspections?.data || []), 
    real: (client) => client.get('/inspections/my-inspections') 
  },
});

// === NOTIFICATION SERVICE ===
export const notificationService = createMockHandler('notificationService', {
  getUserNotifications: {
    mock: () => mockPromise(mocks.mockNotifications?.data || []),
    real: (client, params = {}) => client.get('/notifications', { params }),
  },
  markAsRead: {
    mock: () => mockPromise({}),
    real: (client, id) => client.put(`/notifications/${id}/read`)
  },
  markAllAsRead: {
    mock: () => mockPromise({}),
    real: (client) => client.put('/notifications/read-all')
  }
});

export const userService = createGenericMockService('userService', ['getAllUsers', 'getUserById', 'updateUser', 'deleteUser', 'changePassword']);
export const reportService = createGenericMockService('reportService', ['generatePDF', 'getProjectReports', 'getReportById', 'updateReportStatus', 'approveReport']);

// === ADMIN SERVICE ===
export const adminService = createMockHandler('adminService', {
  getProjectPayments: {
    mock: () => mockPromise(mocks.mockPendingPayments?.data || []),
    real: (client, projectId) => client.get(`/admin/projects/${projectId}/payments`)
  },
  getPaymentById: {
    mock: (id) => mockPromise({ ...(mocks.mockPaymentDetail?.data || {}), id }),
    real: (client, id) => client.get(`/admin/payments/${id}`)
  },
  verifyPayment: {
    mock: () => mockPromise({ message: 'Payment verified' }),
    real: (client, id) => client.put(`/admin/payments/${id}/verify`)
  },
  getProjectQuotations: {
    mock: () => mockPromise(mocks.mockProjectQuotations?.data || []),
    real: (client, projectId) => client.get(`/admin/projects/${projectId}/quotations`)
  },
  getProjectContracts: {
    mock: () => mockPromise(mocks.mockProjectContracts?.data || []),
    real: (client, projectId) => client.get(`/admin/projects/${projectId}/contracts`)
  }
});

// === SCHEDULE SERVICE ===
export const scheduleService = createMockHandler('scheduleService', {
  createScheduleRequest: {
    mock: (data) => mockPromise({ ...data, id: `sch-${Date.now()}`, status: 'Pending Client Approval' }),
    real: (client, data) => client.post('/schedules', data)
  },
  getProjectScheduleRequests: {
    mock: (projectId) => mockPromise((mocks.mockSchedules?.data || []).filter(s => s.projectId === projectId)),
    real: (client, projectId) => client.get(`/schedules/project/${projectId}`)
  },
  getClientPendingSchedules: {
    mock: () => mockPromise((mocks.mockSchedules?.data || []).filter(s => s.status === 'Pending Client Approval')),
    real: (client) => client.get('/schedules/client/pending')
  },
  approveSchedule: {
    mock: (id) => {
      const schedule = (mocks.mockSchedules?.data || []).find(s => s.id === id);
      if(schedule) schedule.status = 'Confirmed';
      return mockPromise({ message: 'Schedule approved' });
    },
    real: (client, id) => client.post(`/schedules/${id}/approve`)
  },
  rejectSchedule: {
    mock: (id) => {
      const schedule = (mocks.mockSchedules?.data || []).find(s => s.id === id);
      if(schedule) schedule.status = 'Rejected';
      return mockPromise({ message: 'Schedule rejected' });
    },
    real: (client, id) => client.post(`/schedules/${id}/reject`)
  }
});

// === TODO SERVICE ===
export const todoService = createMockHandler('todoService', {
  getTodosByRole: {
    mock: (role) => mockPromise(mocks.getTodosByRole ? mocks.getTodosByRole(role) : []),
    real: (client, role) => client.get(`/todos/${role}`)
  },
  addTodo: {
    mock: (role, todo) => mockPromise({ ...todo, id: Date.now() }),
    real: (client, role, todo) => client.post(`/todos/${role}`, todo)
  },
  updateTodoStatus: {
    mock: (id, completed) => mockPromise({ id, completed }),
    real: (client, id, completed) => client.put(`/todos/${id}`, { completed })
  }
});

export const approvalService = createGenericMockService('approvalService', ['getPendingApprovals', 'approveByRole', 'rejectByRole', 'getApprovalHistory']);

export default apiClient;
