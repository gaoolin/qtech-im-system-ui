<template>
  <div class="app-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="人工模版" name="manual">
        <div class="import-container" v-if="activeTab === 'manual'">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span class="card-title">List参数模版导入</span>
            </div>

            <el-upload
                ref="upload"
                :limit="1"
                accept=".xlsx, .xls"
                class="upload-demo"
                :headers="upload.headers"
                :action="upload.url"
                :disabled="upload.isUploading"
                :on-progress="handleFileUploadProgress"
                :on-success="handleUploadSuccess"
                :file-list="fileList"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-upload="beforeUpload"
                :on-change="handleFileChange"
                :auto-upload="false"
                drag
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip text-center" slot="tip">
                <span>仅允许导入xls、xlsx格式文件。</span>
                <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                         @click="importTemplate"
                >下载模板
                </el-link>
              </div>
            </el-upload>

            <el-table :data="tableData" v-if="tableData.length" style="margin-top: 20px;">
              <el-table-column prop="id" label="ID" width="80"></el-table-column>
              <el-table-column prop="prodType" label="机型" width="120"></el-table-column>
              <el-table-column prop="clampOnOff" label="clampOnOff"></el-table-column>
              <el-table-column prop="destroyStart" label="destroyStart"></el-table-column>
              <el-table-column prop="init" label="init"></el-table-column>
              <el-table-column prop="grab" label="grab"></el-table-column>
              <el-table-column prop="reInit" label="reInit"></el-table-column>
              <el-table-column prop="senserReset" label="senserReset"></el-table-column>
              <el-table-column prop="sid" label="sid"></el-table-column>
              <!-- Add columns for all other properties similarly -->
            </el-table>

            <el-button type="primary" @click="submitData" :disabled="!fileSelected" style="margin-top: 20px;">提交数据
            </el-button>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="在线模版" name="online">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px" :rules="queryRules">
          <el-form-item label="机型" prop="prodType">
            <el-input
                v-model="queryParams.prodType"
                placeholder="请输入机型"
                clearable
                @change="handleQuery"
            />
          </el-form-item>
          <el-form-item label="盒子号" prop="simId">
            <el-input
                v-model="queryParams.simId"
                placeholder="请输入盒子号"
                clearable
                @change="handleQuery"
            />
          </el-form-item>

          <el-form-item label="时段" prop="dtRange">
            <el-date-picker
                v-model="queryParams.dtRange"
                style="width: 350px"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions"
            ></el-date-picker>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
                type="warning"
                plain
                icon="el-icon-download"
                size="mini"
                @click="handleExport"
            >导出
            </el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <!-- 数据表格 -->
        <el-table v-loading="loading" :data="resultList" :key="refreshKey" border
                  :header-cell-style="headerCellStyle()"
                  :cell-style="bodyCellStyle()"
                  :style="tableStyle()" v-if="activeTab === 'online'"
        >
          <!-- 产品信息 -->
          <el-table-column label="机型相关" align="left">
            <template slot-scope="scope">
              <div class="prop-container">
                <span class="prop-label">
                  机型:
                  <span>
                    {{ convertNull(scope.row.prodType) }}
                  </span>
                </span>
              </div>
              <div class="prop-container">
                <span class="prop-label">
                  盒子号:
                  <span style="font-size: 12px">
                    {{ convertNull(scope.row.simId) }}
                  </span>
                </span>
              </div>
              <div class="prop-container">
                <span class="prop-label">
                  接收时间:
                  <span style="font-size: 12px">
                    {{ convertNull(scope.row.receivedTime) }}
                  </span>
                </span>
              </div>
            </template>
          </el-table-column>

          <!-- 初始化和重置 -->
          <el-table-column label="初始化和重置" align="left">
            <template slot-scope="scope">
              <div class="prop-container">
              <span class="prop-label">
                init:
                <span class="prop-value"
                      :class="{'enabled': convertNull(scope.row.init) === 'Enable', 'disabled': convertNull(scope.row.init) === 'Disable'}"
                >{{ convertNull(scope.row.init) }}</span>
              </span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                reInit:
                <span class="prop-value"
                      :class="{'enabled': convertNull(scope.row.reInit) === 'Enable', 'disabled': convertNull(scope.row.reInit) === 'Disable'}"
                >{{ convertNull(scope.row.reInit) }}</span>
              </span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                senserReset:
                <span class="prop-value"
                      :class="{'enabled': convertNull(scope.row.senserReset) === 'Enable', 'disabled': convertNull(scope.row.senserReset) === 'Disable'}"
                >{{ convertNull(scope.row.senserReset) }}</span>
              </span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                clampOnOff:
                <span class="prop-value"
                      :class="{'enabled': convertNull(scope.row.clampOnOff) === 'Enable', 'disabled': convertNull(scope.row.clampOnOff) === 'Disable'}"
                >{{ convertNull(scope.row.clampOnOff) }}</span>
              </span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                sid:
                <span class="prop-value"
                      :class="{'enabled': convertNull(scope.row.sid) === 'Enable', 'disabled': convertNull(scope.row.sid) === 'Disable'}"
                >{{ convertNull(scope.row.sid) }}</span>
              </span>
              </div>
            </template>
          </el-table-column>

          <!-- 光学对齐和处理（LP） -->
          <el-table-column label="光学对齐和处理（LP）" align="left">
            <template slot-scope="scope">
              <div class="prop-container">
              <span class="prop-label">
                AA1:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.aa1) === 'Enable', 'disabled': convertNull(scope.row.aa1) === 'Disable'}">{{ convertNull(scope.row.aa1) }}</span>
              </span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                AA2:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.aa2) === 'Enable', 'disabled': convertNull(scope.row.aa2) === 'Disable'}">{{ convertNull(scope.row.aa2) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                AA3:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.aa3) === 'Enable', 'disabled': convertNull(scope.row.aa3) === 'Disable'}">{{ convertNull(scope.row.aa3) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                mtfCheck:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.mtfCheck) === 'Enable', 'disabled': convertNull(scope.row.mtfCheck) === 'Disable'}">{{ convertNull(scope.row.mtfCheck) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                mtfCheck1:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.mtfCheck1) === 'Enable', 'disabled': convertNull(scope.row.mtfCheck1) === 'Disable'}">{{ convertNull(scope.row.mtfCheck1) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                mtfCheck2:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.mtfCheck2) === 'Enable', 'disabled': convertNull(scope.row.mtfCheck2) === 'Disable'}">{{ convertNull(scope.row.mtfCheck2) }}</span>
              </span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                mtfCheck3:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.mtfCheck3) === 'Enable', 'disabled': convertNull(scope.row.mtfCheck3) === 'Disable'}">{{ convertNull(scope.row.mtfCheck3) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                lpOn:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.lpOn) === 'Enable', 'disabled': convertNull(scope.row.lpOn) === 'Disable'}">{{ convertNull(scope.row.lpOn) }}</span>
              </span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                lpOff:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.lpOff) === 'Enable', 'disabled': convertNull(scope.row.lpOff) === 'Disable'}">{{ convertNull(scope.row.lpOff) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                lpOc:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.lpOc) === 'Enable', 'disabled': convertNull(scope.row.lpOc) === 'Disable'}">{{ convertNull(scope.row.lpOc) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                lpOcCheck:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.lpOcCheck) === 'Enable', 'disabled': convertNull(scope.row.lpOcCheck) === 'Disable'}">{{ convertNull(scope.row.lpOcCheck) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                lpOnBlemish:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.lpOnBlemish) === 'Enable', 'disabled': convertNull(scope.row.lpOnBlemish) === 'Disable'}">{{ convertNull(scope.row.lpOnBlemish) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                lpBlemish:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.lpBlemish) === 'Enable', 'disabled': convertNull(scope.row.lpBlemish) === 'Disable'}">{{ convertNull(scope.row.lpBlemish) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                blemish:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.blemish) === 'Enable', 'disabled': convertNull(scope.row.blemish) === 'Disable'}">{{ convertNull(scope.row.blemish) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                chartAlignment:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.chartAlignment) === 'Enable', 'disabled': convertNull(scope.row.chartAlignment) === 'Disable'}">{{ convertNull(scope.row.chartAlignment) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                chartAlignment1:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.chartAlignment1) === 'Enable', 'disabled': convertNull(scope.row.chartAlignment1) === 'Disable'}">{{ convertNull(scope.row.chartAlignment1) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                chartAlignment2:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.chartAlignment2) === 'Enable', 'disabled': convertNull(scope.row.chartAlignment2) === 'Disable'}">{{ convertNull(scope.row.chartAlignment2) }}</span></span>
              </div>
            </template>
          </el-table-column>

          <!-- VCM（音圈电机）相关 -->
          <el-table-column label="VCM相关" align="left">
            <template slot-scope="scope">
              <div class="prop-container">
              <span class="prop-label">
                vcmHall:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmHall) === 'Enable', 'disabled': convertNull(scope.row.vcmHall) === 'Disable'}">{{ convertNull(scope.row.vcmHall) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                vcmHall2:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmHall2) === 'Enable', 'disabled': convertNull(scope.row.vcmHall2) === 'Disable'}">{{ convertNull(scope.row.vcmHall2) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                vcmPowerOff:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmPowerOff) === 'Enable', 'disabled': convertNull(scope.row.vcmPowerOff) === 'Disable'}">{{ convertNull(scope.row.vcmPowerOff) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                vcmPowerOn:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmPowerOn) === 'Enable', 'disabled': convertNull(scope.row.vcmPowerOn) === 'Disable'}">{{ convertNull(scope.row.vcmPowerOn) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                vcmTop:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmTop) === 'Enable', 'disabled': convertNull(scope.row.vcmTop) === 'Disable'}">{{ convertNull(scope.row.vcmTop) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                vcmTopHall:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmTopHall) === 'Enable', 'disabled': convertNull(scope.row.vcmTopHall) === 'Disable'}">{{ convertNull(scope.row.vcmTopHall) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                vcmZ:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmZ) === 'Enable', 'disabled': convertNull(scope.row.vcmZ) === 'Disable'}">{{ convertNull(scope.row.vcmZ) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                vcmZHall:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmZHall) === 'Enable', 'disabled': convertNull(scope.row.vcmZHall) === 'Disable'}">{{ convertNull(scope.row.vcmZHall) }}</span>
              </span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                vcmOisInit:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmOisInit) === 'Enable', 'disabled': convertNull(scope.row.vcmOisInit) === 'Disable'}">{{ convertNull(scope.row.vcmOisInit) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                vcmMoveToZ:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmMoveToZ) === 'Enable', 'disabled': convertNull(scope.row.vcmMoveToZ) === 'Disable'}">{{ convertNull(scope.row.vcmMoveToZ) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                vcmPowerOffCheck:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmPowerOffCheck) === 'Enable', 'disabled': convertNull(scope.row.vcmPowerOffCheck) === 'Disable'}">{{ convertNull(scope.row.vcmPowerOffCheck) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                vcmRun:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmRun) === 'Enable', 'disabled': convertNull(scope.row.vcmRun) === 'Disable'}">{{ convertNull(scope.row.vcmRun) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                vcmMoveToZPos:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmMoveToZPos) === 'Enable', 'disabled': convertNull(scope.row.vcmMoveToZPos) === 'Disable'}">{{ convertNull(scope.row.vcmMoveToZPos) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                vcmInit:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.vcmInit) === 'Enable', 'disabled': convertNull(scope.row.vcmInit) === 'Disable'}">{{ convertNull(scope.row.vcmInit) }}</span></span>
              </div>
            </template>
          </el-table-column>

          <!-- 检查和检测 -->
          <el-table-column label="检查和检测" align="left">
            <template slot-scope="scope">
              <div class="prop-container">
              <span class="prop-label">
                mtfOffAxisCheck1:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.mtfOffAxisCheck1) === 'Enable', 'disabled': convertNull(scope.row.mtfOffAxisCheck1) === 'Disable'}">{{ convertNull(scope.row.mtfOffAxisCheck1) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                mtfOffAxisCheck2:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.mtfOffAxisCheck2) === 'Enable', 'disabled': convertNull(scope.row.mtfOffAxisCheck2) === 'Disable'}">{{ convertNull(scope.row.mtfOffAxisCheck2) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                mtfOffAxisCheck3:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.mtfOffAxisCheck3) === 'Enable', 'disabled': convertNull(scope.row.mtfOffAxisCheck3) === 'Disable'}">{{ convertNull(scope.row.mtfOffAxisCheck3) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                openCheck:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.openCheck) === 'Enable', 'disabled': convertNull(scope.row.openCheck) === 'Disable'}">{{ convertNull(scope.row.openCheck) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                ocCheck:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.ocCheck) === 'Enable', 'disabled': convertNull(scope.row.ocCheck) === 'Disable'}">{{ convertNull(scope.row.ocCheck) }}</span></span>
              </div>
            </template>
          </el-table-column>

          <!-- 其他操作和记录 -->
          <el-table-column label="其他操作和记录" align="left">
            <template slot-scope="scope">
              <div class="prop-container">
              <span class="prop-label">
                backToPosition:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.backToPosition) === 'Enable', 'disabled': convertNull(scope.row.backToPosition) === 'Disable'}">{{ convertNull(scope.row.backToPosition) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                delay:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.delay) === 'Enable', 'disabled': convertNull(scope.row.delay) === 'Disable'}">{{ convertNull(scope.row.delay) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                destroy:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.destroy) === 'Enable', 'disabled': convertNull(scope.row.destroy) === 'Disable'}">{{ convertNull(scope.row.destroy) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                destroyStart:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.destroyStart) === 'Enable', 'disabled': convertNull(scope.row.destroyStart) === 'Disable'}">{{ convertNull(scope.row.destroyStart) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                dispense:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.dispense) === 'Enable', 'disabled': convertNull(scope.row.dispense) === 'Disable'}">{{ convertNull(scope.row.dispense) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                epoxyInspectionAuto:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.epoxyInspectionAuto) === 'Enable', 'disabled': convertNull(scope.row.epoxyInspectionAuto) === 'Disable'}">{{ convertNull(scope.row.epoxyInspectionAuto) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                epoxyInspection:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.epoxyInspection) === 'Enable', 'disabled': convertNull(scope.row.epoxyInspection) === 'Disable'}">{{ convertNull(scope.row.epoxyInspection) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                grab:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.grab) === 'Enable', 'disabled': convertNull(scope.row.grab) === 'Disable'}">{{ convertNull(scope.row.grab) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                gripperOpen:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.gripperOpen) === 'Enable', 'disabled': convertNull(scope.row.gripperOpen) === 'Disable'}">{{ convertNull(scope.row.gripperOpen) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                moveToBlemishPos:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.moveToBlemishPos) === 'Enable', 'disabled': convertNull(scope.row.moveToBlemishPos) === 'Disable'}">{{ convertNull(scope.row.moveToBlemishPos) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                recordPosition:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.recordPosition) === 'Enable', 'disabled': convertNull(scope.row.recordPosition) === 'Disable'}">{{ convertNull(scope.row.recordPosition) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                saveOc:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.saveOc) === 'Enable', 'disabled': convertNull(scope.row.saveOc) === 'Disable'}">{{ convertNull(scope.row.saveOc) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                saveMtf:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.saveMtf) === 'Enable', 'disabled': convertNull(scope.row.saveMtf) === 'Disable'}">{{ convertNull(scope.row.saveMtf) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                uvon:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.uvon) === 'Enable', 'disabled': convertNull(scope.row.uvon) === 'Disable'}">{{ convertNull(scope.row.uvon) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                uvoff:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.uvoff) === 'Enable', 'disabled': convertNull(scope.row.uvoff) === 'Disable'}">{{ convertNull(scope.row.uvoff) }}</span></span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                yLevel:
                <span class="prop-value" :class="{'enabled': convertNull(scope.row.yLevel) === 'Enable', 'disabled': convertNull(scope.row.yLevel) === 'Disable'}">{{ convertNull(scope.row.yLevel) }}</span></span>
              </div>
            </template>
          </el-table-column>

          <!-- Item参数管控详情 -->
          <el-table-column label="Item参数管控详情" align="left" width="250">
            <template slot-scope="scope">
              <el-collapse accordion>
                <el-collapse-item class="prop-label" title="AA1" extra="AA1-AA1" name="1">
                  <el-descriptions :column="1" border class="prop-label">
                    <el-descriptions-item label="Cc" class="custom-descriptions-item">
                      {{ convertNull(scope.row.aa1RoiCc) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Ul">
                      {{ convertNull(scope.row.aa1RoiUl) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Ur">
                      {{ convertNull(scope.row.aa1RoiUr) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Lr">
                      {{ convertNull(scope.row.aa1RoiLr) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Lr">
                      {{ convertNull(scope.row.aa1RoiLr) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="MtfOffAxisCheck1">
                      {{ convertNull(scope.row.aa1MtfOffAxisCheck1) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="MtfOffAxisCheck2">
                      {{ convertNull(scope.row.aa1MtfOffAxisCheck2) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="MtfOffAxisCheck3">
                      {{ convertNull(scope.row.aa1MtfOffAxisCheck3) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Target">
                      {{ convertNull(scope.row.aa1Target) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="CcToCornerLimit">
                      {{ convertNull(scope.row.aa1CcToCornerLimit) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="CcToCornerLimitMin">
                      {{ convertNull(scope.row.aa1CcToCornerLimitMin) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="CornerScoreDifferenceRejectValue">
                      {{ convertNull(scope.row.aa1CornerScoreDifferenceRejectValue) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="ZRef">
                      {{ convertNull(scope.row.aa1ZRef) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="SrchStep">
                      {{ convertNull(scope.row.aa1SrchStep) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="GoldenGlueThicknessMin">
                      {{ convertNull(scope.row.aa1GoldenGlueThicknessMin) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="GoldenGlueThicknessMax">
                      {{ convertNull(scope.row.aa1GoldenGlueThicknessMax) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
                <el-collapse-item class="prop-label" title="AA2" name="2">
                  <el-descriptions :column="1" border class="prop-label">
                    <el-descriptions-item label="Cc">
                      {{ convertNull(scope.row.aa2RoiCc) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Ul">
                      {{ convertNull(scope.row.aa2RoiUl) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Ur">
                      {{ convertNull(scope.row.aa2RoiUr) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Ll">
                      {{ convertNull(scope.row.aa2RoiLl) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Lr">
                      {{ convertNull(scope.row.aa2RoiLr) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="MtfOffAxisCheck1">
                      {{ convertNull(scope.row.aa2MtfOffAxisCheck1) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="MtfOffAxisCheck2">
                      {{ convertNull(scope.row.aa2MtfOffAxisCheck2) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="MtfOffAxisCheck3">
                      {{ convertNull(scope.row.aa2MtfOffAxisCheck3) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Target">
                      {{ convertNull(scope.row.aa2Target) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="CcToCornerLimit">
                      {{ convertNull(scope.row.aa2CcToCornerLimit) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="CcToCornerLimitMin">
                      {{ convertNull(scope.row.aa2CcToCornerLimitMin) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="CornerScoreDifferenceRejectValue">
                      {{ convertNull(scope.row.aa2CornerScoreDifferenceRejectValue) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="ZRef">
                      {{ convertNull(scope.row.aa2ZRef) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="SrchStep">
                      {{ convertNull(scope.row.aa2SrchStep) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="GoldenGlueThicknessMin">
                      {{ convertNull(scope.row.aa2GoldenGlueThicknessMin) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="GoldenGlueThicknessMax">
                      {{ convertNull(scope.row.aa2GoldenGlueThicknessMax) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
                <el-collapse-item class="prop-label" title="AA3" name="3">
                  <el-descriptions :column="1" border class="prop-label">
                    <el-descriptions-item label="Cc">
                      {{ convertNull(scope.row.aa3RoiCc) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Ul">
                      {{ convertNull(scope.row.aa3RoiUl) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Ur">
                      {{ convertNull(scope.row.aa3RoiUr) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Ll">
                      {{ convertNull(scope.row.aa3RoiLl) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Lr">
                      {{ convertNull(scope.row.aa3RoiLr) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="MtfOffAxisCheck1">
                      {{ convertNull(scope.row.aa3MtfOffAxisCheck1) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="MtfOffAxisCheck2">
                      {{ convertNull(scope.row.aa3MtfOffAxisCheck2) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="MtfOffAxisCheck3">
                      {{ convertNull(scope.row.aa3MtfOffAxisCheck3) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Target">
                      {{ convertNull(scope.row.aa3Target) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="CcToCornerLimit">
                      {{ convertNull(scope.row.aa3CcToCornerLimit) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="CcToCornerLimitMin">
                      {{ convertNull(scope.row.aa3CcToCornerLimitMin) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="CornerScoreDifferenceRejectValue">
                      {{ convertNull(scope.row.aa3CornerScoreDifferenceRejectValue) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="ZRef">
                      {{ convertNull(scope.row.aa3ZRef) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="SrchStep">
                      {{ convertNull(scope.row.aa3SrchStep) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="GoldenGlueThicknessMin">
                      {{ convertNull(scope.row.aa3GoldenGlueThicknessMin) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="GoldenGlueThicknessMax">
                      {{ convertNull(scope.row.aa3GoldenGlueThicknessMax) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
                <el-collapse-item class="prop-label" title="chartAlignment" name="4">
                  <el-descriptions :column="1" border>
                    <el-descriptions-item label="xMin">
                      {{ convertNull(scope.row.chartAlignmentXResMin) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="xMax">
                      {{ convertNull(scope.row.chartAlignmentXResMax) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="yMin">
                      {{ convertNull(scope.row.chartAlignmentYResMin) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="yMax">
                      {{ convertNull(scope.row.chartAlignmentYResMax) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
                <el-collapse-item class="prop-label" title="chartAlignment1" name="5">
                  <el-descriptions :column="1" border>
                    <el-descriptions-item label="xMin">
                      {{ convertNull(scope.row.chartAlignment1XResMin) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="xMax">
                      {{ convertNull(scope.row.chartAlignment1XResMax) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="yMin">
                      {{ convertNull(scope.row.chartAlignment1YResMin) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="yMax">
                      {{ convertNull(scope.row.chartAlignment1YResMax) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
                <el-collapse-item class="prop-label" title="chartAlignment2" name="6">
                  <el-descriptions :column="1" border>
                    <el-descriptions-item label="xMin">
                      {{ convertNull(scope.row.chartAlignment2XResMin) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="xMax">
                      {{ convertNull(scope.row.chartAlignment2XResMax) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="yMin">
                      {{ convertNull(scope.row.chartAlignment2YResMin) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="yMax">
                      {{ convertNull(scope.row.chartAlignment2YResMax) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
                <el-collapse-item class="prop-label" title="mtfCheck" name="7">
                  <el-descriptions :column="1" border class="prop-label">
                    <el-descriptions-item label="Cc">
                      {{ convertNull(scope.row.mtfCheckFC) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="F1">
                      {{ convertNull(scope.row.mtfCheckF1) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="F2">
                      {{ convertNull(scope.row.mtfCheckF2) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="F3">
                      {{ convertNull(scope.row.mtfCheckF3) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="F4">
                      {{ convertNull(scope.row.mtfCheckF4) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
                <el-collapse-item class="prop-label" title="mtfCheck1" name="8">
                  <el-descriptions :column="1" border class="prop-label">
                    <el-descriptions-item label="Cc">
                      {{ convertNull(scope.row.mtfCheck1FC) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="F1">
                      {{ convertNull(scope.row.mtfCheck1F1) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="F2">
                      {{ convertNull(scope.row.mtfCheck1F2) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="F3">
                      {{ convertNull(scope.row.mtfCheck1F3) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="F4">
                      {{ convertNull(scope.row.mtfCheck1F4) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
                <el-collapse-item class="prop-label" title="mtfCheck2" name="9">
                  <el-descriptions :column="1" border class="prop-label">
                    <el-descriptions-item label="Cc">
                      {{ convertNull(scope.row.mtfCheck2FC) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="F1">
                      {{ convertNull(scope.row.mtfCheck2F1) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="F2">
                      {{ convertNull(scope.row.mtfCheck2F2) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="F3">
                      {{ convertNull(scope.row.mtfCheck2F3) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="F4">
                      {{ convertNull(scope.row.mtfCheck2F4) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
                <el-collapse-item class="prop-label" title="RecordPosition" name="10">
                  <el-descriptions :column="1" border>
                    <el-descriptions-item label="utXyzMove">
                      {{ convertNull(scope.row.recordPositionUtXyzMove) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
                <el-collapse-item class="prop-label" title="SaveMtf" name="11">
                  <el-descriptions :column="1" border>
                    <el-descriptions-item label="ccMin">
                      {{ convertNull(scope.row.saveMtfCcMin) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="ccMax">
                      {{ convertNull(scope.row.saveMtfCcMax) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
                <el-collapse-item class="prop-label" title="EpoxyInspectionAuto" name="12">
                  <el-descriptions :column="1" border>
                    <el-descriptions-item label="EpoxyInspection">
                      {{ convertNull(scope.row.epoxyInspectionInterval) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
              </el-collapse>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column prop="option" label="操作" align="center" width="110" fixed="right">
            <template slot-scope="scope">
              <div class="btn-ops-cell">
                <el-button size="mini" type="text" class="btn-ops" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button size="mini" type="text" class="btn-ops" @click="handleUpload(scope.row)">设置为标准模版</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination
            v-show="total>0"
            :total="total"
            :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize"
            :page-sizes="[1, 2, 5, 10, 50]"
            @pagination="getList"
        />

        <!-- 编辑模态框 -->
        <el-dialog :visible.sync="editDialogVisible" :width="'30%'" append-to-body title="编辑标准List参数模版">
          <el-form ref="editFormRef" :rules="rules" label-width="250px" :model="editForm">
            <el-form-item label="机型" prop="prodType">
              <el-input v-model="editForm.prodType" :disabled="true"/>
            </el-form-item>
            <el-collapse v-model="outerActiveNames" accordion>
              <el-collapse-item class="main-item" title="初始化和重置" name="1">
                <el-form-item label="init" prop="init">
                  <el-select v-model="editForm.init" placeholder="请选择" clearable @clear="handleClear('init')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="reInit" prop="reInit">
                  <el-select v-model="editForm.reInit" placeholder="请选择" clearable @clear="handleClear('reInit')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="senserReset" prop="senserReset">
                  <el-select v-model="editForm.senserReset" placeholder="请选择" clearable @clear="handleClear('senserReset')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="clampOnOff" prop="clampOnOff">
                  <el-select v-model="editForm.clampOnOff" placeholder="请选择" clearable @clear="handleClear('clampOnOff')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="SID" prop="sid">
                  <el-select v-model="editForm.sid" placeholder="请选择" clearable @clear="handleClear('sid')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
              </el-collapse-item>
              <el-collapse-item class="main-item" title="光学对齐和处理（LP）" name="2">
                <el-form-item label="AA1" prop="AA1">
                  <el-select v-model="editForm.aa1" placeholder="请选择" clearable @clear="handleClear('AA1')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="AA2" prop="AA2">
                  <el-select v-model="editForm.aa2" placeholder="请选择" clearable @clear="handleClear('AA2')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="AA3" prop="AA3">
                  <el-select v-model="editForm.aa3" placeholder="请选择" clearable @clear="handleClear('AA3')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="mtfCheck" prop="mtfCheck">
                  <el-select v-model="editForm.mtfCheck" placeholder="请选择" clearable @clear="handleClear('mtfCheck')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="mtfCheck1" prop="mtfCheck1">
                  <el-select v-model="editForm.mtfCheck1" placeholder="请选择" clearable @clear="handleClear('mtfCheck1')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="mtfCheck2" prop="mtfCheck2">
                  <el-select v-model="editForm.mtfCheck2" placeholder="请选择" clearable @clear="handleClear('mtfCheck2')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="mtfCheck3" prop="mtfCheck3">
                  <el-select v-model="editForm.mtfCheck3" placeholder="请选择" clearable @clear="handleClear('mtfCheck3')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="lpOn" prop="lpOn">
                  <el-select v-model="editForm.lpOn" placeholder="请选择" clearable @clear="handleClear('lpOn')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="lpOff" prop="lpOff">
                  <el-select v-model="editForm.lpOff" placeholder="请选择" clearable @clear="handleClear('lpOff')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="lpOc" prop="lpOc">
                  <el-select v-model="editForm.lpOc" placeholder="请选择" clearable @clear="handleClear('lpOc')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="lpOcCheck" prop="lpOcCheck">
                  <el-select v-model="editForm.lpOcCheck" placeholder="请选择" clearable @clear="handleClear('lpOcCheck')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="lpOnBlemish" prop="lpOnBlemish">
                  <el-select v-model="editForm.lpOnBlemish" placeholder="请选择" clearable @clear="handleClear('lpOnBlemish')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="lpBlemish" prop="lpBlemish">
                  <el-select v-model="editForm.lpBlemish" placeholder="请选择" clearable @clear="handleClear('lpBlemish')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="blemish" prop="blemish">
                  <el-select v-model="editForm.blemish" placeholder="请选择" clearable @clear="handleClear('init')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="chartAlignment" prop="chartAlignment">
                  <el-select v-model="editForm.chartAlignment" placeholder="请选择" clearable @clear="handleClear('chartAlignment')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="chartAlignment1" prop="chartAlignment1">
                  <el-select v-model="editForm.chartAlignment1" placeholder="请选择" clearable @clear="handleClear('chartAlignment1')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="chartAlignment2" prop="chartAlignment2">
                  <el-select v-model="editForm.chartAlignment2" placeholder="请选择" clearable @clear="handleClear('chartAlignment2')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
              </el-collapse-item>
              <el-collapse-item class="main-item" title="VCM相关" name="3">
                <el-form-item label="vcmHall" prop="vcmHall">
                  <el-select v-model="editForm.vcmHall" placeholder="请选择" clearable @clear="handleClear('vcmHall')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="vcmHall2" prop="vcmHall2">
                  <el-select v-model="editForm.vcmHall2" placeholder="请选择" clearable @clear="handleClear('vcmHall2')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="vcmPowerOff" prop="vcmPowerOff">
                  <el-select v-model="editForm.vcmPowerOff" placeholder="请选择" clearable @clear="handleClear('vcmPowerOff')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="vcmPowerOn" prop="vcmPowerOn">
                  <el-select v-model="editForm.vcmPowerOn" placeholder="请选择" clearable @clear="handleClear('vcmPowerOn')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="vcmTop" prop="vcmTop">
                  <el-select v-model="editForm.vcmTop" placeholder="请选择" clearable @clear="handleClear('vcmTop')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="vcmTopHall" prop="vcmTopHall">
                  <el-select v-model="editForm.vcmTopHall" placeholder="请选择" clearable @clear="handleClear('vcmTopHall')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="vcmZ" prop="vcmZ">
                  <el-select v-model="editForm.vcmZ" placeholder="请选择" clearable @clear="handleClear('vcmZ')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="vcmZHall" prop="vcmZHall">
                  <el-select v-model="editForm.vcmZHall" placeholder="请选择" clearable @clear="handleClear('vcmZHall')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="vcmOisInit" prop="vcmOisInit">
                  <el-select v-model="editForm.vcmOisInit" placeholder="请选择" clearable @clear="handleClear('vcmOisInit')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="vcmMoveToZ" prop="vcmMoveToZ">
                  <el-select v-model="editForm.vcmMoveToZ" placeholder="请选择" clearable @clear="handleClear('vcmMoveToZ')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="vcmPowerOffCheck" prop="vcmPowerOffCheck">
                  <el-select v-model="editForm.vcmPowerOffCheck" placeholder="请选择" clearable @clear="handleClear('vcmPowerOffCheck')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="vcmMoveToZPos" prop="vcmMoveToZPos">
                  <el-select v-model="editForm.vcmMoveToZPos" placeholder="请选择" clearable @clear="handleClear('vcmMoveToZPos')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="vcmInit" prop="vcmInit">
                  <el-select v-model="editForm.vcmInit" placeholder="请选择" clearable @clear="handleClear('vcmInit')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
              </el-collapse-item>
              <el-collapse-item class="main-item" title="检查和检测" name="4">
                <el-form-item label="mtfOffAxisCheck1" prop="mtfOffAxisCheck1">
                  <el-select v-model="editForm.mtfOffAxisCheck1" placeholder="请选择" clearable @clear="handleClear('mtfOffAxisCheck1')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="mtfOffAxisCheck2" prop="mtfOffAxisCheck2">
                  <el-select v-model="editForm.mtfOffAxisCheck2" placeholder="请选择" clearable @clear="handleClear('mtfOffAxisCheck2')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="mtfOffAxisCheck3" prop="mtfOffAxisCheck3">
                  <el-select v-model="editForm.mtfOffAxisCheck3" placeholder="请选择" clearable @clear="handleClear('mtfOffAxisCheck3')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="openCheck" prop="openCheck">
                  <el-select v-model="editForm.openCheck" placeholder="请选择" clearable @clear="handleClear('openCheck')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
              </el-collapse-item>
              <el-collapse-item class="main-item" title="其他操作和记录" name="5">
                <el-form-item label="backToPosition" prop="backToPosition">
                  <el-select v-model="editForm.backToPosition" placeholder="请选择" clearable @clear="handleClear('backToPosition')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="delay" prop="delay">
                  <el-select v-model="editForm.delay" placeholder="请选择" clearable @clear="handleClear('delay')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="destroy" prop="destroy">
                  <el-select v-model="editForm.destroy" placeholder="请选择" clearable @clear="handleClear('destroy')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="destroyStart" prop="destroyStart">
                  <el-select v-model="editForm.destroyStart" placeholder="请选择" clearable @clear="handleClear('destroyStart')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="dispense" prop="dispense">
                  <el-select v-model="editForm.dispense" placeholder="请选择" clearable @clear="handleClear('dispense')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="epoxyInspectionAuto" prop="epoxyInspectionAuto">
                  <el-select v-model="editForm.epoxyInspectionAuto" placeholder="请选择" clearable @clear="handleClear('epoxyInspectionAuto')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="epoxyInspection" prop="epoxyInspection">
                  <el-select v-model="editForm.epoxyInspection" placeholder="请选择" clearable @clear="handleClear('epoxyInspection')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="grab" prop="grab">
                  <el-select v-model="editForm.grab" placeholder="请选择" clearable @clear="handleClear('grab')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="gripperOpen" prop="gripperOpen">
                  <el-select v-model="editForm.gripperOpen" placeholder="请选择" clearable @clear="handleClear('gripperOpen')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="moveToBlemishPos" prop="moveToBlemishPos">
                  <el-select v-model="editForm.moveToBlemishPos" placeholder="请选择" clearable @clear="handleClear('moveToBlemishPos')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="recordPosition" prop="recordPosition">
                  <el-select v-model="editForm.recordPosition" placeholder="请选择" clearable @clear="handleClear('recordPosition')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="saveOc" prop="saveOc">
                  <el-select v-model="editForm.saveOc" placeholder="请选择" clearable @clear="handleClear('saveOc')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="saveMtf" prop="saveMtf">
                  <el-select v-model="editForm.saveMtf" placeholder="请选择" clearable @clear="handleClear('saveMtf')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="uvon" prop="uvon">
                  <el-select v-model="editForm.uvon" placeholder="请选择" clearable @clear="handleClear('uvon')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="uvoff" prop="uvoff">
                  <el-select v-model="editForm.uvoff" placeholder="请选择" clearable @clear="handleClear('uvoff')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="yLevel" prop="yLevel">
                  <el-select v-model="editForm.yLevel" placeholder="请选择" clearable @clear="handleClear('yLevel')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label" :value="dict.value"/>
                  </el-select>
                </el-form-item>
              </el-collapse-item>
              <el-collapse-item class="main-item" title="Item参数管控详情" name="6">
                <el-collapse v-model="innerActiveNames" accordion>
                  <el-collapse-item class="sub-item" title="AA1" name="7">
                    <el-form-item label="RoiCc" prop="aa1RoiCc">
                      <el-input v-model="editForm.aa1RoiCc" @input="handleInputChange('aa1RoiCc')"></el-input>
                    </el-form-item>
                    <el-form-item label="RoiUl" prop="aa1RoiUl">
                      <el-input v-model="editForm.aa1RoiUl" @input="handleInputChange('aa1RoiUl')"></el-input>
                    </el-form-item>
                    <el-form-item label="RoiUr" prop="aa1RoiUr">
                      <el-input v-model="editForm.aa1RoiUr" @input="handleInputChange('aa1RoiUr')"></el-input>
                    </el-form-item>
                    <el-form-item label="RoiLl" prop="aa1RoiLl">
                      <el-input v-model="editForm.aa1RoiLl" @input="handleInputChange('aa1RoiLl')"></el-input>
                    </el-form-item>
                    <el-form-item label="RoiLr" prop="aa1RoiLr">
                      <el-input v-model="editForm.aa1RoiLr" @input="handleInputChange('aa1RoiLr')"></el-input>
                    </el-form-item>
                    <el-form-item label="Target" prop="aa1Target">
                      <el-input v-model="editForm.aa1Target" @input="handleInputChange('aa1Target')"></el-input>
                    </el-form-item>
                    <el-form-item label="CcToCornerLimit" prop="aa1CcToCornerLimit">
                      <el-input v-model="editForm.aa1CcToCornerLimit" @input="handleInputChange('aa1CcToCornerLimit')"></el-input>
                    </el-form-item>
                    <el-form-item label="CcToCornerLimitMin" prop="aa1CcToCornerLimitMin">
                      <el-input v-model="editForm.aa1CcToCornerLimitMin" @input="handleInputChange('aa1CcToCornerLimitMin')"></el-input>
                    </el-form-item>
                    <el-form-item label="CornerScoreDifferenceRejectValue" prop="aa1CornerScoreDifferenceRejectValue">
                      <el-input v-model="editForm.aa1CornerScoreDifferenceRejectValue" @input="handleInputChange('aa1CornerScoreDifferenceRejectValue')"></el-input>
                    </el-form-item>
                    <el-form-item label="ZRef" prop="aa1ZRef">
                      <el-input v-model="editForm.aa1ZRef" @input="handleInputChange('aa1ZRef')"></el-input>
                    </el-form-item>
                    <el-form-item label="SrchStep" prop="aa1SrchStep">
                      <el-input v-model="editForm.aa1SrchStep" @input="handleInputChange('aa1SrchStep')"></el-input>
                    </el-form-item>
                    <el-form-item label="GoldenGlueThicknessMin" prop="aa1GoldenGlueThicknessMin">
                      <el-input v-model="editForm.aa1GoldenGlueThicknessMin" @input="handleInputChange('aa1GoldenGlueThicknessMin')"></el-input>
                    </el-form-item>
                    <el-form-item label="GoldenGlueThicknessMax" prop="aa1GoldenGlueThicknessMax">
                      <el-input v-model="editForm.aa1GoldenGlueThicknessMax" @input="handleInputChange('aa1GoldenGlueThicknessMax')"></el-input>
                    </el-form-item>
                  </el-collapse-item>
                  <el-collapse-item class="sub-item" title="AA2" name="8">
                    <el-form-item label="RoiCc" prop="aa2RoiCc">
                      <el-input v-model="editForm.aa2RoiCc" @input="handleInputChange('aa2RoiCc')"></el-input>
                    </el-form-item>
                    <el-form-item label="RoiUl" prop="aa2RoiUl">
                      <el-input v-model="editForm.aa2RoiUl" @input="handleInputChange('aa2RoiUl')"></el-input>
                    </el-form-item>
                    <el-form-item label="RoiUr" prop="aa2RoiUr">
                      <el-input v-model="editForm.aa2RoiUr" @input="handleInputChange('aa2RoiUr')"></el-input>
                    </el-form-item>
                    <el-form-item label="RoiLl" prop="aa2RoiLl">
                      <el-input v-model="editForm.aa2RoiLl" @input="handleInputChange('aa2RoiLl')"></el-input>
                    </el-form-item>
                    <el-form-item label="RoiLr" prop="aa2RoiLr">
                      <el-input v-model="editForm.aa2RoiLr" @input="handleInputChange('aa2RoiLr')"></el-input>
                    </el-form-item>
                    <el-form-item label="Target" prop="aa2Target">
                      <el-input v-model="editForm.aa2Target" @input="handleInputChange('aa2Target')"></el-input>
                    </el-form-item>
                    <el-form-item label="CcToCornerLimit" prop="aa2CcToCornerLimit">
                      <el-input v-model="editForm.aa2CcToCornerLimit" @input="handleInputChange('aa2CcToCornerLimit')"></el-input>
                    </el-form-item>
                    <el-form-item label="CcToCornerLimitMin" prop="aa2CcToCornerLimitMin">
                      <el-input v-model="editForm.aa2CcToCornerLimitMin" @input="handleInputChange('aa2CcToCornerLimitMin')"></el-input>
                    </el-form-item>
                    <el-form-item label="CornerScoreDifferenceRejectValue" prop="aa2CornerScoreDifferenceRejectValue">
                      <el-input v-model="editForm.aa2CornerScoreDifferenceRejectValue" @input="handleInputChange('aa2CornerScoreDifferenceRejectValue')"></el-input>
                    </el-form-item>
                    <el-form-item label="ZRef" prop="aa2ZRef">
                      <el-input v-model="editForm.aa2ZRef" @input="handleInputChange('aa2ZRef')"></el-input>
                    </el-form-item>
                    <el-form-item label="SrchStep" prop="aa2SrchStep">
                      <el-input v-model="editForm.aa2SrchStep" @input="handleInputChange('aa2SrchStep')"></el-input>
                    </el-form-item>
                    <el-form-item label="GoldenGlueThicknessMin" prop="aa2GoldenGlueThicknessMin">
                      <el-input v-model="editForm.aa2GoldenGlueThicknessMin" @input="handleInputChange('aa2GoldenGlueThicknessMin')"></el-input>
                    </el-form-item>
                    <el-form-item label="GoldenGlueThicknessMax" prop="aa2GoldenGlueThicknessMax">
                      <el-input v-model="editForm.aa2GoldenGlueThicknessMax" @input="handleInputChange('aa2GoldenGlueThicknessMax')"></el-input>
                    </el-form-item>
                  </el-collapse-item>
                  <el-collapse-item class="sub-item" title="AA3" name="9">
                    <el-form-item label="RoiCc" prop="aa3RoiCc">
                      <el-input v-model="editForm.aa3RoiCc" @input="handleInputChange('aa3RoiCc')"></el-input>
                    </el-form-item>
                    <el-form-item label="RoiUl" prop="aa3RoiUl">
                      <el-input v-model="editForm.aa3RoiUl" @input="handleInputChange('aa3RoiUl')"></el-input>
                    </el-form-item>
                    <el-form-item label="RoiUr" prop="aa3RoiUr">
                      <el-input v-model="editForm.aa3RoiUr" @input="handleInputChange('aa3RoiUr')"></el-input>
                    </el-form-item>
                    <el-form-item label="RoiLl" prop="aa3RoiLl">
                      <el-input v-model="editForm.aa3RoiLl" @input="handleInputChange('aa3RoiLl')"></el-input>
                    </el-form-item>
                    <el-form-item label="RoiLr" prop="aa3RoiLr">
                      <el-input v-model="editForm.aa3RoiLr" @input="handleInputChange('aa3RoiLr')"></el-input>
                    </el-form-item>
                    <el-form-item label="Target" prop="aa3Target">
                      <el-input v-model="editForm.aa3Target" @input="handleInputChange('aa3Target')"></el-input>
                    </el-form-item>
                    <el-form-item label="CcToCornerLimit" prop="aa3CcToCornerLimit">
                      <el-input v-model="editForm.aa3CcToCornerLimit" @input="handleInputChange('aa3CcToCornerLimit')"></el-input>
                    </el-form-item>
                    <el-form-item label="CcToCornerLimitMin" prop="aa3CcToCornerLimitMin">
                      <el-input v-model="editForm.aa3CcToCornerLimitMin" @input="handleInputChange('aa3CcToCornerLimitMin')"></el-input>
                    </el-form-item>
                    <el-form-item label="CornerScoreDifferenceRejectValue" prop="aa3CornerScoreDifferenceRejectValue">
                      <el-input v-model="editForm.aa3CornerScoreDifferenceRejectValue" @input="handleInputChange('aa3CornerScoreDifferenceRejectValue')"></el-input>
                    </el-form-item>
                    <el-form-item label="ZRef" prop="aa3ZRef">
                      <el-input v-model="editForm.aa3ZRef" @input="handleInputChange('aa3ZRef')"></el-input>
                    </el-form-item>
                    <el-form-item label="SrchStep" prop="aa3SrchStep">
                      <el-input v-model="editForm.aa3SrchStep" @input="handleInputChange('aa3SrchStep')"></el-input>
                    </el-form-item>
                    <el-form-item label="GoldenGlueThicknessMin" prop="aa3GoldenGlueThicknessMin">
                      <el-input v-model="editForm.aa3GoldenGlueThicknessMin" @input="handleInputChange('aa3GoldenGlueThicknessMin')"></el-input>
                    </el-form-item>
                    <el-form-item label="GoldenGlueThicknessMax" prop="aa3GoldenGlueThicknessMax">
                      <el-input v-model="editForm.aa3GoldenGlueThicknessMax" @input="handleInputChange('aa3GoldenGlueThicknessMax')"></el-input>
                    </el-form-item>
                  </el-collapse-item>

                  <el-collapse-item class="sub-item" title="chartAlignment" name="10">
                    <el-form-item label="xResMin" prop="chartAlignmentXResMin">
                      <el-input v-model="editForm.chartAlignmentXResMin" @input="handleInputChange('chartAlignmentXResMin')"></el-input>
                    </el-form-item>
                    <el-form-item label="xResMax" prop="chartAlignmentXResMax">
                      <el-input v-model="editForm.chartAlignmentXResMax" @input="handleInputChange('chartAlignmentXResMax')"></el-input>
                    </el-form-item>
                    <el-form-item label="yResMin" prop="chartAlignmentYResMin">
                      <el-input v-model="editForm.chartAlignmentYResMin" @input="handleInputChange('chartAlignmentYResMin')"></el-input>
                    </el-form-item>
                    <el-form-item label="yResMax" prop="chartAlignmentYResMax">
                      <el-input v-model="editForm.chartAlignmentYResMax" @input="handleInputChange('chartAlignmentYResMax')"></el-input>
                    </el-form-item>
                  </el-collapse-item>
                  <el-collapse-item class="sub-item" title="chartAlignment1" name="11">
                    <el-form-item label="xResMin" prop="chartAlignment1XResMin">
                      <el-input v-model="editForm.chartAlignment1XResMin" @input="handleInputChange('chartAlignment1XResMin')"></el-input>
                    </el-form-item>
                    <el-form-item label="xResMax" prop="chartAlignment1XResMax">
                      <el-input v-model="editForm.chartAlignment1XResMax" @input="handleInputChange('chartAlignment1XResMax')"></el-input>
                    </el-form-item>
                    <el-form-item label="yResMin" prop="chartAlignment1YResMin">
                      <el-input v-model="editForm.chartAlignment1YResMin" @input="handleInputChange('chartAlignment1YResMin')"></el-input>
                    </el-form-item>
                    <el-form-item label="yResMax" prop="chartAlignment1YResMax">
                      <el-input v-model="editForm.chartAlignment1YResMax" @input="handleInputChange('chartAlignment1YResMax')"></el-input>
                    </el-form-item>
                  </el-collapse-item>
                  <el-collapse-item class="sub-item" title="chartAlignment2" name="12">
                    <el-form-item label="xResMin" prop="chartAlignment2XResMin">
                      <el-input v-model="editForm.chartAlignment2XResMin" @input="handleInputChange('chartAlignment2XResMin')"></el-input>
                    </el-form-item>
                    <el-form-item label="xResMax" prop="chartAlignment2XResMax">
                      <el-input v-model="editForm.chartAlignment2XResMax" @input="handleInputChange('chartAlignment2XResMax')"></el-input>
                    </el-form-item>
                    <el-form-item label="yResMin" prop="chartAlignment2YResMin">
                      <el-input v-model="editForm.chartAlignment2YResMin" @input="handleInputChange('chartAlignment2YResMin')"></el-input>
                    </el-form-item>
                    <el-form-item label="yResMax" prop="chartAlignment2YResMax">
                      <el-input v-model="editForm.chartAlignment2YResMax" @input="handleInputChange('chartAlignment2YResMax')"></el-input>
                    </el-form-item>
                  </el-collapse-item>

                  <el-collapse-item class="sub-item" title="mtfCheck" name="13">
                    <el-form-item label="FC" prop="mtfCheckFC">
                      <el-input v-model="editForm.mtfCheckFC" @input="handleInputChange('mtfCheckFC')"></el-input>
                    </el-form-item>
                    <el-form-item label="F1" prop="mtfCheckF1">
                      <el-input v-model="editForm.mtfCheckF1" @input="handleInputChange('mtfCheckF1')"></el-input>
                    </el-form-item>
                    <el-form-item label="F2" prop="mtfCheckF2">
                      <el-input v-model="editForm.mtfCheckF2" @input="handleInputChange('mtfCheckF2')"></el-input>
                    </el-form-item>
                    <el-form-item label="F3" prop="mtfCheckF3">
                      <el-input v-model="editForm.mtfCheckF3" @input="handleInputChange('mtfCheckF3')"></el-input>
                    </el-form-item>
                    <el-form-item label="F4" prop="mtfCheckF4">
                      <el-input v-model="editForm.mtfCheckF4" @input="handleInputChange('mtfCheckF4')"></el-input>
                    </el-form-item>
                  </el-collapse-item>
                  <el-collapse-item class="sub-item" title="mtfCheck1" name="14">
                    <el-form-item label="FC" prop="mtfCheck1FC">
                      <el-input v-model="editForm.mtfCheck1FC" @input="handleInputChange('mtfCheck1FC')"></el-input>
                    </el-form-item>
                    <el-form-item label="F1" prop="mtfCheck1F1">
                      <el-input v-model="editForm.mtfCheck1F1" @input="handleInputChange('mtfCheck1F1')"></el-input>
                    </el-form-item>
                    <el-form-item label="F2" prop="mtfCheck1F2">
                      <el-input v-model="editForm.mtfCheck1F2" @input="handleInputChange('mtfCheck1F2')"></el-input>
                    </el-form-item>
                    <el-form-item label="F3" prop="mtfCheck1F3">
                      <el-input v-model="editForm.mtfCheck1F3" @input="handleInputChange('mtfCheck1F3')"></el-input>
                    </el-form-item>
                    <el-form-item label="F4" prop="mtfCheck2F4">
                      <el-input v-model="editForm.mtfCheck2F4" @input="handleInputChange('mtfCheck2F4')"></el-input>
                    </el-form-item>
                  </el-collapse-item>
                  <el-collapse-item class="sub-item" title="mtfCheck2" name="15">
                    <el-form-item label="FC" prop="mtfCheck2FC">
                      <el-input v-model="editForm.mtfCheck2FC" @input="handleInputChange('mtfCheck2FC')"></el-input>
                    </el-form-item>
                    <el-form-item label="F1" prop="mtfCheck2F1">
                      <el-input v-model="editForm.mtfCheck2F1" @input="handleInputChange('mtfCheck2F1')"></el-input>
                    </el-form-item>
                    <el-form-item label="F2" prop="mtfCheck2F2">
                      <el-input v-model="editForm.mtfCheck2F2" @input="handleInputChange('mtfCheck2F2')"></el-input>
                    </el-form-item>
                    <el-form-item label="F3" prop="mtfCheck2F3">
                      <el-input v-model="editForm.mtfCheck2F3" @input="handleInputChange('mtfCheck2F3')"></el-input>
                    </el-form-item>
                    <el-form-item label="F4" prop="mtfCheck2F4">
                      <el-input v-model="editForm.mtfCheck2F4" @input="handleInputChange('mtfCheck2F4')"></el-input>
                    </el-form-item>
                  </el-collapse-item>
                  <el-collapse-item class="sub-item" title="mtfCheck3" name="16">
                    <el-form-item label="FC" prop="mtfCheck3FC">
                      <el-input v-model="editForm.mtfCheck3FC" @input="handleInputChange('mtfCheck3FC')"></el-input>
                    </el-form-item>
                    <el-form-item label="F1" prop="mtfCheck3F1">
                      <el-input v-model="editForm.mtfCheck3F1" @input="handleInputChange('mtfCheck3F1')"></el-input>
                    </el-form-item>
                    <el-form-item label="F2" prop="mtfCheck3F2">
                      <el-input v-model="editForm.mtfCheck3F2" @input="handleInputChange('mtfCheck3F2')"></el-input>
                    </el-form-item>
                    <el-form-item label="F3" prop="mtfCheck3F3">
                      <el-input v-model="editForm.mtfCheck3F3" @input="handleInputChange('mtfCheck3F3')"></el-input>
                    </el-form-item>
                    <el-form-item label="F4" prop="mtfCheck3F4">
                      <el-input v-model="editForm.mtfCheck3F4" @input="handleInputChange('mtfCheck3F4')"></el-input>
                    </el-form-item>
                  </el-collapse-item>

                  <el-collapse-item class="sub-item" title="recordPosition" name="17">
                    <el-form-item label="utXyzMove" prop="recordPositionUtXyzMove">
                      <el-input v-model="editForm.recordPositionUtXyzMove" @input="handleInputChange('recordPositionUtXyzMove')"></el-input>
                    </el-form-item>
                  </el-collapse-item>

                  <el-collapse-item class="sub-item" title="saveMtf" name="18">
                    <el-form-item label="ccMin" prop="saveMtfCcMin">
                      <el-input v-model="editForm.saveMtfCcMin" @input="handleInputChange('saveMtfCcMin')"></el-input>
                    </el-form-item>
                    <el-form-item label="ccMax" prop="saveMtfCcMax">
                      <el-input v-model="editForm.saveMtfCcMax" @input="handleInputChange('saveMtfCcMax')"></el-input>
                    </el-form-item>
                  </el-collapse-item>

                  <el-collapse-item class="sub-item" title="EpoxyInspectionAuto" name="20">
                    <el-form-item label="epoxyInspection" prop="epoxyInspectionInterval">
                      <el-input v-model="editForm.epoxyInspectionInterval"
                                @input="handleInputChange('epoxyInspectionInterval')"
                      ></el-input>
                    </el-form-item>
                  </el-collapse-item>

                  <!--<el-collapse-item class="sub-item" title="mtfCheck" name="11">
                    <el-form-item v-for="(result, index) in results" :key="result" :label="`Result${index + 1}`"
                                  :prop="`result${index + 1}`"
                    >
                      <el-input v-model="editForm[result]" @input="handleInputChange(result)">{{ editForm[result] }}
                      </el-input>
                    </el-form-item>

                  </el-collapse-item>-->
                </el-collapse>
              </el-collapse-item>
            </el-collapse>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm">提交</el-button>
          </div>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { addAaParamsModel, getAaParamsParsed } from '@/api/biz/aa/maintain/models'
import { checkPermi, checkRole } from '@/utils/permission'
import { pickerOptionsSet8 } from '@/views/biz/common/js/pickerOptionsConfig'
import { bodyCellStyle, headerCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles'
import { checkNumericOrEmpty, checkParamsRule, checkStringOrEmpty, convertNull, formatDt, checkDtRange, dateToStr } from '@/views/biz/common/js/utils'

export default {
  name: 'index',
  dicts: ['aa_list_params_power'],

  data() {
    return {
      fileList: [],
      tableData: [],
      fileSelected: false,
      // 上传参数
      upload: {
        // 是否禁用上传
        isUploading: false,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/aa/params/model/detail/upload/manual',
        // 上传的文件列表
        fileList: []
      },
      activeTab: 'online',
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 参数表格数据
      resultList: [],
      list: [],
      // 弹出层标题
      title: '',
      // 刷新标识
      refreshKey: 0,
      // 是否显示弹出层
      editDialogVisible: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 1,
        prodType: null,
        simId: null,
        dtRange: []
      },
      pickerOptions: pickerOptionsSet8,
      // 表单参数
      editForm: {},
      results: Array.from({ length: 52 }, (_, i) => `result${i + 1}`),
      // 表单校验
      rules: {
        prodType: [{ required: true, message: '机型不能为空', trigger: 'blur' }],
        AA1: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        AA2: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        AA3: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        backToPosition: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        blemish: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        clampOnOff: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        chartAlignment: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        chartAlignment1: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        chartAlignment2: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        delay: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        destroy: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        destroyStart: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        dispense: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        epoxyInspection: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        epoxyInspectionAuto: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        grab: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        gripperOpen: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        init: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        lpBlemish: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        lpOc: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        lpOcCheck: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        lpOn: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        lpOnBlemish: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        lpOff: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        moveToBlemishPos: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        mtfCheck: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        mtfCheck1: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        mtfCheck2: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        mtfCheck3: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        openCheck: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        ocCheck: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        recordPosition: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        reInit: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        saveOc: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        saveMtf: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        senserReset: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        sid: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        uvon: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        uvoff: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmHall: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmHall2: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmMoveToZ: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmMoveToZPos: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmPowerOffCheck: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmRun: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmInit: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmOisInit: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmPowerOff: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmPowerOn: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmTop: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmTopHall: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmZ: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmZHall: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        yLevel: [{ validator: this.checkParamsRule, trigger: 'blur' }],

        aa1RoiCc: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1RoiUl: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1RoiUr: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1RoiLr: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1RoiLl: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1FC: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1F1: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1F2: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1F3: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1F4: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1MtfOffAxisCheck1: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1MtfOffAxisCheck2: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1MtfOffAxisCheck3: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1Target: [{ validator: this.checkStringOrEmpty, trigger: 'blur' }],
        aa1CcToCornerLimit: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1CcToCornerLimitMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1CornerScoreDifferenceRejectValue: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1ZRef: [{ validator: this.checkStringOrEmpty, trigger: 'blur' }],
        aa1SrchStep: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1GoldenGlueThicknessMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa1GoldenGlueThicknessMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        aa2RoiCc: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2RoiUl: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2RoiUr: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2RoiLr: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2RoiLl: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2FC: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2F1: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2F2: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2F3: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2F4: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2MtfOffAxisCheck1: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2MtfOffAxisCheck2: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2MtfOffAxisCheck3: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2Target: [{ validator: this.checkStringOrEmpty, trigger: 'blur' }],
        aa2CcToCornerLimit: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2CcToCornerLimitMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur'}],
        aa2CornerScoreDifferenceRejectValue: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2ZRef: [{ validator: this.checkStringOrEmpty, trigger: 'blur' }],
        aa2SrchStep: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2GoldenGlueThicknessMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa2GoldenGlueThicknessMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        aa3RoiCc: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3RoiUl: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3RoiUr: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3RoiLr: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3RoiLl: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3FC: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3F1: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3F2: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3F3: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3F4: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3MtfOffAxisCheck1: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3MtfOffAxisCheck2: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3MtfOffAxisCheck3: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3Target: [{ validator: this.checkStringOrEmpty, trigger: 'blur' }],
        aa3CcToCornerLimit: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3CcToCornerLimitMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3CornerScoreDifferenceRejectValue: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3ZRef: [{ validator: this.checkStringOrEmpty, trigger: 'blur' }],
        aa3SrchStep: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3GoldenGlueThicknessMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        aa3GoldenGlueThicknessMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        mtfCheckFC: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheckF1: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheckF2: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheckF3: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheckF4: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        mtfCheck1FC: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheck1F1: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheck1F2: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheck1F3: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheck1F4: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        mtfCheck2FC: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheck2F1: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheck2F2: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheck2F3: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheck2F4: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        mtfCheck3FC: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheck3F1: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheck3F2: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheck3F3: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        mtfCheck3F4: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        chartAlignmentXResMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        chartAlignmentXResMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        chartAlignmentYResMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        chartAlignmentYResMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        chartAlignment1XResMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        chartAlignment1XResMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        chartAlignment1YResMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        chartAlignment1YResMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        chartAlignment2XResMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        chartAlignment2XResMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        chartAlignment2YResMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        chartAlignment2YResMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        epoxyInspectionInterval: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        vcmCheckResultCheckMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        vcmCheckResultCheckMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        recordPositionUtXyzMove: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        ocCheckXOffsetMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        ocCheckXOffsetMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        ocCheckYOffsetMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        ocCheckYOffsetMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        saveOcXOffsetMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        saveOcXOffsetMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        saveOcYOffsetMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        saveOcYOffsetMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],

        saveMtfCcMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        saveMtfCcMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }]
      },
      queryRules: {
        dtRange: [
          {
            type: 'array',
            required: true,
            message: '请选择日期区间',
            trigger: 'blur',
            fields: {
              // type类型试情况而定,所以如果返回的是date就改成date
              0: { type: 'string', required: true, message: '请选择开始日期' },
              1: { type: 'string', required: true, message: '请选择结束日期' }
            }
          }, {
            validator: (rule, value, callback) => {
              // 调用 checkDtRange 方法并指定 intervalDays 的值
              checkDtRange(rule, value, callback, 7, 'day') // 指定 intervalDays 为 60 天
            }, trigger: 'blur'
          }],
      },
      outerActiveNames: ['1'], // 默认展开的外部项
      innerActiveNames: [] // 内部项默认不展开
    }
  },
  methods: {
    checkPermi,
    checkRole,
    headerCellStyle,
    bodyCellStyle,
    tableStyle,
    checkParamsRule,
    checkNumericOrEmpty,
    checkStringOrEmpty,
    convertNull,
    formatDt,

    uploadFail() {
      this.$modal.msgError('远程服务异常！')
    },
    handleUploadSuccess(response, file, fileList) {
      // Handle the response from the server
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert('<div style="overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;">' + response.msg + '</div>', '导入结果', { dangerouslyUseHTMLString: true })
    },
    handlePreview(file) {
      console.log('preview', file)
    },
    handleRemove(file, fileList) {
      console.log('remove', file, fileList)
      this.fileSelected = false // Reset fileSelected if the file is removed
    },
    beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      if (!isExcel) {
        this.$message.error('上传文件只能是 Excel 格式!')
      }
      return isExcel
    },
    handleFileChange(file, fileList) {
      this.fileSelected = fileList.length > 0
    },
    importTemplate() {
      this.download('/aa/params/model/detail/importTemplate', {}, 'AA List参数标准模版.xlsx')
    },
    submitData() {
      this.$refs.upload.submit()
    },
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传返回后台信息
    handleResponse(response, file, fileList) {
      this.upload.isUploading = false
      if (response.code !== 200) {
        this.$modal.msgError(response.msg)
      } else {
        this.$modal.msgSuccess(response.msg)
      }
    },

    // tab-2
    getList() {
      if (this.activeTab === 'online') {
        this.$refs['queryForm'].validate(valid => {
          if (valid) {
            this.loading = true
            this.queryParams.params = {
              beginDate: this.queryParams.dtRange[0],
              endDate: this.queryParams.dtRange[1]
            }
            getAaParamsParsed(this.queryParams).then(response => {
              this.resultList = response.rows
              this.total = response.total
              this.loading = false
            })
          }
        })
      }
    },

    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 修改按钮操作 */
    handleEdit(row) {
      this.editForm = { ...row }
      // if (checkPermi('aa:params:model:upload')) {
      // }
      this.editDialogVisible = true
      this.title = '修改List参数模版信息'
    },

    handleExport() {

    },

    handleUpload(row) {
      this.loading = true
      addAaParamsModel(row).then(response => {
        this.$modal.msgSuccess('模版设置成功')
        this.loading = false
        this.getList()
      })
    },

    // 取消按钮
    cancel() {
      this.editDialogVisible = false
      this.reset()
    },

    // 表单重置
    reset() {
      this.editForm = {
        id: null

      }
      this.resetForm('editForm')
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['editFormRef'].validate(valid => {
        if (valid) {
          addAaParamsModel(this.editForm).then(response => {
            this.$modal.msgSuccess('修改成功')
            this.editDialogVisible = false
            this.getList()
          }).catch(error => {
            this.$message.error('提交失败，请重试')
          })
        }
      })
    },

    handleClear(field) {
      this.$set(this.editForm, field, null)
    },

    handleInputChange(field) {
      if (this.editForm[field] === '') {
        this.$set(this.editForm, field, null)
      }
    }
  },

  mounted() {
    if (this.activeTab === 'online') {
      this.getList()
    }
  },

  created() {
    const now = new Date()
    // const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
    // this.queryParams.dtRange = [thirtyMinutesAgo, now]

    this.$set(this.queryParams, 'dtRange', [dateToStr(new Date(now.getTime() - 30 * 60 * 1000)),
      dateToStr(new Date())])
  }
}

</script>

<style lang="scss" scoped>
::v-deep .el-table {
  margin-top: 5px;
}

::v-deep .el-form-item {
  margin-top: 5px;
  margin-bottom: 5px !important;
}

::v-deep .el-dialog .el-form .el-collapse .el-collapse-item .el-collapse .el-collapse-item .el-form-item:has(.el-input) {
  margin-top: 5px;
  margin-bottom: 18px !important;
}

.import-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.upload-demo {
  border: 2px dashed #d9d9d9;
  background-color: #fff;
  border-radius: 6px;
  text-align: center;
  padding: 20px;
}

.el-upload__text {
  font-size: 16px;
  color: #606266;
}

.el-upload__tip {
  color: #909399;
}

.el-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
}

.el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
}

.el-table td,
.el-table th {
  text-align: center;
}

.card-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

/*online部分*/
::v-deep .el-collapse-item__header {
  font-size: 16px; /* 调整字体大小 */
  font-weight: bold; /* 调整字体粗细 */
  color: #333; /* 调整字体颜色 */
}

::v-deep .el-collapse-item.main-item .el-collapse-item__header {
  font-size: 18px; /* 主项字体大小 */
  font-weight: bold; /* 主项字体粗细 */
  color: #1f2d3d; /* 主项字体颜色 */
}

::v-deep .el-collapse-item.sub-item .el-collapse-item__header {
  font-size: 16px; /* 子项字体大小 */
  font-weight: normal; /* 子项字体粗细 */
  color: #409eff; /* 子项字体颜色 */
}

.rotated-col {
  writing-mode: vertical-rl;
  text-align: left;
  transform: rotate(-0deg);
  transform-origin: left top;
  white-space: nowrap;
  margin-top: 10px; /* 根据需要调整 */
  margin-bottom: 10px; /* 根据需要调整 */
}


.prop-container {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.prop-label {
  font-weight: bold;
  margin-right: 5px;
}

.prop-separator {
  margin-right: 5px;
}

.prop-value {
  display: inline-block;
}

.prop-value.enabled {
  color: green;
}

.prop-value.disabled {
  color: red;
}

/* 覆盖特定列的 cell 样式 */
::v-deep td.el-table_1_column_9.is-center.el-table__cell > div.cell {
  padding: 0 !important; /* 覆盖 padding */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.btn-ops-cell {
  display: flex;
  flex-direction: column; /* 将按钮垂直排列 */
  align-items: center;    /* 水平居中 */
  justify-content: center; /* 垂直居中 */
  height: 100%;           /* 让父容器占满整个单元格的高度 */
}

/* 按钮的样式 */
.btn-ops {
  width: 100%;
  text-align: center;
  margin: 5px 0;
}

.btn-ops:last-child {
  margin-bottom: 0;    /* 去掉最后一个按钮的下边距 */
}

.fade-leave-to {
  display: none;
}

.custom-descriptions-item .el-descriptions__label {
  width: 50% !important;
}

.custom-descriptions-item .el-descriptions__content {
  width: 50% !important;
}

</style>
