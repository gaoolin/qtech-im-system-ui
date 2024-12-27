import axios from 'axios';

// 动态配置后台地址
const apiClient = axios.create({
  // baseURL: process.env.VUE_APP_API_BASE_URL || `http://localhost:8080`, // 环境变量或默认地址
  baseURL: process.env.VUE_APP_API_BASE_URL || `http://10.170.6.40:30883`, // 环境变量或默认地址
  // baseURL: process.env.VUE_APP_API_BASE_URL || `http://im-service-api-svc.qtech-im-service:8080`, // 生产环境 环境变量或默认地址
  timeout: 5000,
});

// 添加请求拦截器
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token'); // 读取本地 Token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('未授权，请重新登录');
      // 跳转到登录页面
    }
    return Promise.reject(error);
  }
);

// 定义 API 方法
const api = {
  // 获取当前控制模式
  getCurrentControlMode() {
    return apiClient.get('/im/aa/control-mode/current');
  },
  // 获取控制模式列表
  getControlModeList() {
    return apiClient.get('/im/aa/control-mode/list');
  },
  // 更新控制模式
  changeControlMode(mode) {
    return apiClient.post('/im/aa/control-mode', null, {
      params: {mode},
    });
  },
};

export default api;

