<template>
  <div class="visualization-container" ref="visualizationContainer">
    <div class="toolbar">
      <button @click="resetView">重置视角</button>
      <button @click="toggleWireframe">切换线框</button>
    </div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default {
  props: {
    wireData: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2(),
      coordinates: null,
      sceneInitialized: false,
    };
  },

  mounted() {
    console.log('Mounted, initializing scene...');
    this.initScene();
    this.renderScene();  // 一开始渲染数据
    window.addEventListener("resize", this.onWindowResize);
    this.$refs.visualizationContainer.addEventListener("mousemove", this.onMouseMove);

    // 初始化 OrbitControls 确保控制器生效
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // 开启阻尼效果，增加流畅感
    this.controls.dampingFactor = 0.25; // 阻尼因子
    this.controls.screenSpacePanning = false; // 禁用平移
    this.controls.maxPolarAngle = Math.PI / 2; // 限制上下旋转角度
  },

  updated() {
    if (this.wireData && this.wireData.length) {
      this.updateScene(this.wireData);
    }
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.onWindowResize);
    this.$refs.visualizationContainer.removeEventListener("mousemove", this.onMouseMove);
    this.disposeScene(); // 清理资源
  },

  methods: {
    // 初始化场景、相机、渲染器等
    initScene() {
      const container = this.$refs.visualizationContainer;

      // 创建 Three.js 场景
      this.scene = new THREE.Scene();

      // 创建摄像机
      const aspect = container.clientWidth / container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
      this.camera.position.set(0, 150, 300);

      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({ canvas: this.$refs.canvas });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(this.renderer.domElement);

      // 创建光源
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      const pointLight = new THREE.PointLight(0xffffff, 0.8);
      pointLight.position.set(50, 150, 50);
      this.scene.add(ambientLight, pointLight);

      // 初始化 OrbitControls 并设置默认目标
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true; // 开启阻尼效果
      this.controls.dampingFactor = 0.25;
      this.controls.screenSpacePanning = false; // 禁用平移
      this.controls.maxPolarAngle = Math.PI / 2; // 限制上下旋转角度
    },

    // 根据传入的数据渲染场景
    renderScene() {
      if (this.wireData && this.wireData.length) {
        const scale = this.calculateScale(this.wireData);

        // 创建 PCB 和获取中心点
        const pcbCenter = this.createPCB(this.wireData, scale);

        // 创建晶圆
        this.createChip(this.wireData, scale);

        // 渲染金线和焊点
        this.wireData.forEach(item => {
          const { leadX, leadY, padX, padY } = item;
          const scaledLeadX = leadX * scale;
          const scaledLeadY = leadY * scale;
          const scaledPadX = padX * scale;
          const scaledPadY = padY * scale;

          const start = new THREE.Vector3(scaledLeadX, 5, scaledLeadY);
          const end = new THREE.Vector3(scaledPadX, 9, scaledPadY);
          const control = new THREE.Vector3(
            (scaledLeadX + scaledPadX) / 2,
            12,
            (scaledLeadY + scaledPadY) / 2
          );

          this.createGoldWire(start, control, end);
          this.createWeldingPoint(start);
          this.createWeldingPoint(end);
        });

        // 设置 OrbitControls 的目标为 PCB 中心
        this.controls.target.set(pcbCenter.x, pcbCenter.y, pcbCenter.z);
        this.controls.update();
      }

      this.animate();
    },

    // 计算缩放比例
    calculateScale(wireData) {
      const allX = wireData.flatMap(item => [item.leadX, item.padX]);
      const allY = wireData.flatMap(item => [item.leadY, item.padY]);

      const minX = Math.min(...allX);
      const maxX = Math.max(...allX);
      const minY = Math.min(...allY);
      const maxY = Math.max(...allY);

      const width = maxX - minX;
      const height = maxY - minY;

      // 动态计算缩放比例，使得模组占据屏幕的 80%
      const scaleX = width > 0 ? 240 / width : 1; // 80% 的屏幕宽度
      const scaleY = height > 0 ? 240 / height : 1; // 80% 的屏幕高度

      return Math.min(scaleX, scaleY);
    },

    // 创建金线
    createGoldWire(start, control, end) {
      const material = new THREE.LineBasicMaterial({ color: 0xffcc00 });
      const geometry = new THREE.BufferGeometry().setFromPoints([start, control, end]);
      const curve = new THREE.Line(geometry, material);
      this.scene.add(curve);
    },

    // 创建焊点
    createWeldingPoint(position) {
      const geometry = new THREE.SphereGeometry(0.5);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const weldingPoint = new THREE.Mesh(geometry, material);
      weldingPoint.position.set(position.x, position.y, position.z);
      this.scene.add(weldingPoint);
    },

    // 创建电路板（PCB）
    createPCB(wireData, scale) {
      let minX = Math.min(...wireData.map(data => data.leadX));
      let maxX = Math.max(...wireData.map(data => data.leadX));
      let minY = Math.min(...wireData.map(data => data.leadY));
      let maxY = Math.max(...wireData.map(data => data.leadY));

      const pcbWidth = (maxX - minX) * scale;
      const pcbDepth = (maxY - minY) * scale;
      const pcbHeight = 5;

      const pcbGeometry = new THREE.BoxGeometry(pcbWidth, pcbHeight, pcbDepth);
      const pcbMaterial = new THREE.MeshStandardMaterial({ color: 0x006600 });
      const pcb = new THREE.Mesh(pcbGeometry, pcbMaterial);

      const pcbCenterX = (minX + maxX) / 2 * scale;
      const pcbCenterY = 2.5;
      const pcbCenterZ = (minY + maxY) / 2 * scale;

      pcb.position.set(pcbCenterX, pcbCenterY, pcbCenterZ);
      pcb.receiveShadow = true;
      this.scene.add(pcb);

      return new THREE.Vector3(pcbCenterX, pcbCenterY, pcbCenterZ);
    },

    // 创建晶圆（Chip）
    createChip(wireData, scale) {
      let minPadX = Math.min(...wireData.map(data => data.padX));
      let maxPadX = Math.max(...wireData.map(data => data.padX));
      let minPadY = Math.min(...wireData.map(data => data.padY));
      let maxPadY = Math.max(...wireData.map(data => data.padY));

      const chipWidth = (maxPadX - minPadX) * scale;
      const chipDepth = (maxPadY - minPadY) * scale;
      const chipHeight = 4;

      const chipGeometry = new THREE.BoxGeometry(chipWidth, chipHeight, chipDepth);
      const chipMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const chip = new THREE.Mesh(chipGeometry, chipMaterial);

      const chipCenterX = (minPadX + maxPadX) / 2 * scale;
      const chipCenterY = 7;
      const chipCenterZ = (minPadY + maxPadY) / 2 * scale;

      chip.position.set(chipCenterX, chipCenterY, chipCenterZ);
      chip.castShadow = true;
      this.scene.add(chip);
    },

    // 重置视角
    resetView() {
      const pcbCenter = this.controls.target; // 当前目标即为 PCB 中心
      this.camera.position.set(pcbCenter.x, pcbCenter.y + 150, pcbCenter.z + 300);
      this.controls.update();
    },

    // 切换线框模式
    toggleWireframe() {
      this.scene.traverse(object => {
        if (object.isMesh) {
          object.material.wireframe = !object.material.wireframe;
        }
      });
    },

    // 处理窗口尺寸变化
    onWindowResize() {
      const container = this.$refs.visualizationContainer;
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    },

    // 处理鼠标移动事件
    onMouseMove(event) {
      const rect = this.$refs.canvas.getBoundingClientRect();

      // 将鼠标坐标转换为 NDC (Normalized Device Coordinates)
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // 更新 Raycaster 的射线
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // 检测射线与场景中的对象相交（可选，如果有相关需求）
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      if (intersects.length > 0) {
        console.log("Intersected object:", intersects[0].object);
      }
    },

    // 动画循环
    animate() {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.animate);
    },

    disposeScene() {
      if (this.scene) {
        this.scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (object.material.map) object.material.map.dispose();
            object.material.dispose();
          }
        });
      }
      if (this.renderer) {
        this.renderer.dispose();
      }
    },
  },

}
</script>

<style scoped>
.visualization-container {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
}

.toolbar {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
}

canvas {
  display: block;
}
</style>
