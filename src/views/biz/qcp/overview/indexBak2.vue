<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <form class="query-form" @submit.prevent="handleQuery">
      <div class="form-item">
        <label for="factoryName">厂区:</label>
        <select v-model="queryParams.factoryName" @change="handleFilter">
          <option value="">请选择厂区</option>
          <option v-for="option in factoryOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>
      <div class="form-item">
        <label for="groupName">车间:</label>
        <select v-model="queryParams.groupName" @change="handleFilter">
          <option value="">请选择车间</option>
          <option v-for="option in workshopOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>
      <div class="form-item">
        <label for="deviceType">设备类型:</label>
        <select v-model="queryParams.deviceType" @change="handleFilter">
          <option value="">请选择设备类型</option>
          <option v-for="option in deviceTypeOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>
      <button type="button" @click="handleQuery">查询</button>
      <button type="button" @click="resetQuery">重置</button>
    </form>
    <!-- 警告栏 -->
    <div v-if="isDataWarningVisible" :style="warningStyle" class="warning-bar">
      警告：最近5分钟内未收到数据
    </div>

    <!-- 数据表格 -->
    <table class="tableStyle">
      <thead>
        <tr>
          <th v-for="(header, index) in headers" :key="index" :style="headerCellStyle">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index" :class="rowClassName(index)">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex" :style="bodyCellStyle">
            {{ cell }}
          </td>
        </tr>
        <!-- 汇总行 -->
        <tr class="summary-row">
          <td v-for="(total, index) in summary" :key="index" :style="bodyCellStyle">
            {{ total }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { headerCellStyle, bodyCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles';

export default {
  data() {
    return {
      headers: ['列1', '列2', '列3'],
      rows: [
        ['数据1-1', '数据1-2', '数据1-3'],
        ['数据2-1', '数据2-2', '数据2-3'],
        // 更多行数据...
      ],
      summary: ['汇总1', '汇总2', '汇总3'],
      isDataWarningVisible: false,
    };
  },
  computed: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,
    warningStyle() {
      return {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        color: 'red',
        padding: '10px',
        textAlign: 'center',
        fontWeight: 'bold',
        opacity: this.isDataWarningVisible ? '1' : '0',
        transition: 'opacity 0.5s',
      };
    },
  },
  methods: {
    rowClassName(index) {
      return index % 2 === 0 ? 'even-row' : 'odd-row';
    },
    checkData() {
      // 模拟的检查方法，可以根据实际情况替换为API请求。
      setTimeout(() => {
        this.isDataWarningVisible = true;
      }, 5000); // 5秒后显示警告
    },
  },
  mounted() {
    this.checkData();
  },
};
</script>

<style scoped>
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 8px;
}

.even-row {
  background-color: #f9f9f9;
}

.odd-row {
  background-color: #ffffff;
}

.summary-row {
  font-weight: bold;
  background-color: #e0f7fa;
}
</style>