<template>
  <div class="app-container">
    <el-form ref="headQueryForm" :model="queryParams" :inline="false" label-width="68px" label-position="right">
      <el-row :gutter="20">
        <el-col :md="6" :sm="12">
          <el-form-item label="料号" prop="materialId">
            <el-input v-model="queryParams.materialId" placeholder="查询单个料号的因子值" clearable/>
          </el-form-item>
        </el-col>
        <el-col :md="6" :sm="12">
          <el-form-item label="机型" prop="prodType">
            <el-input v-model="queryParams.prodType" placeholder="查询到可共用的治具后输入机型" clearable/>
          </el-form-item>
        </el-col>
        <el-col :md="6" :sm="12">
          <el-form-item label="因子浮动范围（±%）" prop="deviation" label-width="150px">
            <el-slider v-model="queryParams.deviation" :step="10" show-input :format-tooltip="formatTooltip">
            </el-slider>
          </el-form-item>
        </el-col>
        <el-col :md="6" :sm="12">
          <div class="right-handle-group">
            <el-button-group>
              <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">查询</el-button>
              <el-button type="primary" icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
            </el-button-group>
            <a style="margin-left: 8px" @click="toggleAdvanced">
              {{ advanced ? '收起' : '展开' }}
              <!-- 我们通过vue给class动态赋值，
              添加一个三元判断，判断icon是向下还是向上，这个向下向的状态是基于
              advanced的状态 -->
              <i :class="advanced ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"/>
            </a>
          </div>
        </el-col>
      </el-row>
    </el-form>
    <el-form ref="queryForm" :model="queryParams" :rules="rules" :inline="true" v-show="showSearch" label-width="120px"
             label-position="left">
      <el-row :gutter="20">
        <!--          <el-divider><i class="el-icon-mobile-phone"></i></el-divider>-->
        <el-col :md="4" :sm="12">
          <el-form-item label="连接器型号" prop="connectorModel">
            <el-input v-model="queryParams.connectorModel" placeholder="连接器型号" clearable
                      @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :md="4" :sm="12">
          <el-form-item label="产品类别" prop="fixtureCategory">
            <el-input v-model="queryParams.fixtureCategory" placeholder="产品类别" clearable
                      @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :md="4" :sm="12">
          <el-form-item label="连接器总宽" prop="connectorTtlWidth">
            <el-input v-model="queryParams.connectorTtlWidth" placeholder="连接器总宽" clearable
                      @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :md="4" :sm="12">
          <el-form-item label="连接器总长" prop="connectorTtlLength">
            <el-input v-model="queryParams.connectorTtlLength" placeholder="连接器总长" clearable
                      @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :md="4" :sm="12">
          <el-form-item label="连接器露铜部宽" prop="connectorExposedCopperWidth">
            <el-input v-model="queryParams.connectorExposedCopperWidth" placeholder="连接器露铜部宽" clearable
                      @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :md="4" :sm="12">
          <el-form-item label="引脚PIN数" prop="pinPins">
            <el-input v-model="queryParams.pinPins" placeholder="引脚PIN数" clearable @keyup.enter.native="handleQuery"/>
          </el-form-item>
        </el-col>

        <el-collapse-transition>
          <!-- 这里我们用v-show来判断是否显示那些被深深包裹的检索条件，还涉及到一个知识点，
          我们用v-show而不用v-if，是因为这里需要频繁切换，v-show和v-if应用不清楚
          的同学要去好好学习一下啦-->
          <div v-show="advanced">
            <el-col :md="4" :sm="12">
              <el-form-item label="引脚PIN间距" prop="pinSpacing">
                <el-input v-model="queryParams.pinSpacing" placeholder="引脚PIN间距" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="是否有固定PIN" prop="isFixedPin">
                <el-input v-model="queryParams.isFixedPin" placeholder="是否有固定PIN" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="连接器钢片宽度" prop="connectorSheetWidth">
                <el-input v-model="queryParams.connectorSheetWidth" placeholder="连接器钢片宽度" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="连接器钢片长度" prop="connectorSheetLength">
                <el-input v-model="queryParams.connectorSheetLength" placeholder="连接器钢片长度" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="模组头部宽度" prop="moduleHeadWidth">
                <el-input v-model="queryParams.moduleHeadWidth" placeholder="模组头部宽度" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="模组头部长度" prop="moduleHeadLength">
                <el-input v-model="queryParams.moduleHeadLength" placeholder="模组头部长度" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="模组本体高度" prop="moduleBodyHeight">
                <el-input v-model="queryParams.moduleBodyHeight" placeholder="模组本体高度" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="LENS中心到连接器中心高度" prop="heightOfLensCenterToConnectorCenter" label-width="200px">
                <el-input v-model="queryParams.heightOfLensCenterToConnectorCenter" placeholder="LENS中心到连接器中心高度"
                          clearable @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="连接器基板厚度" prop="connectorSubstrateThickness">
                <el-input v-model="queryParams.connectorSubstrateThickness" placeholder="连接器基板厚度" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="LENS中心到连接器中心高度左右偏移量" prop="leftRightOffsetHeightHensCenterToConnectorCenter"
                            label-width="260px"
              >
                <el-input v-model="queryParams.leftRightOffsetHeightHensCenterToConnectorCenter"
                          placeholder="LENS中心到连接器中心高度左右偏移量" clearable @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="FOV角度" prop="fovAngle">
                <el-input v-model="queryParams.fovAngle" placeholder="FOV角度" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="是否常规FPC" prop="isRegularFpc">
                <el-input v-model="queryParams.isRegularFpc" placeholder="是否常规FPC" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>

            <el-col :md="4" :sm="12">
              <el-form-item label="FPC最大宽度" prop="fpcMaximumWidth">
                <el-input v-model="queryParams.fpcMaximumWidth" placeholder="FPC最大宽度" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="模组摆放方向" prop="modulePlacement">
                <el-input v-model="queryParams.modulePlacement" placeholder="模组摆放方向" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="机台" prop="mcId">
                <el-input v-model="queryParams.mcId" placeholder="机台" clearable @keyup.enter.native="handleQuery"/>
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="测试工装" prop="testFixtures">
                <el-input v-model="queryParams.testFixtures" placeholder="测试工装" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :md="4" :sm="12">
              <el-form-item label="产品类型" prop="prodLevel">
                <el-input v-model="queryParams.prodLevel" placeholder="产品类型" clearable
                          @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
          </div>
        </el-collapse-transition>
      </el-row>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAddAndUpdate(1, null)"
          v-hasPermi="['fixture:search:add']"
        >新增料号
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['fixture:params:export']"
        >导出
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          size="mini"
          @click="handleFixtureCategoryManage"
        >
          <span>管理治具类型</span>
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="tableData"
      fit
      class="tableArea mt10"
      style="font-size: 14px;"
      cell-mouse-enter
      cell-mouse-leave
      :header-cell-style="tableHeaderCellStyle"
      border
    >
      <el-table-column fixed prop="materialId" label="料号" align="center" width="120"/>
      <el-table-column fixed prop="fixtureName" label="品名" align="center" width="120"/>
      <el-table-column fixed prop="fixtureSpec" label="规格" align="center" width="120"/>
      <el-table-column prop="buckle" label="连接器朝向" align="center" width="120" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.fixture_buckle_status" :value="scope.row.buckle"></dict-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fixtureVersion" label="治具版本" align="center" width="120" />
      <el-table-column prop="connectorModel" label="连接器型号" align="center" width="120" />
      <el-table-column prop="fixtureCategory" label="治具类型" align="center" width="120" />
      <el-table-column prop="connectorTtlWidth" label="连接器总宽" align="center" width="120" />
      <el-table-column prop="connectorTtlLength" label="连接器总长" align="center" width="120" />
      <el-table-column prop="connectorExposedCopperWidth" label="连接器露铜部宽" align="center" width="120" />
      <el-table-column prop="pinPins" label="引脚pin数" align="center" width="120" />
      <el-table-column prop="pinSpacing" label="引脚PIN间距" align="center" width="120"/>
      <el-table-column prop="isFixedPin" label="是否有固定PIN" align="center" width="120" />
      <el-table-column prop="connectorSheetWidth" label="连接器钢片宽度" align="center" width="120" />
      <el-table-column prop="connectorSheetLength" label="连接器钢片长度" align="center" width="120"/>
      <el-table-column prop="moduleHeadWidth" label="模组头部宽度" align="center" width="120" />
      <el-table-column prop="moduleHeadLength" label="模组头部长度" align="center" width="120" />
      <el-table-column prop="moduleBodyHeight" label="模组本体高度" align="center" width="120" />
      <el-table-column prop="heightOfLensCenterToConnectorCenter" label="LENS中心到连接器中心高度" align="center" width="120" />
      <el-table-column prop="connectorSubstrateThickness" label="连接器基板厚度" align="center" width="120" />
      <el-table-column prop="leftRightOffsetHeightHensCenterToConnectorCenter" label="LENS中心到连接器中心高度左右偏移量" align="center" width="120" />
      <el-table-column prop="fovAngle" label="FOV角度" align="center" width="120" />
      <el-table-column prop="isRegularFpc" label="是否常规FPC" align="center" width="120" />
      <el-table-column prop="fpcMaximumWidth" label="FPC最大宽度" align="center" width="120" />
      <el-table-column prop="modulePlacement" label="模组摆放方向" align="center" width="120" />
      <el-table-column prop="mcId" label="机台" align="center" width="120" />
      <el-table-column prop="testFixtures" label="测试工装" align="center" width="120" />
      <el-table-column prop="prodLevel" label="产品类型" align="center" width="120" />
      <el-table-column fixed="right" label="操作" align="center" width="100" >
        <template slot-scope="scope">
          <div class="box-ops">
            <el-button @click="" type="text" size="small">编辑</el-button>
            <el-button
              size="mini"
              type="text"
              @click="handleAddAndUpdate(2, scope.row)"
              v-hasPermi="['fixture:search:add']"
            >新增共用机型
            </el-button>
          </div>
          <div class="box-ops">
            <el-button
              size="mini"
              type="text"
              @click="handleAddAndUpdate(3, scope.row)"
              v-hasPermi="['fixture:search:edit']"
            >修改
            </el-button>
            <el-popover
              style="margin-left: 5px"
              placement="top"
              width="160"
              content="请选择要删除的内容"
            >
              <p>请选择要删除的内容！</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="handleDelete(scope.row, 1)">料号</el-button>
                <el-button type="primary" size="mini" @click="handleDelete(scope.row, 2)">机型</el-button>
              </div>
              <el-button slot="reference" size="mini" type="text">删除</el-button>
            </el-popover>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!--   添加治具对话框   -->
    <modal-udf :title="title" :dialogShow="addFixtureOpen" :width="'30%'" :isCloseOnClick="false" @closeChildDialog="closeChildDialog" v-dialogDrag v-dialogDragWidth v-dialogDragHeight >
      <el-form ref="fixtureForm" :model="form" :rules="rules" label-width="110px" >
        <el-form-item label="料号" prop="materialId">
          <el-input v-model="form.materialId" type="text" autocomplete="off" :disabled="materialIdDisabled" placeholder="请输入料号" />
        </el-form-item>
        <el-form-item label="品名" prop="fixtureName">
          <el-input v-model="form.fixtureName" placeholder="请输入品名" :disabled="othersDisabled "/>
        </el-form-item>
        <el-form-item label="规格" prop="fixtureSpec">
          <el-input v-model="form.fixtureSpec" placeholder="请输入规格" type="textarea" :disabled="othersDisabled"/>
        </el-form-item>
        <el-form-item label="治具版本" prop="fixtureVersion">
          <el-input v-model="form.fixtureVersion" placeholder="请输入治具版本" :disabled="othersDisabled"/>
        </el-form-item>
        <el-form-item label="连接器朝向" prop="buckle">
          <el-radio-group v-model="form.buckle" :disabled="othersDisabled">
            <el-radio
              v-for="dict in dict.type.fixture_buckle_status"
              :key="dict.value"
              :label="dict.value"
            >{{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="治具类型" prop="fixtureCategory">
          <!-- 请求返回的form.fixtureCategory是 int 类型，字典的key是string类型，需要把int转成string，否则输入框不能自动转换成value/label -->
          <el-select v-model="form.fixtureCategory" placeholder="请选择治具类型" clearable :disabled="othersDisabled">
            <el-option
              v-for="item in categoryOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="连接器型号" prop="connectorModel">
          <el-input v-model="queryParams.connectorModel" placeholder="连接器型号" clearable />
        </el-form-item>
        <el-form-item label="连接器总宽" prop="connectorTtlWidth">
          <el-input v-model="queryParams.connectorTtlWidth" placeholder="连接器总宽" clearable />
        </el-form-item>
        <el-form-item label="连接器总长" prop="connectorTtlLength">
          <el-input v-model="queryParams.connectorTtlLength" placeholder="连接器总长" clearable />
        </el-form-item>
        <el-form-item label="连接器露铜部宽" prop="connectorExposedCopperWidth">
          <el-input v-model="queryParams.connectorExposedCopperWidth" placeholder="连接器露铜部宽" clearable />
        </el-form-item>
        <el-form-item label="引脚PIN数" prop="pinPins">
          <el-input v-model="queryParams.pinPins" placeholder="引脚PIN数" clearable />
        </el-form-item>
        <el-form-item label="引脚PIN间距" prop="pinSpacing">
          <el-input v-model="queryParams.pinSpacing" placeholder="引脚PIN间距" clearable />
        </el-form-item>
        <el-form-item label="是否有固定PIN" prop="isFixedPin">
          <el-input v-model="queryParams.isFixedPin" placeholder="是否有固定PIN" clearable />
        </el-form-item>
        <el-form-item label="连接器钢片宽度" prop="connectorSheetWidth">
          <el-input v-model="queryParams.connectorSheetWidth" placeholder="连接器钢片宽度" clearable />
        </el-form-item>
        <el-form-item label="连接器钢片长度" prop="connectorSheetLength">
          <el-input v-model="queryParams.connectorSheetLength" placeholder="连接器钢片长度" clearable />
        </el-form-item>
        <el-form-item label="模组头部宽度" prop="moduleHeadWidth">
          <el-input v-model="queryParams.moduleHeadWidth" placeholder="模组头部宽度" clearable />
        </el-form-item>
        <el-form-item label="模组头部长度" prop="moduleHeadLength">
          <el-input v-model="queryParams.moduleHeadLength" placeholder="模组头部长度" clearable />
        </el-form-item>
        <el-form-item label="模组本体高度" prop="moduleBodyHeight">
          <el-input v-model="queryParams.moduleBodyHeight" placeholder="模组本体高度" clearable />
        </el-form-item>
        <el-form-item label="LENS中心到连接器中心高度" prop="heightOfLensCenterToConnectorCenter" label-width="200px">
          <el-input v-model="queryParams.heightOfLensCenterToConnectorCenter" placeholder="LENS中心到连接器中心高度" clearable />
        </el-form-item>
        <el-form-item label="连接器基板厚度" prop="connectorSubstrateThickness">
          <el-input v-model="queryParams.connectorSubstrateThickness" placeholder="连接器基板厚度" clearable />
        </el-form-item>
        <el-form-item label="LENS中心到连接器中心高度左右偏移量" prop="leftRightOffsetHeightHensCenterToConnectorCenter" label-width="260px" >
          <el-input v-model="queryParams.leftRightOffsetHeightHensCenterToConnectorCenter" placeholder="LENS中心到连接器中心高度左右偏移量" clearable />
        </el-form-item>
        <el-form-item label="FOV角度" prop="fovAngle">
          <el-input v-model="queryParams.fovAngle" placeholder="FOV角度" clearable />
        </el-form-item>
        <el-form-item label="是否常规FPC" prop="isRegularFpc">
          <el-input v-model="queryParams.isRegularFpc" placeholder="是否常规FPC" clearable />
        </el-form-item>
        <el-form-item label="FPC最大宽度" prop="fpcMaximumWidth">
          <el-input v-model="queryParams.fpcMaximumWidth" placeholder="FPC最大宽度" clearable />
        </el-form-item>
        <el-form-item label="模组摆放方向" prop="modulePlacement">
          <el-input v-model="queryParams.modulePlacement" placeholder="模组摆放方向" clearable />
        </el-form-item>
        <el-form-item label="机台" prop="mcId">
          <el-input v-model="queryParams.mcId" placeholder="机台" clearable />
        </el-form-item>
        <el-form-item label="测试工装" prop="testFixtures">
          <el-input v-model="queryParams.testFixtures" placeholder="测试工装" clearable />
        </el-form-item>
        <el-form-item label="产品类型" prop="prodLevel">
          <el-input v-model="queryParams.prodLevel" placeholder="产品类型" clearable />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" type="textarea"/>
        </el-form-item>
      </el-form>
    </modal-udf>

    <!-- 添加治具类型对话框 -->
    <el-dialog :title="title" :visible.sync="addFixtureCategoryOpen" width="800px" append-to-body :close-on-click-modal='false' v-dialogDrag v-dialogDragWidth >
      <el-tabs v-model="activeName" type="border-card">
        <el-tab-pane label="新增治具类型" name="first">
          <el-form ref="fixtureCategoryForm" :model="fixtureCategoryForm" label-width="155px">
            <el-form-item label="治具类型名称" prop="fixtureCategory" >
              <el-input v-model="fixtureCategoryForm.fixtureCategory" @change="fixtureCategoryChange" placeholder="请输入治具类型名称" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="修改治具类型" name="second">
          <el-table
            v-if="activeName === 'second'"
            v-loading="fixtureCategoryLoading"
            :data="fixtureCategoryList"
            fit
            class="tableArea"
            style="font-size: 14px;"
            cell-mouse-enter
            cell-mouse-leave
            cell-class-name
            border>
            <el-table-column label="序号" type="index" min-width="15" align="center" />
            <el-table-column label="治具类型" align="center" min-width="50" prop="fixtureCategory" >
              <template slot-scope="scope">
                <el-input v-model="scope.row.fixtureCategory" v-if="scope.row.seen"></el-input>
                <span style="margin-left: 10px" v-else>{{ scope.row.fixtureCategory }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" min-width="15" class-name="small-padding fixed-width" style="font-size: 10px" >
              <template slot-scope="{row, $index}">
                <el-button size="mini" type="text" @click="handleFixtureCategoryEdit(row, $index)">{{row.compile}}</el-button>
                <el-button type="text" size="mini" @click="handleFixtureCategoryRemove(row, $index)" v-if="row.isDelete">{{ "删除" }}</el-button>
                <el-button type="text" size="mini" @click="tabCancel(row, $index)" v-if="row.cancel">{{"取消"}}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="fixtureCategoryTotal>0"
            :total="fixtureCategoryTotal"
            :page.sync="fixtureCategoryForm.fixtureCategoryPageNum"
            :limit.sync="fixtureCategoryForm.fixtureCategoryPageSize"
            :layout="'total, prev, pager, next'"
            @pagination="getFixtureCategoryListTab"
          />
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listFixtureFactorPogopin,
  getFixture,
  addFixture,
  addFixtureCategory,
  delFixture,
  updateFixture,
  deleteFixtureCategory,
  fixtureCategoryList,
  updateFixtureCategory,
  fixtureCategoryAll
} from '@/api/biz/fixture/fixture'
import ModalUdf from '@/views/biz/common/ModalUdf'

export default {
  name: 'PogopinBak1',
  dicts: ['biz_fixture_category', 'fixture_buckle_status', 'biz_fixture_project'],

  components: { ModalUdf },
  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      // 遮罩层
      loading: true,
      fixtureCategoryLoading: true,
      // 总条数
      total: 0,
      fixtureCategoryTotal: 0,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      addFixtureOpen: false,
      addFixtureCategoryOpen: false,
      tableData: [],
      fixtureCategoryList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deptId: '209',
        materialId: null,
        prodType: null,
        deviation: 0,
        connectorModel: null,
        fixtureCategory: null,
        connectorTtlWidth: null,
        connectorTtlLength: null,
        connectorExposedCopperWidth: null,
        pinPins: null,
        pinSpacing: null,
        isFixedPin: null,
        connectorSheetWidth: null,
        connectorSheetLength: null,
        moduleHeadWidth: null,
        moduleHeadLength: null,
        moduleBodyHeight: null,
        heightOfLensCenterToConnectorCenter: null,
        connectorSubstrateThickness: null,
        leftRightOffsetHeightHensCenterToConnectorCenter: null,
        fovAngle: null,
        isRegularFpc: null,
        fpcMaximumWidth: null,
        modulePlacement: null,
        mcId: null,
        testFixtures: null,
        prodLevel: null
      },
      deptIds: [],
      // 表单参数
      fixtureCategoryForm: {
        fixtureCategoryPageNum: 1,
        fixtureCategoryPageSize: 10,
        deptId: '209',
        cId: null,
        fixtureCategory: null
      },
      form: {
        deptId: '209',
        materialId: null,
        fixtureCategory: null,
        connectorModel: null,
        buckle: null,
        fixtureName: null,
        fixtureVersion: null,
        connectorTtlWidth: null,
        connectorTtlLength: null,
        connectorExposedCopperWidth: null,
        pinPins: null,
        pinSpacing: null,
        isFixedPin: null,
        connectorSheetWidth: null,
        connectorSheetLength: null,
        moduleHeadWidth: null,
        moduleHeadLength: null,
        moduleBodyHeight: null,
        heightOfLensCenterToConnectorCenter: null,
        connectorSubstrateThickness: null,
        leftRightOffsetHeightHensCenterToConnectorCenter: null,
        fovAngle: null,
        isRegularFpc: null,
        fpcMaximumWidth: null,
        modulePlacement: null,
        mcId: null,
        testFixtures: null,
        prodLevel: null,
        remark: null
      },
      fixtureCategoryElementChange: false,
      rules: {
        materialId: [
          { required: true, message: '请输入需要新增的料号', trigger: 'blur' },
          { min: 8, max: 20, message: '长度在 8 到 20 个字符', trigger: 'blur' },
          { validator: this.materialIdRules, trigger: 'blur' }],
        fixtureCategory: [
          { required: true, message: '请输入治具类型', trigger: 'change' },
          { validator: this.fixtureCategoryRules, trigger: 'change' }],
        prodType: [
          { required: true, message: '请输入机种名称', trigger: 'blur' },
          { validator: this.prodTypeRules, trigger: 'blur' }
        ]
      },
      rulesAddShared: {
        prodType: [
          { required: true, message: '请输入机种名称', trigger: 'blur' },
          { validator: this.prodTypeRules, trigger: 'blur' }
        ]
      },
      rulesUpdate: {
        fixtureCategory: [
          { required: true, message: '请输入治具类型', trigger: 'change' },
          { validator: this.fixtureCategoryRules, trigger: 'change' }],
        prodType: [
          { required: true, message: '请输入机种名称', trigger: 'blur' },
          { validator: this.prodTypeRules, trigger: 'blur' }
        ]
      },
      // 治具类型选择器
      categoryOptions: [],
      // 修改时，治具类型是否可修改
      materialIdDisabled: false,
      prodTypeDisabled: false,
      othersDisabled: false,
      activeName: 'first',
      advanced: false//这个是关键，我们用它来判断展开/收起
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    // 点击文字，改变状态
    toggleAdvanced() {
      this.advanced = !this.advanced
    },
    // 获取pogopin治具因子
    getList() {
      this.loading = true
      listFixtureFactorPogopin(this.queryParams).then(response => {
        this.tableData = response.rows
        this.loading = false
        this.getFixtureCategoryList(); // 首页治具类型下拉框数据
      })
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetFixture() {
      //重置form表单
      this.$refs['fixtureForm'].resetFields();
      console.log(this.form)
      // this.resetForm('fixtureForm')
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('headQueryForm')
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 表单重置
    fixtureCategoryReset() {
      this.fixtureCategoryForm = {
        fixtureCategoryPageNum: 1,
        fixtureCategoryPageSize: 10,
        deptId: '209',
        cId: null,
        fixtureCategory: null
      }
      this.resetForm('fixtureCategoryForm')
    },
    reset() {
      this.form = {
        deptId: '209',
        materialId: null,
        fixtureCategory: null,
        connectorModel: null,
        buckle: null,
        fixtureName: null,
        fixtureVersion: null,
        connectorTtlWidth: null,
        connectorTtlLength: null,
        connectorExposedCopperWidth: null,
        pinPins: null,
        pinSpacing: null,
        isFixedPin: null,
        connectorSheetWidth: null,
        connectorSheetLength: null,
        moduleHeadWidth: null,
        moduleHeadLength: null,
        moduleBodyHeight: null,
        heightOfLensCenterToConnectorCenter: null,
        connectorSubstrateThickness: null,
        leftRightOffsetHeightHensCenterToConnectorCenter: null,
        fovAngle: null,
        isRegularFpc: null,
        fpcMaximumWidth: null,
        modulePlacement: null,
        mcId: null,
        testFixtures: null,
        prodLevel: null,
        remark: null
      }
      this.resetForm('form')
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download('/fixture/search/export', {
        ...this.queryParams
      }, `治具信息_${new Date().getTime()}.xlsx`)
      this.reset()
    },

    /** 取消按钮 */
    cancel() {
      if (this.addFixtureOpen === true) {
        this.addFixtureOpen = false
      } else if (this.addFixtureCategoryOpen === true) {
        this.addFixtureCategoryOpen = false
      }
      this.reset()
    },

    /** 提交按钮 */
    submitForm() {
      // this.reset(); // 会丢失编辑信息
      if (this.form.submitFlag === 1) { //新增料号
        this.$refs['fixtureForm'].validate(valid => {
          if (valid) {
            addFixture(this.form).then(() => {
              this.$modal.msgSuccess('新增成功')
              this.addFixtureOpen = false
              this.getList()
            })
          }
        })
      } else if (this.form.submitFlag === 2) { // 新增机型 修改治具信息
        this.$refs['fixtureForm'].validate(valid => {
          if (valid) {
            updateFixture(this.form).then(() => {
              this.$modal.msgSuccess('修改成功')
              this.addFixtureOpen = false
              this.getList()
            })
          }
        })
      }
      if (this.form.submitFlag === 3) {
        if (this.fixtureCategoryForm.fixtureCategory !== null || this.fixtureCategoryForm.fixtureCategory !== '') {
          addFixtureCategory(this.fixtureCategoryForm).then(() => {
            this.$modal.msgSuccess('新增治具类型成功')
            this.addFixtureCategoryOpen = false
          })
        }
      } else if (this.form.submitFlag === null) {
        this.addFixtureOpen = false
        this.addFixtureCategoryOpen = false
      }
    },

    /** 删除按钮操作 */
    handleDelete(row, flag) {
      if (flag === 1) {
        this.$modal.confirm('是否删除治具料号为 ' + row.materialId + '“的数据项？').then(response => {
          const label = '' + row.mId + '-' + row.pId + '-' + 0 + '-' + this.form.deptId
          return delFixture(label).then(() => {
            this.$modal.msgSuccess('删除成功')
            this.getList()
            this.reset()
          }).catch(() => {
          })
        })
      } else if (flag === 2) {
        this.$modal.confirm('是否确认删除治具编号为"' + row.prodType + '"的数据项？').then(response => {
          const label = '' + row.mId + '-' + row.pId + '-' + 1 + '-' + this.form.deptId
          return delFixture(label).then(() => {
            this.$modal.msgSuccess('删除成功')
            this.getList()
            this.reset()
          }).catch(() => {
          })
        })
      }
    },

    /** 新增按钮操作 */
    handleAddAndUpdate(flag, row) {
      if (flag === 1) { // 添加治具
        // this.reset()
        this.addFixtureOpen = true
        this.title = '添加料号'
        this.materialIdDisabled = false
        this.prodTypeDisabled = false
        this.othersDisabled = false
        this.form.submitFlag = 1
      } else if (flag === 2) { // 添加共用机型
        this.reset()
        this.addFixtureOpen = true
        this.title = '添加共用机型'
        this.materialIdDisabled = true
        this.prodTypeDisabled = false
        this.othersDisabled = true
        this.form.materialId = row.materialId
        this.form.fixtureName = row.fixtureName
        this.form.fixtureSpec = row.fixtureSpec
        this.form.fixtureCategory = row.fixtureCategory
        this.form.fixtureVersion = row.fixtureVersion
        this.form.buckle = row.buckle
        this.form.cId = row.cId
        this.form.submitFlag = 1
      } else if (flag === 3) {
        this.reset()
        getFixture(row.id).then(response => {
          if (response.data != null) {
            // int 类型转换成 string，以便通过字典呈现
            if (row['buckle'] != null && row['buckle'] !== '') {
              response.data['buckle'] = response.data['buckle'].toString()
            }
            this.form = response.data
            this.addFixtureOpen = true
            this.title = '修改治具信息'
            this.materialIdDisabled = true
            this.prodTypeDisabled = false
            this.othersDisabled = false
            this.form.submitFlag = 2
          }
        })
      }
    },

    /** 关闭模态框 */
    closeChildDialog(flag, name) {
      if (flag === 0 || flag === 1) {
        this.cancel()
      } else if (flag ===2) {
        this.submitForm()
        this.cancel()
      } else if (flag === 3) {
        this.resetFixture()
      }
    },

    /** 治具类型管理按钮 */
    handleFixtureCategoryManage() {
      this.fixtureCategoryReset()
      this.addFixtureCategoryOpen = true
      this.title = '管理治具类型'
      this.getFixtureCategoryListTab()
    },

    /** 获取治具类型列表 */
    getFixtureCategoryListTab() {
      this.fixtureCategoryLoading = true
      fixtureCategoryList(this.fixtureCategoryForm).then(response => {
        this.fixtureCategoryList = response.rows
        this.fixtureCategoryList.forEach(item => {
          item['seen'] = false
          item['compile'] = '编辑'
          item['isDelete'] = true
          item['cancel'] = false
        })
        this.fixtureCategoryTotal = response.total
        this.fixtureCategoryLoading = false
      })
    },

    /** 编辑治具类型 */
    handleFixtureCategoryEdit(row, index) {
      row.seen = !row.seen
      if (row.seen) {
        row.compile = '保存'
        row.isDelete = false
        row.cancel = true
      } else {
        this.fixtureCategoryForm.cId = row.cId
        this.fixtureCategoryForm.fixtureCategory = row.fixtureCategory
        updateFixtureCategory(this.fixtureCategoryForm).then(() => {
          this.fixtureCategoryForm.fixtureCategory = null
          this.categoryOptions = []
          this.getFixtureCategoryList()
          this.getFixtureCategoryListTab()
          this.$message.success('更新治具类型成功！')
        })
      }
    },

    /** 删除治具类型 */
    handleFixtureCategoryRemove(row, index) {
        this.$modal.confirm('是否确认删除治具类型为"' + row.fixtureCategory + '"的数据项？').then(function() {
          return deleteFixtureCategory(row.cId);
        }).then(() => {
          this.categoryOptions = [];
          this.getFixtureCategoryList();
          this.getFixtureCategoryListTab();
          this.$modal.msgSuccess("删除治具类型成功");
          console.log(this.fixtureCategoryForm)
        }).catch(() => {});
    },

    /** 治具类型编辑按钮功能 */
    tabCancel(row, index) {
      row.compile = '编辑'
      row.seen = false
      row.cancel = false
      row.isDelete = true
    },

    /** 新增治具类型输入框触发函数 */
    fixtureCategoryChange() {
      this.form.submitFlag = 3
    },

    /** 治具类型管理 治具类型下拉框赋值*/
    getFixtureCategoryList() {
        this.categoryOptions = [];
        fixtureCategoryAll(this.fixtureCategoryForm).then(response => {
          for (const i in response.data) {
            this.categoryOptions.push(response.data[i]['fixtureCategory'])}})
    },

    /** 数据格式显示格式转换 */
    formatTooltip(val) {
      // return val / 100;
      return val
    },

    /** 表格样式函数 */
    tableHeaderCellStyle({ row, column, rowIndex, columnIndex }) {
      return ''
    }
  }
}
</script>

<style scoped>
.right-handle-group {
  float: right;
}

.font-conf /deep/ {
  color: #000000;
  font-weight: bold;
}
</style>
