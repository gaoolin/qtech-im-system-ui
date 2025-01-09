<template>
  <div class="visualization-container" ref="visualizationContainer">
    <!-- 显示鼠标指针所指向的三维坐标 -->
    <div class="coordinate-display" ref="coordinateDisplay">
      X: {{ coordinates.x.toFixed(2) }},
      Y: {{ coordinates.y.toFixed(2) }},
      Z: {{ coordinates.z.toFixed(2) }}
    </div>
  </div>
</template>

<script>
import * as THREE from "three"; // 引入 Three.js 库
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; // 引入 OrbitControls 控件

export default {
  name: "WireBondingVisualization",
  data() {
    return {
      scene: null, // 场景对象
      camera: null, // 摄像机对象
      renderer: null, // 渲染器对象
      controls: null, // 轨道控制器
      raycaster: null, // 光线投射器，用于鼠标拾取
      mouse: new THREE.Vector2(), // 鼠标在二维屏幕上的位置
      coordinates: {
        x: 0, // 鼠标拾取点的 X 坐标
        y: 0, // 鼠标拾取点的 Y 坐标
        z: 0, // 鼠标拾取点的 Z 坐标
      },
      animationId: null, // 动画帧请求的 ID
    };
  },
  mounted() {
    this.initScene(); // 初始化 Three.js 场景
    this.createLighting(); // 创建光源
    this.createAxesHelper(); // 添加坐标轴辅助器
    this.createPCB(); // 创建电路板
    this.createChip(); // 创建晶圆
    this.createGoldFingers(); // 创建金手指
    this.createWires(); // 创建金线
    this.animate(); // 开始动画渲染

    // 添加窗口大小改变和鼠标移动事件监听
    window.addEventListener("resize", this.onWindowResize);
    window.addEventListener("mousemove", this.onMouseMove);
  },
  beforeDestroy() {
    // 清理动画帧、事件监听和场景资源
    window.cancelAnimationFrame(this.animationId);
    window.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("mousemove", this.onMouseMove);
    this.renderer.dispose();
    this.scene = null;
  },
  methods: {
    // 初始化 Three.js 场景
    initScene() {
      const container = this.$refs.visualizationContainer;
      const width = container.clientWidth;
      const height = container.clientHeight;

      this.scene = new THREE.Scene(); // 创建场景
      this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000); // 创建透视摄像机
      this.camera.position.set(0, 150, 200); // 设置摄像机位置
      this.camera.lookAt(0, 0, 0); // 设置摄像机的观察点

      this.renderer = new THREE.WebGLRenderer({ antialias: true }); // 创建渲染器并启用抗锯齿
      this.renderer.setSize(width, height); // 设置渲染器大小
      this.renderer.shadowMap.enabled = true; // 启用阴影映射
      container.appendChild(this.renderer.domElement); // 将渲染器的 DOM 元素添加到容器中

      this.controls = new OrbitControls(this.camera, this.renderer.domElement); // 创建轨道控制器
      this.controls.enableDamping = true; // 启用阻尼效果

      this.raycaster = new THREE.Raycaster(); // 初始化光线投射器
    },

    // 创建光源
    createLighting() {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // 创建环境光
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // 创建方向光
      directionalLight.position.set(100, 200, 100); // 设置方向光位置
      directionalLight.castShadow = true; // 启用阴影投射
      this.scene.add(directionalLight);
    },

    // 显示坐标系辅助工具
    createAxesHelper() {
      const axesHelper = new THREE.AxesHelper(100); // 创建坐标轴辅助器
      this.scene.add(axesHelper);
    },

    // 创建电路板
    createPCB() {
      const pcbGeometry = new THREE.BoxGeometry(120, 5, 80); // 电路板的几何形状
      const pcbMaterial = new THREE.MeshStandardMaterial({ color: 0x006600 }); // 电路板的材质
      const pcb = new THREE.Mesh(pcbGeometry, pcbMaterial); // 创建电路板网格对象
      pcb.position.set(0, 2.5, 0); // 设置电路板位置
      pcb.receiveShadow = true; // 启用接收阴影
      this.scene.add(pcb);
    },

    // 创建晶圆
    createChip() {
      const chipGeometry = new THREE.BoxGeometry(96, 4, 64); // 晶圆的几何形状
      const chipMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 }); // 晶圆的材质
      const chip = new THREE.Mesh(chipGeometry, chipMaterial); // 创建晶圆网格对象
      chip.position.set(0, 7, 0); // 设置晶圆位置
      chip.castShadow = true; // 启用阴影投射
      this.scene.add(chip);
    },

    // 创建金手指
    createGoldFingers() {
      const fingerMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // 金手指材质

      // 创建电路板上的金手指
      for (let i = -50; i <= 50; i += 10) {
        const fingerGeometry = new THREE.BoxGeometry(4, 1, 6); // 金手指的几何形状

        // 顶部金手指
        const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
        finger.position.set(i, 5, 38);
        finger.castShadow = true;
        this.scene.add(finger);

        // 底部金手指
        const finger2 = new THREE.Mesh(fingerGeometry, fingerMaterial);
        finger2.position.set(i, 5, -38);
        finger2.castShadow = true;
        this.scene.add(finger2);
      }

      // 创建晶圆上的金手指
      for (let i = -40; i <= 40; i += 10) {
        const fingerGeometry = new THREE.BoxGeometry(4, 1, 6);

        // 顶部金手指
        const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
        finger.position.set(i, 9, 30);
        finger.castShadow = true;
        this.scene.add(finger);

        // 底部金手指
        const finger2 = new THREE.Mesh(fingerGeometry, fingerMaterial);
        finger2.position.set(i, 9, -30);
        finger2.castShadow = true;
        this.scene.add(finger2);
      }
    },

    // 创建焊点
    addWeldingPoint(position) {
      const sphereGeometry = new THREE.SphereGeometry(1.5, 16, 16); // 焊点的几何形状
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xffa500, // 焊点的颜色
        metalness: 0.7, // 金属光泽
        roughness: 0.2, // 粗糙度
      });
      const weldingPoint = new THREE.Mesh(sphereGeometry, sphereMaterial); // 创建焊点网格对象
      weldingPoint.position.copy(position); // 设置焊点位置
      weldingPoint.castShadow = true; // 启用阴影投射
      this.scene.add(weldingPoint);
    },

    // 创建金线
    createWires() {
      const wireMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // 金线材质

      // 创建从电路板到晶圆的金线
      for (let i = -40; i <= 40; i += 10) {
        const controlPoints = [
          new THREE.Vector3(i, 3.5, 38), // 起点
          new THREE.Vector3(i, 10, 34), // 控制点
          new THREE.Vector3(i, 8.5, 30), // 终点
        ];
        const curve = new THREE.CatmullRomCurve3(controlPoints); // 创建曲线
        const wireGeometry = new THREE.TubeGeometry(curve, 64, 0.2, 8, false); // 创建金线几何形状
        const wire = new THREE.Mesh(wireGeometry, wireMaterial); // 创建金线网格对象
        this.scene.add(wire);
        this.addWeldingPoint(controlPoints[0]); // 添加起点焊点
        this.addWeldingPoint(controlPoints[2]); // 添加终点焊点

        const controlPoints2 = [
          new THREE.Vector3(i, 3.5, -38),
          new THREE.Vector3(i, 10, -34),
          new THREE.Vector3(i, 8.5, -30),
        ];
        const curve2 = new THREE.CatmullRomCurve3(controlPoints2);
        const wireGeometry2 = new THREE.TubeGeometry(curve2, 64, 0.2, 8, false);
        const wire2 = new THREE.Mesh(wireGeometry2, wireMaterial);
        this.scene.add(wire2);
        this.addWeldingPoint(controlPoints2[0]);
        this.addWeldingPoint(controlPoints2[2]);
      }
    },

    // 动画渲染循环
    animate() {
      this.animationId = requestAnimationFrame(this.animate); // 请求下一帧
      this.controls.update(); // 更新轨道控制器
      this.renderer.render(this.scene, this.camera); // 渲染场景
    },

    // 窗口尺寸改变事件
    onWindowResize() {
      const container = this.$refs.visualizationContainer;
      this.camera.aspect = container.clientWidth / container.clientHeight; // 更新摄像机的宽高比
      this.camera.updateProjectionMatrix(); // 更新摄像机投影矩阵
      this.renderer.setSize(container.clientWidth, container.clientHeight); // 更新渲染器尺寸
    },

    // 鼠标移动事件
    onMouseMove(event) {
      const container = this.$refs.visualizationContainer;
      const rect = container.getBoundingClientRect(); // 获取容器的尺寸和位置
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; // 转换鼠标 X 坐标
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; // 转换鼠标 Y 坐标
      this.raycaster.setFromCamera(this.mouse, this.camera); // 更新光线投射器
      const intersects = this.raycaster.intersectObjects(this.scene.children); // 检测光线与场景中的对象的交点
      if (intersects.length > 0) {
        const point = intersects[0].point; // 获取交点的坐标
        this.coordinates.x = point.x;
        this.coordinates.y = point.y;
        this.coordinates.z = point.z;
      }
    },
  },
};
</script>

<style scoped>
.visualization-container {
  width: 100%;
  height: 800px;
  background: #1a1a1a; /* 深色背景 */
  position: relative;
}

.coordinate-display {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: white;
  background: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px; /* 字体大小 */
}
</style>
