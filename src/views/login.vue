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
              <input id="username" type="text" v-model="username" placeholder="请输入工号" required />
            </div>
          </div>

          <div class="input-group">
            <label for="password">密码</label>
            <div class="input-icon-wrapper">
              <i class="icon lock-icon"></i>
              <input id="password" type="password" v-model="password" placeholder="请输入密码" required />
            </div>
          </div>

          <button type="submit" class="login-button" :disabled="loading">
            <span v-if="loading">登录中...</span>
            <span v-else>登录</span>
          </button>
          <div class="options">
            <label><input type="checkbox" v-model="rememberMe" /> 记住我</label>
            <a href="#" class="forgot-password" @click.prevent="openDialog">忘记密码？</a>
          </div>
        </form>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- 忘记密码对话框 -->
    <div v-if="showDialog" class="custom-dialog-overlay">
      <div class="custom-dialog">
        <h2 class="dialog-title">提示</h2>
        <p class="dialog-message">账号、密码、权限等问题钉钉联系高志林。</p>
        <button @click="closeDialog" class="dialog-button">关闭</button>
      </div>
    </div>

    <div class="contact-info">
      <i class="icon info-icon"></i> 系统问题联系人：高志林
    </div>

    <!-- Copyright 信息 -->
    <div class="copyright-info">
      © 2024 智能制造管理系统. All rights reserved.
    </div>

  </div>
</template>


<script>
// import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { Message } from 'element-ui'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      rememberMe: false,
      errorMessage: '',
      loading: false,
      redirect: undefined,
      showDialog: false, // 控制忘记密码对话框显示状态
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  created() {
    this.getCookie();
  },
  methods: {
    getCookie() {
      // 获取cookie
      const username = Cookies.get('username');
      const password = Cookies.get('password');
      const rememberMe = Cookies.get('rememberMe')
      this.username = username === undefined ? this.username : username;
      this.password = password === undefined ? this.password : decrypt(password);
      this.rememberMe = rememberMe === undefined ? false : Boolean(rememberMe);
    },
    async handleLogin() {
      this.errorMessage = '';
      this.loading = true;
      try {
        // 保存cookie
        if (this.rememberMe) {
          Cookies.set('username', this.username, { expires: 30 });
          Cookies.set('password', encrypt(this.password), { expires: 30 });
          Cookies.set('rememberMe', this.rememberMe, { expires: 30 });
        } else {
          Cookies.remove("username");
          Cookies.remove("password");
          Cookies.remove('rememberMe');
        }
        // 登录请求
        await this.$store.dispatch('Login', {
          username: this.username,
          password: this.password
        }).then(() => {
          // 1、跳到登录后指定跳转的页面或者登录后跳到首页
          // this.$router.push({ path: this.redirect || '/' }).catch(() => {})
          // 2、登录后跳到路由默认的第一个路由页面
          this.$store.dispatch('GetInfo').then(res => {
            // 拉取完user_info信息
            const roles = res.roles
            this.$store.dispatch('GenerateRoutes', { roles }).then(accessRoutes => {
              // 根据roles权限生成可访问的路由表
              // console.log(accessRoutes)
              this.$router.addRoutes(accessRoutes) // 动态添加可访问路由表
              let pathIndex = ''
              pathIndex = accessRoutes[0].path + '/' + accessRoutes[0].children[0].path // 设置默认首页地址indexPage
              // console.log(this.redirect, pathIndex)
              // 1、this.redirect == undefined,主要针对直接从http://172.16.6.205:9090/login，登入系统。
              // 2、this.redirect == '/'、 '/index'，主要针对直接从这个http://172.16.6.205:9090/login?redirect=%2F，登入系统。因为没有设置重定向的路由
              // 如果登录的时候出现1、2两种情况，那么就跳到路由的第一个路由页面，如果登录的时候，有设置可以访问的重定向地址，那么登录后就跳到重定向地址。
              if (pathIndex !== '') {
                this.$router.push({ path: this.redirect === '/' || this.redirect === '/index' || this.redirect === undefined ? pathIndex : this.redirect }).catch(() => {
                }) // 跳转重定向页面或跳到默认首页indexPage
              }
            })
          }).catch(err => {
            this.$store.dispatch('LogOut').then(() => {
              Message.error(err)
              next({ path: '/login' })
            })
          })
        });
      } catch (error) {
        this.loading = false;
        this.errorMessage = error.message;
      };
    },
    openDialog() {
      this.showDialog = true;
    },
    closeDialog() {
      this.showDialog = false;
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
  background: linear-gradient(135deg, #b2ebf2, #4fc3f7);
  /* 明亮的渐变背景 */
  /* background-image: url("../assets/images/design.webp"); */
  background-size: cover;
}

.login-panel {
  display: flex;
  width: 800px;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.left-panel {
  flex: 1;
  padding: 40px;
  background-color: #e0f7fa;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #00796b;
}

.system-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #00796b;
}

.description {
  font-size: 14px;
  color: #00695c;
}

.right-panel {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
}

.login-form h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #00796b;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 14px;
  color: #00695c;
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
  border: 1px solid #b2ebf2;
  outline: none;
  font-size: 14px;
  background-color: #e0f7fa;
  /* color: #00796b; */
  color: #000;
  font-weight: bolder;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-color: #4fc3f7;
  box-shadow: 0 0 5px rgba(79, 195, 247, 0.5);
}

.login-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4fc3f7, #0097a7);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background 0.3s ease;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #0097a7, #4fc3f7);
}

.login-button:disabled {
  background-color: #80deea;
}

.options {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #00796b;
  margin-top: 15px;
}

.forgot-password {
  /* color: #4fc3f7; */
  text-decoration: underline;
}

.error-message {
  color: #d32f2f;
  font-size: 14px;
  margin-top: 15px;
}

.custom-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.custom-dialog {
  width: 350px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
  color: #00796b;
  margin-bottom: 10px;
}

.dialog-message {
  font-size: 15px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20px;
  vertical-align: middle;
  display: inline-block;
}

.dialog-button {
  padding: 10px 20px;
  background-color: #4fc3f7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.dialog-button:hover {
  background-color: #0097a7;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.contact-info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  font-size: 16px;
  color: #00796b;
  background-color: rgba(224, 247, 250, 0.8);
  /* 浅色背景框 */
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  font-weight: bold;
}

.contact-info .icon {
  margin-right: 8px;
  color: #4fc3f7;
  font-size: 18px;
}

.copyright-info {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #888888;
  text-align: center;
}
</style>
