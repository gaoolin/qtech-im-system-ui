<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">反控模式管理</h1>
      <p class="page-subtitle">管理并切换当前设备的反控模式</p>
    </div>

    <!-- 内容区域 -->
    <div class="content-container">
      <!-- 模式状态卡片 -->
      <div class="mode-card" :class="currentModeClass">
        <h2 class="card-title">当前反控模式</h2>
        <div class="mode-status">
          <span class="mode-label">当前模式：</span>
          <span class="mode-value">{{ currentMode }}</span>
        </div>
        <p class="mode-description">{{ currentModeDescription }}</p>
      </div>

      <!-- 模式切换卡片 -->
      <div class="mode-control-card">
        <h2 class="card-title">切换反控模式</h2>
        <div class="control-form">
          <label for="mode-select" class="form-label">选择新的反控模式</label>
          <select id="mode-select" class="form-select" v-model="selectedMode">
            <option v-for="mode in modeList" :key="mode" :value="mode">
              {{ getModeLabel(mode) }}
            </option>
          </select>
          <button class="update-button" @click="updateControlMode" v-hasPermi="['aa:control:mode:ctrl']">
            更新
          </button>
        </div>
      </div>

      <!-- 模式解释卡片 -->
      <div class="mode-explanation-card">
        <h2 class="card-title">反控模式解释</h2>
        <ul class="mode-explanation-list">
          <li v-for="(desc, mode) in modeDescriptions" :key="mode">
            <strong>{{ getModeLabel(mode) }}：</strong> {{ desc }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 响应消息 -->
    <div v-if="responseMessage" :class="['response-message', responseMessageType]">
      <p>{{ responseMessage }}</p>
    </div>
  </div>
</template>

<script>
import api from '@/api/biz/aa/home/api'; // 根据您的路径调整

export default {
  name: 'ControlModeManager',
  data() {
    return {
      currentMode: '', // 当前反控模式
      modeList: [], // 反控模式列表
      selectedMode: '', // 用户选择的反控模式
      responseMessage: '', // 响应消息文本
      responseMessageType: '', // 响应消息类型：'success' 或 'error'
      modeDescriptions: {
        DEFAULT: '设备将按照工作时间（周一至周五，9点至17点）受控运行，其余时间放行。',
        ALWAYS_NULL: '设备始终处于放行状态，不执行停机命令',
        ALWAYS_RETURN: '设备始终处于受控状态，执行停机命令',
      },
    };
  },
  computed: {
    currentModeClass() {
      return {
        'mode-default': this.currentMode === 'DEFAULT',
        'mode-always-null': this.currentMode === 'ALWAYS_NULL',
        'mode-always-return': this.currentMode === 'ALWAYS_RETURN',
        'warning-blink': this.currentMode === 'DEFAULT',
        'error-blink': this.currentMode === 'ALWAYS_NULL',
      };
    },
    currentModeDescription() {
      return this.modeDescriptions[this.currentMode] || '未知模式';
    },
  },
  created() {
    this.fetchControlModeList();
    this.fetchCurrentControlMode();
  },
  methods: {
    fetchCurrentControlMode() {
      api.getCurrentControlMode()
        .then((response) => {
          this.currentMode = response.data.data;
          this.selectedMode = this.currentMode;
        })
        .catch((error) => {
          console.error('获取当前反控模式失败：', error);
        });
    },
    fetchControlModeList() {
      api.getControlModeList()
        .then((response) => {
          this.modeList = response.data.data;
        })
        .catch((error) => {
          console.error('获取反控模式列表失败：', error);
        });
    },
    updateControlMode() {
      if (!this.selectedMode) {
        this.responseMessage = '请选择反控模式！';
        this.responseMessageType = 'error';
        return;
      }
      api.changeControlMode(this.selectedMode)
        .then((response) => {
          this.responseMessage = response.data.message;
          this.responseMessageType = 'success';
          this.fetchCurrentControlMode();
        })
        .catch((error) => {
          this.responseMessage = error.response?.data?.message || '更新失败';
          this.responseMessageType = 'error';
        });
    },
    getModeLabel(mode) {
      const labels = {
        DEFAULT: '默认模式',
        ALWAYS_NULL: '常关模式',
        ALWAYS_RETURN: '常开模式',
      };
      return labels[mode] || mode;
    },
  },
};
</script>

<style scoped>
.page-container {
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f4f6f8;
  color: #333;
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
}

.content-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.mode-card,
.mode-control-card,
.mode-explanation-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 1 1 calc(30% - 40px);
  max-width: 400px;
  min-width: 300px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.mode-status {
  font-size: 16px;
  margin-bottom: 10px;
}

.mode-label {
  font-weight: bold;
}

.mode-value {
  font-size: 16px;
  font-weight: bold;
}

.mode-description {
  font-size: 14px;
  color: #666;
}

.control-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-size: 14px;
}

.form-select {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.update-button {
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  background-color: #48c774;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.update-button:hover {
  background-color: #3aa167;
}

.response-message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
  text-align: center;
}

.response-message.success {
  background-color: #d4edda;
  color: #155724;
}

.response-message.error {
  background-color: #f8d7da;
  color: #721c24;
}

.mode-explanation-list {
  list-style-type: none;
  padding: 0;
}

.mode-explanation-list li {
  font-size: 14px;
  margin-bottom: 5px;
}

.mode-card.mode-default {
  background-color: #f1d254;
}

.mode-card.mode-always-null {
  background-color: #ff4444;
}

.mode-card.mode-always-return {
  background-color: #48c774;
}

.mode-card.warning-blink {
  animation: warning-blink 1.5s infinite alternate;
}

.mode-card.error-blink {
  animation: error-blink 1.5s infinite alternate;
}

@keyframes warning-blink {
  0% {
    background-color: #fff;
  }
  100% {
    background-color: #f1d254;
  }
}

@keyframes error-blink {
  0% {
    background-color: #fff;
  }
  100% {
    background-color: #ff4444;
  }
}
</style>
