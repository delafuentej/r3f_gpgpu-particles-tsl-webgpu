import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";

const PreloadModels = () => {
  useEffect(() => {
    useGLTF.preload("/models/Three-Remesh.glb");
    useGLTF.preload("/models/Docker-Remesh.glb");
    useGLTF.preload("/models/HTML-Remesh.glb");
    useGLTF.preload("/models/React-Remesh.glb");
    useGLTF.preload("/models/Github-Remesh.glb");
  }, []);

  return null;
};

export default PreloadModels;
