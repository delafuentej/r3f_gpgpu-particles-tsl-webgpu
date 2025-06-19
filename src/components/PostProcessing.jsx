import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { pass, mrt, emissive, output } from "three/tsl";
import * as THREE from "three/webgpu";

//We use the PostProcessing class from the three/webgpu module to create
//a post-processing object. This module is responsible to manage the post
// processing setup in our project.
//It will allow us to add passes and nodes to our post-processing pipeline.

export const PostProcessing = ({
  strength = 2.5,
  radius = 0.5,
  threshold = 0.25,
}) => {
  //It uses a render-target internally to render the scene
  //to multiple texture nodes (output, depth, etc.)
  //and then we can use these textures to apply post-processing effects.
  const { gl: renderer, scene, camera } = useThree();
  const postProcessingRef = useRef(null);
  const bloomPassRef = useRef(null);

  //In a useEffect hook, when the component mounts,
  // we create a pass using the pass node from the three/tsl module.
  //This function takes the scene and camera as arguments and returns a pass object.

  useEffect(() => {
    if (!renderer || !scene || !camera) {
      return;
    }

    const scenePass = pass(scene, camera);

    //For our scenePass to handle both the output
    // and emissive passes, we need to create multiple render targets.

    // Same for emissive
    scenePass.setMRT(
      mrt({
        output,
        emissive,
      })
    );

    // Get texture nodes
    const outputPass = scenePass.getTextureNode("output");
    //now we can access the emissive pass from the scenePass object:
    const emissivePass = scenePass.getTextureNode("emissive");

    // Create bloom pass
    const bloomPass = bloom(emissivePass, strength, radius, threshold);
    bloomPassRef.current = bloomPass;

    // Setup post-processing
    const postProcessing = new THREE.PostProcessing(renderer);

    const outputNode = outputPass.add(bloomPass);
    postProcessing.outputNode = outputNode;
    postProcessingRef.current = postProcessing;

    return () => {
      postProcessingRef.current = null;
    };
  }, [renderer, scene, camera]);

  // to update the postprocessing object
  useFrame(() => {
    if (!postProcessingRef.current) return;
    //bloomPass
    //We also store a reference to the bloom pass
    //in a useRef hook so we can update its uniforms in the useFrame hook.
    if (bloomPassRef.current) {
      bloomPassRef.current.strength.value = strength;
      bloomPassRef.current.radius.value = radius;
      bloomPassRef.current.threshold.value = threshold;
    }

    // to render the scene with  the post-processing effects:
    postProcessingRef.current.render();
  }, 1);

  return null;
};
