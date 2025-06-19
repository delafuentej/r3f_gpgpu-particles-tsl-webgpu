# 🚀 GPGPU Particles with TSL & WebGPU

Render hundreds of thousands of floating particles to form 3D models and 3D text in real-time using **GPGPU**, **Three Shading Language (TSL)**, and **WebGPU**.

---

## 🌌 Demo

A GPU-driven particle system that smoothly transitions between various web development tool logos — such as HTML5, Docker, React, GitHub, and Three.js — all beautifully rendered using animated particles.

---

## 🚀 Live Demo

🔗 [https://your-agency.vercel.app](https://r3f-gpgpu-particles-tsl-webgpu.vercel.app/)

---

## ⚙️ Technologies Used

- [Three.js](https://threejs.org/)
- [Three Shading Language (TSL)](https://threejs.org/manual/#en/tsl)
- [WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
- [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)
- Blender (for mesh preparation and optimization)

---

## 🧠 What is GPGPU?

**GPGPU** (General-Purpose computing on Graphics Processing Units) enables you to perform massive parallel computations directly on the GPU.

Instead of relying on the CPU:

- We use GPU textures and buffers to store and update data.
- We offload all simulation and animation logic to the shaders.
- This results in ultra-efficient, real-time particle rendering.

With **TSL**, the process becomes even easier and cleaner. It allows you to define compute logic using high-level syntax for storage and buffer nodes.

## 🎯 Highlights

- Pure GPGPU compute using WebGPU

- Real-time animated particles based on 3D models

- Smooth transitions between objects

- Minimal CPU use — GPU does the heavy lifting

- Easy shader programming with TSL

---

## 3D Models Attribution

The 3D models used in this project have been obtained from [Sketchfab](https://sketchfab.com/).  
Please refer to individual model licenses on Sketchfab for proper usage and attribution.

---

## 🚀 Getting Started

### Clone the project

```bash
git clone https://github.com/delafuentej/r3f_gpgpu-particles-tsl-webgpu.git
cd r3f_gpgpu-particles-tsl-webgpu
yarn install
yarn dev
```
