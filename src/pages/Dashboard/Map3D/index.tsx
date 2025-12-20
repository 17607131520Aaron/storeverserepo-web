import React, { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Mock 数据 - 工厂设备数据
const factoryData = {
  production: 125680,
  efficiency: 87.5,
  machines: 24,
  activeMachines: 20,
  energyConsumption: 3456,
  qualityRate: 98.2,
};

// 设备状态数据
const machineData = [
  { id: 1, status: "running", efficiency: 92, x: -30, z: -30 },
  { id: 2, status: "running", efficiency: 88, x: -10, z: -30 },
  { id: 3, status: "running", efficiency: 95, x: 10, z: -30 },
  { id: 4, status: "maintenance", efficiency: 0, x: 30, z: -30 },
  { id: 5, status: "running", efficiency: 90, x: -30, z: -10 },
  { id: 6, status: "running", efficiency: 85, x: -10, z: -10 },
  { id: 7, status: "running", efficiency: 93, x: 10, z: -10 },
  { id: 8, status: "running", efficiency: 87, x: 30, z: -10 },
  { id: 9, status: "running", efficiency: 91, x: -30, z: 10 },
  { id: 10, status: "running", efficiency: 89, x: -10, z: 10 },
  { id: 11, status: "running", efficiency: 94, x: 10, z: 10 },
  { id: 12, status: "running", efficiency: 86, x: 30, z: 10 },
];

// 根据状态获取颜色
const getStatusColor = (status: string, efficiency: number): THREE.Color => {
  if (status === "maintenance") {
    return new THREE.Color(0xff6b6b);
  }
  if (efficiency >= 90) {
    return new THREE.Color(0x52c41a);
  }
  if (efficiency >= 80) {
    return new THREE.Color(0xfaad14);
  }
  return new THREE.Color(0xff4d4f);
};

// 创建程序化纹理
const createTexture = (color: number, pattern: string): THREE.Texture => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.Texture();
  }

  ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
  ctx.fillRect(0, 0, 256, 256);

  if (pattern === "metal") {
    // 金属纹理
    for (let i = 0; i < 256; i += 4) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
    }
  } else if (pattern === "concrete") {
    // 混凝土纹理
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
};

const DashboardMap3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);
  const [containerHeight, setContainerHeight] = useState(600);

  // 获取 asp-comprehension-home-content-wrapper 的高度
  useEffect(() => {
    const updateHeight = (): void => {
      const wrapper = document.querySelector(".asp-comprehension-home-content-wrapper") as HTMLElement;
      if (wrapper) {
        setContainerHeight(wrapper.clientHeight);
      }
    };

    // 初始获取高度
    updateHeight();

    // 监听窗口大小变化
    window.addEventListener("resize", updateHeight);

    // 使用 ResizeObserver 监听 wrapper 元素大小变化
    const wrapper = document.querySelector(".asp-comprehension-home-content-wrapper");
    let resizeObserver: ResizeObserver | null = null;
    if (wrapper) {
      resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      resizeObserver.observe(wrapper);
    }

    return (): void => {
      window.removeEventListener("resize", updateHeight);
      if (resizeObserver && wrapper) {
        resizeObserver.unobserve(wrapper);
      }
    };
  }, []);

  // 创建工厂3D场景
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let cleanupFn: (() => void) | undefined;

    const createFactory = (): void => {
      try {
        // 创建场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0e1a);
        scene.fog = new THREE.Fog(0x0a0e1a, 80, 300);

        // 创建相机
        if (!containerRef.current) {
          return;
        }
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(100, 80, 100);
        camera.lookAt(0, 0, 0);

        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        if (containerRef.current) {
          containerRef.current.appendChild(renderer.domElement);
        }

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight1.position.set(60, 120, 60);
        directionalLight1.castShadow = true;
        directionalLight1.shadow.mapSize.width = 4096;
        directionalLight1.shadow.mapSize.height = 4096;
        directionalLight1.shadow.camera.left = -150;
        directionalLight1.shadow.camera.right = 150;
        directionalLight1.shadow.camera.top = 150;
        directionalLight1.shadow.camera.bottom = -150;
        directionalLight1.shadow.camera.near = 0.5;
        directionalLight1.shadow.camera.far = 500;
        directionalLight1.shadow.bias = -0.0001;
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0x88ccff, 0.4);
        directionalLight2.position.set(-60, 80, -60);
        scene.add(directionalLight2);

        // 点光源 - 模拟工厂灯光
        const pointLight1 = new THREE.PointLight(0xffaa44, 0.8, 100);
        pointLight1.position.set(0, 35, 0);
        pointLight1.castShadow = true;
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x88ccff, 0.6, 80);
        pointLight2.position.set(-50, 25, -50);
        scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0x88ccff, 0.6, 80);
        pointLight3.position.set(50, 25, 50);
        scene.add(pointLight3);

        // 添加轨道控制器
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 40;
        controls.maxDistance = 300;
        controls.enablePan = true;
        controls.target.set(0, 0, 0);

        // 创建地面 - 使用纹理
        const floorTexture = createTexture(0x2a2a3e, "concrete");
        const floorGeometry = new THREE.PlaneGeometry(300, 300);
        const floorMaterial = new THREE.MeshStandardMaterial({
          map: floorTexture,
          roughness: 0.9,
          metalness: 0.1,
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        scene.add(floor);

        // 添加网格辅助线
        const gridHelper = new THREE.GridHelper(300, 30, 0x4a4a5e, 0x3a3a4e);
        gridHelper.position.y = 0.1;
        scene.add(gridHelper);

        // 创建工厂主体建筑
        const buildingGroup = new THREE.Group();

        // 主厂房 - 使用金属纹理
        const mainBuildingTexture = createTexture(0x4a5568, "metal");
        const mainBuildingGeometry = new THREE.BoxGeometry(90, 35, 90);
        const mainBuildingMaterial = new THREE.MeshStandardMaterial({
          map: mainBuildingTexture,
          roughness: 0.7,
          metalness: 0.3,
        });
        const mainBuilding = new THREE.Mesh(mainBuildingGeometry, mainBuildingMaterial);
        mainBuilding.position.set(0, 17.5, 0);
        mainBuilding.castShadow = true;
        mainBuilding.receiveShadow = true;
        buildingGroup.add(mainBuilding);

        // 主厂房窗户
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 3; j++) {
            const windowGeometry = new THREE.PlaneGeometry(8, 10);
            const windowMaterial = new THREE.MeshPhongMaterial({
              color: 0x88ccff,
              emissive: 0x224466,
              transparent: true,
              opacity: 0.8,
            });
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            const angle = (i * Math.PI) / 2;
            const radius = 45;
            window.position.set(Math.cos(angle) * radius, 10 + j * 12, Math.sin(angle) * radius);
            window.lookAt(0, window.position.y, 0);
            buildingGroup.add(window);
          }
        }

        // 屋顶 - 更写实
        const roofGeometry = new THREE.ConeGeometry(65, 18, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({
          color: 0x3a4558,
          roughness: 0.8,
          metalness: 0.2,
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, 44, 0);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        buildingGroup.add(roof);

        // 屋顶通风口
        const ventGeometry = new THREE.CylinderGeometry(2, 2, 3, 16);
        const ventMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, metalness: 0.8, roughness: 0.2 });
        for (let i = 0; i < 4; i++) {
          const vent = new THREE.Mesh(ventGeometry, ventMaterial);
          const angle = (i * Math.PI) / 2;
          vent.position.set(Math.cos(angle) * 20, 50, Math.sin(angle) * 20);
          vent.castShadow = true;
          buildingGroup.add(vent);
        }

        // 侧厂房
        const sideBuildingTexture = createTexture(0x4a5568, "metal");
        const sideBuildingGeometry = new THREE.BoxGeometry(45, 25, 45);
        const sideBuildingMaterial = new THREE.MeshStandardMaterial({
          map: sideBuildingTexture,
          roughness: 0.7,
          metalness: 0.3,
        });
        const sideBuilding1 = new THREE.Mesh(sideBuildingGeometry, sideBuildingMaterial);
        sideBuilding1.position.set(-60, 12.5, 0);
        sideBuilding1.castShadow = true;
        sideBuilding1.receiveShadow = true;
        buildingGroup.add(sideBuilding1);

        const sideBuilding2 = new THREE.Mesh(sideBuildingGeometry, sideBuildingMaterial);
        sideBuilding2.position.set(60, 12.5, 0);
        sideBuilding2.castShadow = true;
        sideBuilding2.receiveShadow = true;
        buildingGroup.add(sideBuilding2);

        // 侧厂房窗户
        [sideBuilding1, sideBuilding2].forEach((building, idx) => {
          for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
              const windowGeometry = new THREE.PlaneGeometry(6, 8);
              const windowMaterial = new THREE.MeshPhongMaterial({
                color: 0x88ccff,
                emissive: 0x224466,
                transparent: true,
                opacity: 0.8,
              });
              const window = new THREE.Mesh(windowGeometry, windowMaterial);
              window.position.set(
                building.position.x + (idx === 0 ? -22.5 : 22.5),
                8 + j * 10,
                building.position.z + (i - 0.5) * 15,
              );
              window.lookAt(building.position.x, window.position.y, building.position.z);
              buildingGroup.add(window);
            }
          }
        });

        // 烟囱
        const chimneyGeometry = new THREE.CylinderGeometry(3, 4, 25, 16);
        const chimneyMaterial = new THREE.MeshStandardMaterial({
          color: 0x3a3a4a,
          roughness: 0.9,
          metalness: 0.1,
        });
        const chimney1 = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney1.position.set(-30, 37.5, -30);
        chimney1.castShadow = true;
        buildingGroup.add(chimney1);

        const chimney2 = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney2.position.set(30, 37.5, 30);
        chimney2.castShadow = true;
        buildingGroup.add(chimney2);

        scene.add(buildingGroup);

        // 创建设备/机器 - 更详细
        const machinesGroup = new THREE.Group();
        machineData.forEach((machine) => {
          const machineGroup = new THREE.Group();

          // 机器底座
          const baseGeometry = new THREE.CylinderGeometry(5, 5.5, 1, 16);
          const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a3a,
            roughness: 0.8,
            metalness: 0.3,
          });
          const base = new THREE.Mesh(baseGeometry, baseMaterial);
          base.position.set(0, 0.5, 0);
          base.castShadow = true;
          base.receiveShadow = true;
          machineGroup.add(base);

          // 机器主体 - 更复杂
          const statusColor = getStatusColor(machine.status, machine.efficiency);
          const machineBodyGeometry = new THREE.BoxGeometry(10, 8, 10);
          const machineBodyMaterial = new THREE.MeshStandardMaterial({
            color: statusColor,
            roughness: 0.6,
            metalness: 0.4,
            emissive:
              machine.status === "running" ? statusColor.clone().multiplyScalar(0.1) : new THREE.Color(0x000000),
          });
          const machineBody = new THREE.Mesh(machineBodyGeometry, machineBodyMaterial);
          machineBody.position.set(0, 5, 0);
          machineBody.castShadow = true;
          machineBody.receiveShadow = true;
          machineBody.userData = { machineId: machine.id, status: machine.status, efficiency: machine.efficiency };
          machineGroup.add(machineBody);

          // 机器顶部控制面板
          const controlPanelGeometry = new THREE.BoxGeometry(8, 1, 6);
          const controlPanelMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2a,
            roughness: 0.3,
            metalness: 0.8,
          });
          const controlPanel = new THREE.Mesh(controlPanelGeometry, controlPanelMaterial);
          controlPanel.position.set(0, 9.5, 0);
          controlPanel.castShadow = true;
          machineGroup.add(controlPanel);

          // 机器顶部指示灯
          const lightGeometry = new THREE.SphereGeometry(0.8, 16, 16);
          const lightMaterial = new THREE.MeshStandardMaterial({
            color: statusColor,
            emissive: machine.status === "running" ? statusColor : new THREE.Color(0x000000),
          });
          const light = new THREE.Mesh(lightGeometry, lightMaterial);
          light.position.set(0, 10.5, 0);
          machineGroup.add(light);

          // 数据面板 - 更写实
          const panelGeometry = new THREE.PlaneGeometry(4, 3);
          const panelMaterial = new THREE.MeshPhongMaterial({
            color: 0x0a0a1a,
            emissive: new THREE.Color(0x00ff00),
            side: THREE.DoubleSide,
          });
          const panel = new THREE.Mesh(panelGeometry, panelMaterial);
          panel.position.set(0, 7, 5.1);
          machineGroup.add(panel);

          // 机器侧面的管道/连接器
          const connectorGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
          const connectorMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.3,
            metalness: 0.9,
          });
          for (let i = 0; i < 4; i++) {
            const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
            const angle = (i * Math.PI) / 2;
            connector.position.set(Math.cos(angle) * 5.5, 5, Math.sin(angle) * 5.5);
            connector.rotation.z = Math.PI / 2;
            connector.rotation.y = angle;
            connector.castShadow = true;
            machineGroup.add(connector);
          }

          machineGroup.position.set(machine.x, 0, machine.z);
          machinesGroup.add(machineGroup);
        });
        scene.add(machinesGroup);

        // 创建管道系统 - 更详细
        const pipesGroup = new THREE.Group();
        const pipeMaterial = new THREE.MeshStandardMaterial({
          color: 0x666666,
          roughness: 0.3,
          metalness: 0.8,
        });

        // 主管道 - 带支撑
        for (let i = 0; i < 6; i++) {
          const pipeGeometry = new THREE.CylinderGeometry(1, 1, 70, 16);
          const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
          pipe.rotation.z = Math.PI / 2;
          pipe.position.set(-50 + i * 20, 28, 0);
          pipe.castShadow = true;
          pipesGroup.add(pipe);

          // 管道支撑
          const supportGeometry = new THREE.BoxGeometry(2, 5, 2);
          const support = new THREE.Mesh(supportGeometry, pipeMaterial);
          support.position.set(-50 + i * 20, 25.5, 0);
          support.castShadow = true;
          pipesGroup.add(support);
        }

        // 连接管道
        const connectorGeometry = new THREE.CylinderGeometry(1, 1, 50, 16);
        const connector1 = new THREE.Mesh(connectorGeometry, pipeMaterial);
        connector1.rotation.z = Math.PI / 2;
        connector1.rotation.y = Math.PI / 2;
        connector1.position.set(-50, 28, -25);
        connector1.castShadow = true;
        pipesGroup.add(connector1);

        const connector2 = new THREE.Mesh(connectorGeometry, pipeMaterial);
        connector2.rotation.z = Math.PI / 2;
        connector2.rotation.y = Math.PI / 2;
        connector2.position.set(50, 28, 25);
        connector2.castShadow = true;
        pipesGroup.add(connector2);

        // 管道阀门
        const valveGeometry = new THREE.CylinderGeometry(1.5, 1.5, 2, 16);
        const valveMaterial = new THREE.MeshStandardMaterial({
          color: 0xffaa44,
          roughness: 0.4,
          metalness: 0.7,
        });
        for (let i = 0; i < 3; i++) {
          const valve = new THREE.Mesh(valveGeometry, valveMaterial);
          valve.position.set(-30 + i * 30, 28, 0);
          valve.castShadow = true;
          pipesGroup.add(valve);
        }

        scene.add(pipesGroup);

        // 创建传送带 - 更写实
        const conveyorGroup = new THREE.Group();
        const conveyorMaterial = new THREE.MeshStandardMaterial({
          color: 0x555555,
          roughness: 0.7,
          metalness: 0.2,
        });

        // 主传送带
        const conveyorGeometry = new THREE.BoxGeometry(120, 1.5, 5);
        const conveyor = new THREE.Mesh(conveyorGeometry, conveyorMaterial);
        conveyor.position.set(0, 1.5, 0);
        conveyor.castShadow = true;
        conveyor.receiveShadow = true;
        conveyorGroup.add(conveyor);

        // 传送带支撑 - 更详细
        for (let i = -5; i <= 5; i++) {
          const supportGeometry = new THREE.BoxGeometry(0.8, 3, 0.8);
          const support = new THREE.Mesh(supportGeometry, conveyorMaterial);
          support.position.set(i * 10, 0, 0);
          support.castShadow = true;
          conveyorGroup.add(support);

          // 传送带滚轮
          const rollerGeometry = new THREE.CylinderGeometry(0.6, 0.6, 5.5, 16);
          const rollerMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.3,
            metalness: 0.9,
          });
          const roller = new THREE.Mesh(rollerGeometry, rollerMaterial);
          roller.rotation.z = Math.PI / 2;
          roller.position.set(i * 10, 1.5, 0);
          roller.castShadow = true;
          roller.userData = { rotationSpeed: 0.02 };
          conveyorGroup.add(roller);
        }

        scene.add(conveyorGroup);

        // 创建储罐
        const tanksGroup = new THREE.Group();
        const tankMaterial = new THREE.MeshStandardMaterial({
          color: 0x4a5568,
          roughness: 0.4,
          metalness: 0.6,
        });

        for (let i = 0; i < 4; i++) {
          const tankGroup = new THREE.Group();
          const tankGeometry = new THREE.CylinderGeometry(6, 6, 20, 16);
          const tank = new THREE.Mesh(tankGeometry, tankMaterial);
          tank.position.set(0, 10, 0);
          tank.castShadow = true;
          tank.receiveShadow = true;
          tankGroup.add(tank);

          // 储罐顶部
          const topGeometry = new THREE.SphereGeometry(6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
          const top = new THREE.Mesh(topGeometry, tankMaterial);
          top.position.set(0, 20, 0);
          top.castShadow = true;
          tankGroup.add(top);

          // 储罐管道
          const tankPipeGeometry = new THREE.CylinderGeometry(0.8, 0.8, 8, 8);
          const tankPipe = new THREE.Mesh(tankPipeGeometry, pipeMaterial);
          tankPipe.position.set(0, 24, 0);
          tankPipe.castShadow = true;
          tankGroup.add(tankPipe);

          const positions = [
            [-80, -60],
            [80, -60],
            [-80, 60],
            [80, 60],
          ];
          tankGroup.position.set(positions[i][0], 0, positions[i][1]);
          tanksGroup.add(tankGroup);
        }
        scene.add(tanksGroup);

        // 创建数据可视化柱状图 - 更写实
        const dataVizGroup = new THREE.Group();
        const dataValues = [factoryData.production / 1000, factoryData.efficiency, factoryData.qualityRate];
        const dataColors = [new THREE.Color(0x1890ff), new THREE.Color(0x52c41a), new THREE.Color(0xfaad14)];

        dataValues.forEach((value, index) => {
          const barGeometry = new THREE.BoxGeometry(5, value * 0.6, 5);
          const barMaterial = new THREE.MeshStandardMaterial({
            color: dataColors[index],
            emissive: dataColors[index].clone().multiplyScalar(0.3),
            roughness: 0.3,
            metalness: 0.7,
          });
          const bar = new THREE.Mesh(barGeometry, barMaterial);
          bar.position.set(-70 + index * 25, value * 0.3, -70);
          bar.castShadow = true;
          bar.receiveShadow = true;
          bar.userData = { baseHeight: value * 0.3 };
          dataVizGroup.add(bar);

          // 数据标签底座
          const labelBaseGeometry = new THREE.BoxGeometry(7, 1, 7);
          const labelBase = new THREE.Mesh(
            labelBaseGeometry,
            new THREE.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.8 }),
          );
          labelBase.position.set(-70 + index * 25, 0.5, -70);
          labelBase.receiveShadow = true;
          dataVizGroup.add(labelBase);
        });
        scene.add(dataVizGroup);

        // 添加环境细节 - 警告标志
        const signsGroup = new THREE.Group();
        const signMaterial = new THREE.MeshStandardMaterial({
          color: 0xffaa44,
          roughness: 0.5,
          metalness: 0.3,
        });
        for (let i = 0; i < 8; i++) {
          const signGeometry = new THREE.PlaneGeometry(3, 4);
          const sign = new THREE.Mesh(signGeometry, signMaterial);
          const angle = (i * Math.PI) / 4;
          sign.position.set(Math.cos(angle) * 100, 2, Math.sin(angle) * 100);
          sign.lookAt(0, sign.position.y, 0);
          sign.castShadow = true;
          signsGroup.add(sign);

          // 标志杆
          const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
          const pole = new THREE.Mesh(poleGeometry, new THREE.MeshStandardMaterial({ color: 0x666666 }));
          pole.position.set(sign.position.x, 1, sign.position.z);
          pole.castShadow = true;
          signsGroup.add(pole);
        }
        scene.add(signsGroup);

        // 鼠标交互
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseMove = (event: MouseEvent): void => {
          if (!containerRef.current || !camera || !scene) {
            return;
          }
          const rect = containerRef.current.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(scene.children, true);

          if (intersects.length > 0) {
            const object = intersects[0].object as THREE.Mesh;
            const machineId = object.userData.machineId as number | undefined;
            if (machineId) {
              setSelectedMachine(machineId);
            } else {
              setSelectedMachine(null);
            }
          } else {
            setSelectedMachine(null);
          }
        };

        renderer.domElement.addEventListener("mousemove", onMouseMove);

        // 动画循环
        let time = 0;
        const animate = (): void => {
          animationFrameRef.current = requestAnimationFrame(animate);
          time += 0.01;

          // 旋转传送带滚轮
          conveyorGroup.children.forEach((child) => {
            if (child.userData.rotationSpeed) {
              child.rotation.x += child.userData.rotationSpeed;
            }
          });

          // 机器指示灯闪烁
          machinesGroup.children.forEach((machineGroup) => {
            const light = machineGroup.children.find(
              (child) => child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry,
            );
            if (light && light instanceof THREE.Mesh && light.material instanceof THREE.MeshStandardMaterial) {
              const firstChild = machineGroup.children[1] as THREE.Mesh;
              const machine = machineData.find((m) => m.id === firstChild.userData.machineId);
              if (machine && machine.status === "running") {
                const intensity = Math.sin(time * 5) * 0.2 + 0.8;
                const statusColor = getStatusColor(machine.status, machine.efficiency);
                light.material.emissive = statusColor.clone().multiplyScalar(intensity);
              }
            }
          });

          // 数据柱状图动画
          dataVizGroup.children.forEach((child) => {
            if (child instanceof THREE.Mesh && child.userData.baseHeight) {
              const scale = Math.sin(time * 2) * 0.05 + 1;
              child.position.y = child.userData.baseHeight * scale;
              child.scale.y = scale;
            }
          });

          // 烟囱烟雾效果（使用点云）
          // 可以添加粒子系统来模拟烟雾

          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // 处理窗口大小变化
        const handleResize = (): void => {
          if (!containerRef.current || !camera || !renderer) {
            return;
          }
          const newWidth = containerRef.current.clientWidth;
          const newHeight = containerRef.current.clientHeight;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener("resize", handleResize);

        // 保存引用
        sceneRef.current = scene;
        rendererRef.current = renderer;
        cameraRef.current = camera;
        controlsRef.current = controls;

        setMapLoaded(true);

        // 保存清理函数
        cleanupFn = (): void => {
          window.removeEventListener("resize", handleResize);
          renderer.domElement.removeEventListener("mousemove", onMouseMove);
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          if (containerRef.current && renderer.domElement.parentNode) {
            containerRef.current.removeChild(renderer.domElement);
          }
          renderer.dispose();
        };
      } catch (error) {
        console.error("Failed to create factory:", error);
        setMapLoaded(true);
      }
    };

    createFactory();

    return (): void => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, []);

  // eslint-disable-next-line unused-imports/no-unused-vars
  const selectedMachineInfo = selectedMachine ? machineData.find((m) => m.id === selectedMachine) : null;

  return (
    <div style={{ padding: 12 }}>
      <div
        ref={containerRef}
        style={{
          height: containerHeight,
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          background: "#1a1a2e",
        }}
      />
    </div>
  );
};

export default DashboardMap3D;
