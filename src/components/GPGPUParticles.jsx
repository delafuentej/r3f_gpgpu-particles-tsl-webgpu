import { extend, useThree, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useMemo, useEffect, useRef } from "react";
import {
  color,
  ceil,
  uniform,
  instancedArray,
  instanceIndex,
  hash,
  range,
  deltaTime,
  If,
  length,
  mix,
  min,
  smoothstep,
  uv,
  saturate,
  sqrt,
  texture,
  vec3,
  vec4,
  vec2,
  mx_fractal_noise_vec3,
} from "three/tsl";
import { Fn } from "three/src/nodes/TSL.js";
import {
  AdditiveBlending,
  SpriteNodeMaterial,
  DataTexture,
  FloatType,
  RGBAFormat,
  Color,
} from "three/webgpu";
import { randInt, lerp } from "three/src/math/MathUtils.js";
import { useControls } from "leva";

// for our gpgpu simulation we need to memorize the particles POSITION, VELOCITY, AGE and COLOR
// without hte CPU
//- calculate the color based on the age combined to uniforms
//- we can generate randomly the velocity using a fixed seed value
// - position:  for the target position we need to store it in a buffer
// - age: we need to store it in a buffer
// To store data in the gpu we can use storage node,  it allow us  to store large amounts of structured
// data that can be updated on the GPU
// *** instancedArray TSL function relying on the storage node = it is a function that creates a buffer of the specified size & type

// randValue function return a random value between min and max based on a seed

const MODEL_COLORS = {
  Docker: {
    start: "#00ff49",
    end: "#0040ff",
    emissiveIntensity: 0.01,
  },
  Three: {
    start: "#00bcd4",
    end: "#202020",
    emissiveIntensity: 0.08,
  },
  HTML: {
    start: "#ff7300",
    end: "#0091ff",
    emissiveIntensity: 0.1,
  },

  React: {
    start: "#5945ce",
    end: "#bbafff",
    emissiveIntensity: 0.001,
  },
  Github: {
    start: "#00FFAA",
    end: "#FF6A00",
    emissiveIntensity: 0.001,
  },
};

const randValue = /*#__PURE__*/ Fn(({ min, max, seed = 42 }) => {
  return hash(instanceIndex.add(seed)).mul(max.sub(min)).add(min);
});

export const GPGPUParticles = ({ nbParticles = 1000000 }) => {
  //Let's lerp the colors to have a smooth transition between the models:

  //to load the models

  const { scene: threeScene } = useGLTF("/models/Three-Remesh.glb");
  const { scene: dockerScene } = useGLTF("/models/Docker-Remesh.glb");
  const { scene: HTMLScene } = useGLTF("/models/HTML-Remesh.glb");
  const { scene: reactScene } = useGLTF("/models/React-Remesh.glb");
  const { scene: githubScene } = useGLTF("/models/Github-Remesh.glb");

  const {
    currentGeometry,
    startColor,
    endColor,
    debugColor,
    emissiveIntensity,
  } = useControls(
    {
      currentGeometry: {
        options: ["Docker", "Three", "HTML", "React", "Github"],
        value: "Docker",
      },
      startColor: "#00ffcc",
      endColor: "#9900ff",
      debugColor: false,
      emissiveIntensity: 0.1,
    },
    { collapsed: true }
  );

  const tmpColor = new Color();

  const lerpedStartColor = useRef(
    new Color(MODEL_COLORS[currentGeometry].start)
  );
  const lerpedEndColor = useRef(new Color(MODEL_COLORS[currentGeometry].end));

  // time to parse the model's geometry to convert them into a format that we
  // we can sue with our particles:
  // we have to traverse tue current models and extract the vertices positions => save then into geometries with useMemo()

  const geometries = useMemo(() => {
    const geometries = []; // to store the geometris of the current model.Despite we traverse each model an pusht theirs geometries into it
    const sceneToTraverse = {
      Docker: dockerScene,
      Three: threeScene,
      HTML: HTMLScene,
      React: reactScene,
      Github: githubScene,
    }[currentGeometry];

    sceneToTraverse.traverse((child) => {
      if (child.isMesh) {
        geometries.push(child.geometry);
      }
    });
    return geometries;
  }, [
    currentGeometry,
    HTMLScene,
    dockerScene,
    reactScene,
    threeScene,
    githubScene,
  ]);

  //HOW TO STORE DATA IN A TEXTURE (Store data in a 2D array format to be efficiently accessed in the shader)
  //our texture will contain data for each particle, and for each particle we will store the position of a random vertex of each model
  // To determine the size of texture => 2D Texture => calculate de square root(nbParticles)
  const targetPositionsTexture = useMemo(() => {
    const size = Math.ceil(Math.sqrt(nbParticles));
    const data = new Float32Array(size * size * 4); // * 4 (RGBA) => (0,0,0,1)//

    for (let i = 0; i < nbParticles; i++) {
      data[i * 4 + 0] = 0; //x
      data[i * 4 + 1] = 0; //y
      data[i * 4 + 2] = 0; //z
      data[i * 4 + 3] = 1; // alphaƒ
    }

    const texture = new DataTexture(data, size, size, RGBAFormat, FloatType); // the FloatType is used to store the data as floating-point values
    return texture;
  }, [nbParticles]);

  // useEffect => we obtain the vertices position & store them in the texture wen the geometries change
  // For each particle, we randomly select a geometry and a vertex of that geometry.
  //Then we store the position of the vertex in the texture.
  useEffect(() => {
    if (geometries.length === 0) return;
    for (let i = 0; i < nbParticles; i++) {
      const geometryIndex = randInt(0, geometries.length - 1);
      const randomGeometryIndex = randInt(
        0,
        geometries[geometryIndex].attributes.position.count - 1
      );
      targetPositionsTexture.image.data[i * 4 + 0] =
        geometries[geometryIndex].attributes.position.array[
          randomGeometryIndex * 3 + 0
        ];
      targetPositionsTexture.image.data[i * 4 + 1] =
        geometries[geometryIndex].attributes.position.array[
          randomGeometryIndex * 3 + 1
        ];
      targetPositionsTexture.image.data[i * 4 + 2] =
        geometries[geometryIndex].attributes.position.array[
          randomGeometryIndex * 3 + 2
        ];
      targetPositionsTexture.image.data[i * 4 + 3] = 1;
    }
    //we set needsUpdate to true to tell Three.js that the texture needs to be updated.
    targetPositionsTexture.needsUpdate = true;
  }, [geometries]);

  //We can now use this texture in our shader to render the particles:

  // to be able to call our computeInit we need the gl renderer
  const gl = useThree((state) => state.gl);

  const { nodes, uniforms, computeUpdate } = useMemo(() => {
    // uniforms
    const uniforms = {
      color: uniform(color(startColor)),
      endColor: uniform(color(endColor)),
      emissiveIntensity: uniform(emissiveIntensity),
    };

    // buffers:
    const spawnPositionBuffer = instancedArray(nbParticles, "vec3");
    const offsetPositionBuffer = instancedArray(nbParticles, "vec3");
    const agesBuffer = instancedArray(nbParticles, "float");

    // to access the data in the buffers, we use .element(index) method to get the value at the index for each particle: instanceIndex
    // instanceIndex  => it is a built-in TSL function that returns the index of the current instance being processed.

    const spawnPosition = spawnPositionBuffer.element(instanceIndex);
    const offsetPosition = offsetPositionBuffer.element(instanceIndex);
    const age = agesBuffer.element(instanceIndex);

    //initial compute (compute function): to setup the position and age of the particles; it will be
    // executed on the GPU at the beginning of the simulation

    const lifetime = randValue({ min: 0.1, max: 6, seed: 13 });

    // computeInit function => assign our buffers with random values
    const computeInit = Fn(() => {
      spawnPosition.assign(
        vec3(
          randValue({ min: -3, max: 3, seed: 0 }), //x
          randValue({ min: -3, max: 3, seed: 1 }), //y
          randValue({ min: -3, max: 3, seed: 2 }) //z
        )
      );
      offsetPosition.assign(0),
        age.assign(randValue({ min: 0, max: lifetime, seed: 11 }));
    })().compute(nbParticles);

    gl.computeAsync(computeInit);
    // to be able to visualize it we need to change the positionNode
    // of the SpriteNodeMaterial to spawnPosition & offsetPosition buffers => nodes.positionNode
    // we set the positionNode to the sum of the spawnPosition and the offsetPosition

    const scale = vec3(range(0.001, 0.01));

    // to add some movement to it, generating a random speed for each particle
    const instanceSpeed = randValue({ min: 0.01, max: 0.05, seed: 12 });
    // to be able to update the initial compute => update Fn:
    // so we update the position & age for each particles

    // TEXTURE DATA
    const size = ceil(sqrt(nbParticles));
    //. We use the modInt(mod(int())) and div functions to calculate the column and row of the texture for each particle.

    const col = instanceIndex.modInt(size).toFloat();
    const row = instanceIndex.div(size).toFloat();
    const x = col.div(size.toFloat());
    const y = row.div(size.toFloat());
    //texture function to read the value of the texture at the specified coordinates.
    // and we extract the xyz valur of the texture to get the target postition of the particle

    const targetPosition = texture(targetPositionsTexture, vec2(x, y)).xyz;

    //we will use the targetPosition to move the particles towards it

    // the deltaTime from three/tsl return us the time elapsed since the last frame

    const offsetSpeed = randValue({ min: 0.1, max: 0.5, seed: 14 });

    const computeUpdate = Fn(() => {
      // to calculate the distance to target position be substracting the spawnPosition from targetPosition
      const distanceToTarget = targetPosition.sub(spawnPosition);

      If(distanceToTarget.length().greaterThan(0.01), () => {
        //we move the spawn position towards the target position by normalizing the distance (to get the direction)
        spawnPosition.addAssign(
          distanceToTarget
            .normalize()
            .mul(min(instanceSpeed, distanceToTarget.length()))
        );
      });

      //We use the mx_fractal_noise_vec3 function to add some noise
      // to the particles' position. We multiply the spawnPosition by the
      // age to make the noise evolve over time.
      // The particles are now moving with a flow movement while
      // still representing our models!
      offsetPosition.addAssign(
        mx_fractal_noise_vec3(spawnPosition.mul(age))
          .mul(offsetSpeed)
          .mul(deltaTime)
      );

      age.addAssign(deltaTime);

      If(age.greaterThan(lifetime), () => {
        // we resetr the age & offsetPosition to 0
        age.assign(0);
        offsetPosition.assign(0);
      });

      //offsetPosition.addAssign(vec3(instanceSpeed));
    })().compute(nbParticles);

    // to scale the particles down based on their age:
    const particleLifetimeProgress = saturate(age.div(lifetime));
    //colors
    const colorNode = vec4(
      mix(
        uniforms.color,
        uniforms.endColor,
        particleLifetimeProgress,
        randValue({ min: 0, max: 1, seed: 6 }) // Alpha
      )
    );

    // to transform each particle into a circle
    const dist = length(uv().sub(0.5)); //to get the UV coordinates of the particles and calculate the distance from the center of the particle.
    const circle = smoothstep(0.5, 0.49, dist); // to create a smooth transition between the center and the edge of the particle.
    const finalColor = colorNode.mul(circle); //uniforms.color.mul(circle); //we multiply the color by the circle value to make it circular.

    // Add a random offset to the particles
    const randOffset = vec3(
      range(-0.001, 0.001),
      range(-0.001, 0.001),
      range(-0.001, 0.001)
    );

    return {
      uniforms,
      computeUpdate,
      nodes: {
        positionNode: spawnPosition.add(offsetPosition).add(randOffset), // positions
        colorNode: finalColor, //uniforms.color,
        scaleNode: scale.mul(smoothstep(1, 0, particleLifetimeProgress)), // scale
        //o see the glow effect from posprocessing we need to add some emissive
        // values to our particles
        emissiveNode: finalColor.mul(uniforms.emissiveIntensity),
      },
    };
  }, []);

  // we make the computeUpdate method available outside the useMemo and call it in the useFrame method
  useFrame((_, delta) => {
    // we have to execute computeUpdate on each frame
    gl.compute(computeUpdate);

    tmpColor.set(debugColor ? startColor : MODEL_COLORS[currentGeometry].start);
    lerpedStartColor.current.lerp(tmpColor, delta);
    tmpColor.set(debugColor ? endColor : MODEL_COLORS[currentGeometry].end);
    lerpedEndColor.current.lerp(tmpColor, delta);
    uniforms.color.value.set(lerpedStartColor.current);
    uniforms.endColor.value.set(lerpedEndColor.current);
    uniforms.emissiveIntensity.value = lerp(
      uniforms.emissiveIntensity.value,
      debugColor
        ? emissiveIntensity
        : MODEL_COLORS[currentGeometry].emissiveIntensity,
      delta
    );
  });

  return (
    <>
      <sprite count={nbParticles}>
        <spriteNodeMaterial
          {...nodes}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>
    </>
  );
};

extend({ SpriteNodeMaterial });
