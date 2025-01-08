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
      this.camera.position.set(0, 150, 300); // 调整摄像机位置
      this.camera.lookAt(0, 0, 0); // 确保摄像机对准场景中心

      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({ canvas: this.$refs.canvas });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(this.renderer.domElement);

      // 创建光源
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      const pointLight = new THREE.PointLight(0xffffff, 0.8);
      pointLight.position.set(50, 150, 50);
      this.scene.add(ambientLight, pointLight);

      // 初始化 OrbitControls 确保控制器生效
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    },

    // 根据传入的数据渲染场景
    renderScene() {
      if (this.wireData && this.wireData.length) {
        // 计算缩放比例
        const scale = this.calculateScale(this.wireData);

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

          // 创建金线
          this.createGoldWire(start, control, end);

          // 创建焊点
          this.createWeldingPoint(start);
          this.createWeldingPoint(end);
        });

        // 创建电路板和晶圆
        this.createPCB(this.wireData, scale);
        this.createChip(this.wireData, scale);
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
      const container = this.$refs.visualizationContainer;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const scaleX = width > 0 ? (containerWidth * 0.8) / width : 1;
      const scaleY = height > 0 ? (containerHeight * 0.8) / height : 1;
      // const scaleX = width > 0 ? 240 / width : 1; // 80% 的屏幕宽度
      // const scaleY = height > 0 ? 240 / height : 1; // 80% 的屏幕高度

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
      // 获取容器大小
      const container = this.$refs.visualizationContainer;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // 获取模组的边界
      const wireData = this.wireData; // 假设你有传入 wireData 数据
      const allX = wireData.flatMap(item => [item.leadX, item.padX]);
      const allY = wireData.flatMap(item => [item.leadY, item.padY]);

      const minX = Math.min(...allX);
      const maxX = Math.max(...allX);
      const minY = Math.min(...allY);
      const maxY = Math.max(...allY);

      const width = maxX - minX;
      const height = maxY - minY;

      // 动态计算缩放比例
      const scaleX = width > 0 ? (containerWidth * 0.8) / width : 1; // 80% 宽度
      const scaleY = height > 0 ? (containerHeight * 0.8) / height : 1; // 80% 高度
      const scale = Math.min(scaleX, scaleY);

      // 计算相机位置，确保整个模组显示在屏幕上，并且视角是从顶部看
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const distance = Math.max(width, height) * scale / 2; // 距离与模组大小成比例

      // 设置相机的位置
      this.camera.position.set(centerX, distance, centerY * 2); // 让相机在模组的正上方
      this.camera.lookAt(centerX, centerY, 0); // 确保相机指向模组的中心

      // 让轨道控制器重置
      this.controls.reset();
      this.controls.target.set(centerX, centerY, 0); // 确保控制器的目标位置也为模组的中心
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
      // 获取画布的边界矩形
      const rect = this.$refs.canvas.getBoundingClientRect();

      // 计算鼠标在屏幕上的位置并转换为标准化设备坐标 (-1 到 1)
      this.mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
      this.mouse.y = -(event.clientY - rect.top) / rect.height * 2 + 1;

      // 使用相机和鼠标位置更新射线
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // 检测交互
      const intersects = this.raycaster.intersectObjects(this.scene.children);
      if (intersects.length > 0) {
        const object = intersects[0].object;
        // 执行与对象相关的交互操作
        console.log('Object hovered: ', object);
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
};
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
