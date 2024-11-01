<template>
  <div class="bs-sysMsg" v-if="systemMsg.length > 0">
    <i class="el-alert__icon el-icon-warning"></i>
    <div class="msg__content">
      <el-carousel height="20px" direction="vertical" indicator-position="none" :autoplay="true">
        <el-carousel-item v-for="item in systemMsg" :key="item.id">
          <a href="javascript:void(0)" class="item">{{item.title}}</a>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Carousel',

  data(){
    return{
      // 滚屏消息
      systemMsg: [
        {id:1,title:'入主白宫近10日 拜登做了10件大事'},
        {id:2,title:'全民带货？小红书外链淘宝权限将大范围开放'},
        {id:3,title:'贾跃亭FF将在纳斯达克上市 股票代码为FFIE'}
      ],
    }
  }
}
</script>

<style scoped>
/*轮翻消息*/
.bs-sysMsg {
  position: relative;
  display: flex;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 10px;
  border-radius: 2px;
  color: #e6a23c;
  background-color: #fdf6ec;
  overflow: hidden;
  opacity: 1;
  align-items: center;
  transition: opacity .2s;
}
.bs-sysMsg .msg__content {
  display: table-cell;
  padding: 0 8px;
  width: 100%;
}
.bs-sysMsg .msg__content a.item {
  color: #e6a23c;
  font-size: 14px;
  opacity: 0.75;
}
.bs-sysMsg .msg__content a.item:hover{text-decoration: underline;}

</style>
