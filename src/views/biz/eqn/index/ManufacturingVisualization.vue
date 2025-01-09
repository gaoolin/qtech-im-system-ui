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
  props: {
    wireData: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
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
      normalizedWireData: [], // 存储归一化后的数据
    };
  },
  mounted() {
    this.normalizedWireData = this.normalizeWireData(this.wireData); // 归一化数据
    this.initScene(); // 初始化 Three.js 场景
    this.createLighting(); // 创建光源
    this.createAxesHelper(); // 添加坐标轴辅助器
    this.createPCB(); // 创建电路板
    this.createChip(); // 创建晶圆
    this.createWires(); // 创建金线
    this.animate(); // 开始动画渲染

    // 设置 OrbitControls 的目标点为 PCB 中心
    this.controls.target.set(0, 0, 0);

    // 添加窗口大小改变和鼠标移动事件监听
    window.addEventListener("resize", this.onWindowResize);
  },
  beforeDestroy() {
    // 清理动画帧、事件监听和场景资源
    window.cancelAnimationFrame(this.animationId);
    window.removeEventListener("resize", this.onWindowResize);
    this.renderer.dispose();
    this.scene = null;
  },
  methods: {
    // 归一化数据
    normalizeWireData(wireData) {
      const leadXValues = wireData.map(d => d.leadX);
      const leadYValues = wireData.map(d => d.leadY);
      const padXValues = wireData.map(d => d.padX);
      const padYValues = wireData.map(d => d.padY);

      const centerX = (Math.min(...leadXValues.concat(padXValues)) + Math.max(...leadXValues.concat(padXValues))) / 2;
      const centerY = (Math.min(...leadYValues.concat(padYValues)) + Math.max(...leadYValues.concat(padYValues))) / 2;

      return wireData.map(d => ({
        line: d.line,
        leadX: d.leadX - centerX,
        leadY: d.leadY - centerY,
        padX: d.padX - centerX,
        padY: d.padY - centerY,
      }));
    },

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
      this.controls.enableZoom = true; // 启用缩放
      this.controls.maxDistance = 500; // 最大距离
      this.controls.minDistance = 100; // 最小距离
      this.controls.target.set(0, 0, 0); // 将旋转中心设置为 PCB 中心
      this.controls.update(); // 更新控制器
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
// 创建电路板
    createPCB() {
      const xMin = Math.min(...this.normalizedWireData.map(d => d.padX));
      const xMax = Math.max(...this.normalizedWireData.map(d => d.padX));
      const yMin = Math.min(...this.normalizedWireData.map(d => d.padY));
      const yMax = Math.max(...this.normalizedWireData.map(d => d.padY));

      const pcbWidth = (xMax - xMin) * 0.02;
      const pcbHeight = (yMax - yMin) * 0.02;

      const pcbGeometry = new THREE.BoxGeometry(pcbWidth, 5, pcbHeight); // 电路板的几何形状
      const pcbMaterial = new THREE.MeshStandardMaterial({ color: 0x006600 }); // 电路板的材质
      const pcb = new THREE.Mesh(pcbGeometry, pcbMaterial); // 创建电路板网格对象

      // 设置电路板位置，确保中心对齐到原点
      pcb.position.set((xMin + xMax) / 2 * 0.02, 2.5, (yMin + yMax) / 2 * 0.02);
      pcb.receiveShadow = true; // 启用接收阴影
      this.scene.add(pcb);
    },

// 创建晶圆
    createChip() {
      const xMin = Math.min(...this.normalizedWireData.map(d => d.leadX));
      const xMax = Math.max(...this.normalizedWireData.map(d => d.leadX));
      const yMin = Math.min(...this.normalizedWireData.map(d => d.leadY));
      const yMax = Math.max(...this.normalizedWireData.map(d => d.leadY));

      const chipWidth = (xMax - xMin) * 0.02;
      const chipHeight = (yMax - yMin) * 0.02;

      const chipGeometry = new THREE.BoxGeometry(chipWidth, 4, chipHeight); // 晶圆的几何形状
      const chipMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 }); // 晶圆的材质
      const chip = new THREE.Mesh(chipGeometry, chipMaterial); // 创建晶圆网格对象

      // 设置晶圆位置，确保中心对齐到电路板中心
      chip.position.set((xMin + xMax) / 2 * 0.02, 7, (yMin + yMax) / 2 * 0.02);
      chip.castShadow = true; // 启用阴影投射
      this.scene.add(chip);
    },



    // 创建金线
    createWires() {
      const wireMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
      this.normalizedWireData.forEach(d => {
        const controlPoints = [
          new THREE.Vector3(d.leadX, 3.5, d.leadY),
          new THREE.Vector3(d.padX, 10, d.padY),
          new THREE.Vector3(d.leadX, 8.5, d.leadY),
        ];
        const curve = new THREE.CatmullRomCurve3(controlPoints);
        const wireGeometry = new THREE.TubeGeometry(curve, 64, 0.2, 8, false);
        const wire = new THREE.Mesh(wireGeometry, wireMaterial);
        this.scene.add(wire);
      });
    },

    // 动画渲染循环
    animate() {
      this.animationId = requestAnimationFrame(this.animate);
      this.controls.update(); // 更新控制器
      this.renderer.render(this.scene, this.camera);
    },

    // 窗口尺寸改变事件
    onWindowResize() {
      const container = this.$refs.visualizationContainer;
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    },
  },
};
</script>

<style scoped>
.visualization-container {
  width: 100%;
  height: 800px;
  background: #1a1a1a;
  position: relative;
}

.coordinate-display {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
}
</style>
