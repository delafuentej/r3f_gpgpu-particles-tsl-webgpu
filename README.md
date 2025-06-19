# 🚀 GPGPU Particles with TSL & WebGPU

Render hundreds of thousands of floating particles to form 3D models and 3D text in real-time using **GPGPU**, **Three Shading Language (TSL)**, and **WebGPU**.

---

## 🌌 Demo

A GPU-driven particle system that smoothly transitions between various web development tool logos — such as HTML5, Docker, React, GitHub, and Three.js — all beautifully rendered using animated particles.

## 🚀 Live Demo

🔗 [demo](https://r3f-gpgpu-particles-tsl-webgpu.vercel.app/)

---

## ⚙️ Technologies Used

### Core Libraries

- **React** – Frontend JavaScript library for building user interfaces.
- **React DOM** – React's renderer for web platforms.
- **Three.js** – JavaScript 3D library for rendering 3D graphics.
  - `three/webgpu` – Used for enabling WebGPU rendering pipeline.
  - `three/tsl` – Utilized for custom shader logic with the TSL (Three Shader Language) module.
  - `three/src/math/MathUtils.js` – Imported for mathematical utilities such as `lerp`.

### React-Three Ecosystem

- **@react-three/fiber** – React renderer for Three.js, bringing the full power of React to 3D scenes.
- **@react-three/drei** – Useful helpers and abstractions on top of R3F for lights, cameras, controls, and more.

### Styling

- **Tailwind CSS** – Utility-first CSS framework for styling.
- **@tailwindcss/vite** – Integration of Tailwind CSS with Vite for fast builds and HMR.

### Developer Tools

- **Leva** – GUI panel for tweaking values live during development.
- **Stats (from drei)** – Performance monitoring for Three.js scenes.
- **Vite** – Lightning-fast dev server and bundler.
- **@vitejs/plugin-react** – React plugin for Vite to support JSX and Fast Refresh.
- **Globals** – Provides browser-compatible global variables for Node-like environments.

### 💡 Advanced Rendering with WebGPU

- **three/webgpu** – Utilizes the modern WebGPU API via Three.js for enhanced performance and rendering capabilities.
- WebGPU renderer replaces the default WebGL renderer for better GPU utilization and future-proofing.

### ✨ Postprocessing with TSL (Three Shader Language)

- **three/tsl** – Uses Three.js’s experimental Shader Node API (`tsl`) for modular, reusable shader code.
- Implements postprocessing effects like `bloom`, `emissive`, and `mrt` using:
  - `bloom` from `three/examples/jsm/tsl/display/BloomNode.js`
  - `pass`, `emissive`, `output`, and `mrt` from `three/tsl`

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
