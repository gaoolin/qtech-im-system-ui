<template>
  <div class="control-mode-container compact" :class="{ 'warning-blink': currentMode === 'DEFAULT', 'error-blink': currentMode === 'ALWAYS_NULL', 'success-state': currentMode === 'ALWAYS_RETURN' }">
    <div class="control-mode-card compact">
      <!-- 当前模式展示 -->
      <div class="control-mode-current">
        <span class="control-mode-label">当前反控模式：</span>
        <span class="control-mode-value" :class="currentModeClass">{{ currentMode }}</span>
      </div>

      <!-- 当前模式说明 -->
      <div class="control-mode-description">
        <span class="description-text">{{ currentModeDescription }}</span>
      </div>

      <!-- 控制模式切换 -->
      <div class="control-mode-switch">
        <select id="mode-select" class="mode-select" v-model="selectedMode">
          <option v-for="mode in modeList" :key="mode" :value="mode">
            {{ mode }}
          </option>
        </select>
      </div>

      <!-- 更新按钮 -->
      <div class="control-mode-action">
        <button class="update-button" @click="updateControlMode" v-hasPermi="['aa:params:mode:ctrl']">更新</button>
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
      currentMode: '', // 当前控制模式
      modeList: [], // 控制模式列表
      selectedMode: '', // 用户选择的控制模式
      responseMessage: '', // 响应消息文本
      responseMessageType: '' // 响应消息类型：'success' 或 'error'
    };
  },
  computed: {
    currentModeClass() {
      return `mode-${this.currentMode.toLowerCase()}`;
    },
    currentModeDescription() {
      // 根据当前模式生成说明文本
      switch (this.currentMode) {
        case 'DEFAULT':
          return '周一到周五，九点到五点';
        case 'ALWAYS_NULL':
          return '常关';
        case 'ALWAYS_RETURN':
          return '常开';
        default:
          return '未知模式';
      }
    }
  },
  created() {
    this.fetchControlModeList();
    this.fetchCurrentControlMode();
  },
  methods: {
    // 获取当前控制模式
    fetchCurrentControlMode() {
      api.getCurrentControlMode()
        .then((response) => {
          this.currentMode = response.data.data; // 假设后端返回的数据在 data.data 中
          this.selectedMode = this.currentMode; // 默认选择当前模式
        })
        .catch((error) => {
          console.error('获取当前控制模式失败：', error);
        });
    },
    // 获取控制模式列表
    fetchControlModeList() {
      api.getControlModeList()
        .then((response) => {
          this.modeList = response.data.data; // 假设后端返回的数据在 data.data 中
        })
        .catch((error) => {
          console.error('获取控制模式列表失败：', error);
        });
    },
    // 更新控制模式
    updateControlMode() {
      if (!this.selectedMode) {
        this.responseMessage = '请选择控制模式！';
        this.responseMessageType = 'error';
        return;
      }
      api.changeControlMode(this.selectedMode)
        .then((response) => {
          this.responseMessage = response.data.message;
          this.responseMessageType = 'success';
          this.fetchCurrentControlMode(); // 更新当前模式
        })
        .catch((error) => {
          this.responseMessage = error.response?.data?.message || '更新失败';
          this.responseMessageType = 'error';
        });
    }
  }
};
</script>

<style scoped>
.control-mode-container {
  width: 100%;
  padding: 10px 20px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}

.control-mode-container.compact {
  padding: 5px 10px;
}

.control-mode-description {
  margin-top: 5px;
}

.description-text {
  font-size: 12px;
  color: #666;
}

.control-mode-container.warning-blink {
  background-color: #f1d254;
  animation: warning-blink 1.5s infinite alternate;
}

.control-mode-container.error-blink {
  background-color: #ff4444;
  animation: error-blink 1.5s infinite alternate;
}

.control-mode-container.success-state {
  background-color: #a8d5ba;
  color: #155724;
}

@keyframes warning-blink {
  0% {
    background-color: #FFFFFF;
  }
  100% {
    background-color: #f1d254;
  }
}

@keyframes error-blink {
  0% {
    background-color: #FFFFFF;
  }
  100% {
    background-color: #cc0000;
  }
}

.control-mode-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.control-mode-card.compact {
  padding: 5px;
}

.control-mode-current {
  flex: 1;
}

.control-mode-label {
  font-weight: bold;
  color: #333;
}

.control-mode-value {
  font-size: 14px;
  font-weight: bold;
  margin-left: 5px;
}

.mode-always_return {
  color: #2e7d32; /* 稳重绿色 */
}

.mode-default {
  color: #bc5100; /* 稳重橙色 */
}

.mode-always_null {
  color: #c62828; /* 稳重红色 */
}

.control-mode-switch {
  flex: 2;
  text-align: center;
}

.mode-select {
  padding: 3px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  max-width: 150px;
}

.control-mode-action {
  flex: 1;
  text-align: right;
}

.update-button {
  padding: 5px 15px;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  background-color: #48c774; /* 清新绿色 */
  border: none;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.update-button:hover {
  background-color: #3aa167; /* 深一点的绿色，表示交互 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.update-button:active {
  background-color: #2f8655; /* 点击时的颜色 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.update-button:disabled {
  background-color: #c8e6c9; /* 浅灰绿色，表示不可点击 */
  color: #757575;
  cursor: not-allowed;
}

.response-message {
  margin-top: 10px;
  padding: 8px;
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
</style>
