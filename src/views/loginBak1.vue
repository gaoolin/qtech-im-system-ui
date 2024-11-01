<template>
  <div class="login-container">
    <div class="login-panel">
      <div class="left-panel">
        <h1 class="system-title">智能制造管理系统</h1>
        <p class="description">欢迎使用智能制造管理系统，提升生产效率与管理智能化水平。</p>
      </div>
      <div class="right-panel">
        <form @submit.prevent="handleLogin" class="login-form">
          <h2>登录您的账号</h2>

          <div class="input-group">
            <label for="username">工号</label>
            <div class="input-icon-wrapper">
              <i class="icon user-icon"></i>
              <input
                id="username"
                type="text"
                v-model="username"
                placeholder="请输入工号"
                required
              />
            </div>
          </div>

          <div class="input-group">
            <label for="password">密码</label>
            <div class="input-icon-wrapper">
              <i class="icon lock-icon"></i>
              <input
                id="password"
                type="password"
                v-model="password"
                placeholder="请输入密码"
                required
              />
            </div>
          </div>

          <button type="submit" class="login-button" :disabled="loading">
            <span v-if="loading">登录中...</span>
            <span v-else>登录</span>
          </button>
          <div class="options">
            <label><input type="checkbox" v-model="rememberMe" /> 记住我</label>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>
        </form>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      rememberMe: false,
      errorMessage: '',
      loading: false,
    };
  },
  methods: {
    async handleLogin() {
      this.errorMessage = '';
      this.loading = true;

      // 模拟登录请求
      setTimeout(() => {
        if (this.username === 'admin' && this.password === '123456') {
          alert('登录成功！');
        } else {
          this.errorMessage = '用户名或密码错误';
        }
        this.loading = false;
      }, 1000); // 1秒后模拟请求结束
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #0a0f29, #222f45);
}

.login-panel {
  display: flex;
  width: 800px;
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.left-panel {
  flex: 1;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #d1e6f2;
}

.system-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #4fc3f7;
}

.description {
  font-size: 14px;
  color: #a6b8ca;
}

.right-panel {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
}

.login-form h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #fff;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 14px;
  color: #a6b8ca;
  margin-bottom: 5px;
}

.input-icon-wrapper {
  position: relative;
}

.icon {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  color: #4fc3f7;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 12px 15px 12px 40px;
  border-radius: 4px;
  border: none;
  outline: none;
  font-size: 14px;
  background-color: #333f5c;
  color: #fff;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-color: #4fc3f7; /* 焦点边框颜色 */
  box-shadow: 0 0 5px rgba(79, 195, 247, 0.5); /* 阴影效果 */
}

.login-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4fc3f7, #307db3);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background 0.3s ease;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #307db3, #4fc3f7);
}

.login-button:disabled {
  background-color: #6c757d; /* 禁用状态的按钮颜色 */
}

.options {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #a6b8ca;
  margin-top: 15px;
}

.forgot-password {
  color: #4fc3f7;
  text-decoration: underline;
}

.error-message {
  color: #ff6b6b;
  font-size: 14px;
  margin-top: 15px;
}
</style>
