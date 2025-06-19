import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";

import React from "react";

const Item = ({ model = "", ...props }) => {
  const path = model.endsWith(".glb") ? `${model}.glb` : `${model}.glft`;
  const { scene } = useGLTF(`/models/${path}`);
  console.log("scene", scene);

  const clonedScene = useMemo(() => scene.clone(), [scene]);
  return (
    <group {...props}>
      <primitive object={clonedScene} />
    </group>
  );
};

useGLTF.preload("/models/ChequeredFlag.glb");
useGLTF.preload("/models/Classroom.glb");
useGLTF.preload("/models/DiffuseTransmissionPlant.glb");
useGLTF.preload("/models/Door.glb");
useGLTF.preload("/models/F1RacingCar.glb");
useGLTF.preload("/models/Flower.glb");
useGLTF.preload("/models/Fox.glb");
useGLTF.preload("/models/Gallow.glb");
useGLTF.preload("/models/Github.glb");
useGLTF.preload("/models/IPhone.glb");
useGLTF.preload("/models/Lantern.glb");
useGLTF.preload("/models/OpenBook.glb");
useGLTF.preload("/models/Phone.glb");
useGLTF.preload("/models/Racer.glb");
useGLTF.preload("/models/Shirt.glb");
useGLTF.preload("/models/Skateboard.gltf");
useGLTF.preload("/models/StylizedExecutioner.gltf");
useGLTF.preload("/models/SwingSet.glb");
useGLTF.preload("/models/TeslaModel3.glb");
useGLTF.preload("/models/Trophy.glb");
useGLTF.preload("/models/VRHeadSet.glb");
useGLTF.preload("/models/ZombieMale.gltf");

export default Item;
