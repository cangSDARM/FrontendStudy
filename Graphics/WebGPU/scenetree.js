/** draw a hand with "fire" at index finger */
import GUI from "https://webgpufundamentals.org/3rdparty/muigui-0.x.module.js";
import { addButtonLeftJustified } from "https://webgpufundamentals.org/webgpu/resources/js/gui-helpers.js";
import { mat4 } from "https://wgpu-matrix.org/dist/3.x/wgpu-matrix.module.js";

function createCubeVertices() {
  const positions = [
    // left
    -0.5, 0, 0.5, -0.5, 0, -0.5, -0.5, 1, 0.5, -0.5, 1, -0.5,

    // right
    0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 1, 0.5, 0.5, 1, -0.5,
  ];

  const indices = [
    0,
    2,
    1,
    2,
    3,
    1, // left
    4,
    5,
    6,
    6,
    5,
    7, // right
    0,
    4,
    2,
    2,
    4,
    6, // front
    1,
    3,
    5,
    5,
    3,
    7, // back
    0,
    1,
    4,
    4,
    1,
    5, // bottom
    2,
    6,
    3,
    3,
    6,
    7, // top
  ];

  const quadColors = [
    200,
    70,
    120, // left column front
    80,
    70,
    200, // left column back
    70,
    200,
    210, // top
    160,
    160,
    220, // top rung right
    90,
    130,
    110, // top rung bottom
    200,
    200,
    70, // between top and middle rung
  ];

  const numVertices = indices.length;
  const vertexData = new Float32Array(numVertices * 4); // xyz + color
  const colorData = new Uint8Array(vertexData.buffer);

  for (let i = 0; i < indices.length; ++i) {
    const positionNdx = indices[i] * 3;
    const position = positions.slice(positionNdx, positionNdx + 3);
    vertexData.set(position, i * 4);

    const quadNdx = ((i / 6) | 0) * 3;
    const color = quadColors.slice(quadNdx, quadNdx + 3);
    colorData.set(color, i * 16 + 12);
    colorData[i * 16 + 15] = 255;
  }

  return {
    vertexData,
    numVertices,
  };
}

// tip is at origin, base is below
function createConeVertices({ radius = 1, height = 1, subdivisions = 6 } = {}) {
  const positions = [];
  const colors = [];

  function addVertex(angle, radius, height, color) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    positions.push(c * radius, height, s * radius);
    colors.push(...color);
  }

  for (let i = 0; i < subdivisions; ++i) {
    const angle0 = ((i + 0) / subdivisions) * Math.PI * 2;
    const angle1 = ((i + 1) / subdivisions) * Math.PI * 2;

    const u = (i + 1) / subdivisions;
    const color = [u * 128 + 127, 0, 0];

    // add side
    addVertex(angle0, 0, 0, color);
    addVertex(angle1, radius, -height, color);
    addVertex(angle0, radius, -height, color);

    // add bottom
    addVertex(angle0, radius, -height, color);
    addVertex(angle1, radius, -height, color);
    addVertex(angle0, 0, -height, color);
  }

  const numVertices = positions.length / 3;
  const vertexData = new Float32Array(numVertices * 4); // xyz + color
  const colorData = new Uint8Array(vertexData.buffer);

  for (let i = 0; i < numVertices; ++i) {
    const position = positions.slice(i * 3, i * 3 + 3);
    vertexData.set(position, i * 4);

    const color = colors.slice(i * 3, i * 3 + 3);
    colorData.set(color, i * 16 + 12);
    colorData[i * 16 + 15] = 255;
  }

  return {
    vertexData,
    numVertices,
  };
}

const degToRad = (d) => (d * Math.PI) / 180;

class SceneGraphNode {
  constructor(name, source) {
    this.name = name;
    this.children = [];
    this.localMatrix = mat4.identity();
    this.worldMatrix = mat4.identity();
    this.source = source;
  }

  find(name) {
    if (this.name === name) {
      return this;
    }
    for (const child of this.children) {
      const found = child.find(name);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  addChild(child) {
    child.setParent(this);
  }

  removeChild(child) {
    child.setParent(null);
  }

  setParent(parent) {
    // remove us from our parent
    if (this.parent) {
      const ndx = this.parent.children.indexOf(this);
      if (ndx >= 0) {
        this.parent.children.splice(ndx, 1);
      }
    }

    // Add us to our new parent
    if (parent) {
      parent.children.push(this);
    }
    this.parent = parent;
  }

  updateWorldMatrix() {
    // update the local matrix from its source if it has one.
    this.source?.getMatrix(this.localMatrix);

    if (this.parent) {
      // we have a parent do the math
      mat4.multiply(
        this.parent.worldMatrix,
        this.localMatrix,
        this.worldMatrix,
      );
    } else {
      // we have no parent so just copy local to world
      mat4.copy(this.localMatrix, this.worldMatrix);
    }

    // now process all the children
    this.children.forEach(function (child) {
      child.updateWorldMatrix();
    });
  }
}

/** Transition&Rotation&Scaling  */
class TRS {
  constructor({
    translation = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
  } = {}) {
    this.translation = new Float32Array(translation);
    this.rotation = new Float32Array(rotation);
    this.scale = new Float32Array(scale);
  }

  getMatrix(dst) {
    mat4.translation(this.translation, dst);
    mat4.rotateX(dst, this.rotation[0], dst);
    mat4.rotateY(dst, this.rotation[1], dst);
    mat4.rotateZ(dst, this.rotation[2], dst);
    mat4.scale(dst, this.scale, dst);
    return dst;
  }
}

async function main(canvas) {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    fail("need a browser that supports WebGPU");
    return;
  }

  // Get a WebGPU context from the canvas and configure it
  const context = canvas.getContext("webgpu");
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
    alphaMode: "premultiplied",
  });

  const module = device.createShaderModule({
    code: /* wgsl */ `
      struct Uniforms {
        matrix: mat4x4f,
        color: vec4f,
      };

      struct Vertex {
        @location(0) position: vec4f,
        @location(1) color: vec4f,
      };

      struct VSOutput {
        @builtin(position) position: vec4f,
        @location(0) color: vec4f,
      };

      @group(0) @binding(0) var<uniform> uni: Uniforms;

      @vertex fn vs(vert: Vertex) -> VSOutput {
        var vsOut: VSOutput;
        vsOut.position = uni.matrix * vert.position;
        vsOut.color = vert.color;
        return vsOut;
      }

      @fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
        return vsOut.color * uni.color;
      }
    `,
  });

  const pipeline = device.createRenderPipeline({
    label: "2 attributes with color",
    layout: "auto",
    vertex: {
      module,
      buffers: [
        {
          arrayStride: 4 * 4, // (3) floats 4 bytes each + one 4 byte color
          attributes: [
            { shaderLocation: 0, offset: 0, format: "float32x3" }, // position
            { shaderLocation: 1, offset: 12, format: "unorm8x4" }, // color
          ],
        },
      ],
    },
    fragment: {
      module,
      targets: [{ format: presentationFormat }],
    },
    primitive: {
      cullMode: "back",
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth24plus",
    },
  });

  function addTRSSceneGraphNode(name, parent, trs) {
    const node = new SceneGraphNode(name, new TRS(trs));
    if (parent) {
      node.setParent(parent);
    }
    return node;
  }

  const objectInfos = [];
  function createObjectInfo() {
    // matrix and color
    const uniformBufferSize = (16 + 4) * 4;
    const uniformBuffer = device.createBuffer({
      label: "uniforms",
      size: uniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const uniformValues = new Float32Array(uniformBufferSize / 4);

    // offsets to the various uniform values in float32 indices
    const kMatrixOffset = 0;
    const kColorOffset = 16;

    const matrixValue = uniformValues.subarray(
      kMatrixOffset,
      kMatrixOffset + 16,
    );
    const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);

    const bindGroup = device.createBindGroup({
      label: "bind group for object",
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: uniformBuffer }],
    });

    return {
      uniformBuffer,
      uniformValues,
      colorValue,
      matrixValue,
      bindGroup,
    };
  }

  const meshes = [];
  function addMesh(node, vertices, color) {
    const mesh = {
      node,
      vertices,
      color,
    };
    meshes.push(mesh);
    return mesh;
  }

  function removeMesh(mesh) {
    meshes.splice(meshes.indexOf(mesh), 1);
  }

  function createVertices({ vertexData, numVertices }, name) {
    const vertexBuffer = device.createBuffer({
      label: `${name}: vertex buffer vertices`,
      size: vertexData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBuffer, 0, vertexData);
    return {
      vertexBuffer,
      numVertices,
    };
  }
  const cubeVertices = createVertices(createCubeVertices(), "cube");
  const shotVertices = createVertices(
    createConeVertices({
      radius: 10,
      height: 20,
    }),
    "shot",
  );

  const kWhite = [1, 1, 1, 1];
  function addFinger(name, parent, segments, segmentHeight, trs) {
    const nodes = [];
    const baseName = name;
    for (let i = 0; i < segments; ++i) {
      const node = addTRSSceneGraphNode(name, parent, trs);
      nodes.push(node);
      const meshNode = addTRSSceneGraphNode(`${name}-mesh`, node, {
        scale: [10, segmentHeight, 10],
      });
      addMesh(meshNode, cubeVertices, kWhite);
      parent = node;
      name = `${baseName}-${i + 1}`;
      trs = {
        translation: [0, segmentHeight, 0],
        rotation: [degToRad(15), 0, 0],
      };
    }
    return nodes;
  }

  const root = new SceneGraphNode("root");
  const wrist = addTRSSceneGraphNode("wrist", root);
  const palm = addTRSSceneGraphNode("palm", wrist, {
    translation: [0, 100, 0],
  });
  const palmMesh = addTRSSceneGraphNode("palm-mesh", wrist, {
    scale: [100, 100, 10],
  });
  addMesh(palmMesh, cubeVertices, kWhite);
  const rotation = [degToRad(15), 0, 0];
  const animNodes = [
    wrist,
    palm,
    ...addFinger("thumb", palm, 2, 20, { translation: [-50, 0, 0], rotation }),
    ...addFinger("index finger", palm, 3, 30, {
      translation: [-25, 0, 0],
      rotation,
    }),
    ...addFinger("middle finger", palm, 3, 35, {
      translation: [-0, 0, 0],
      rotation,
    }),
    ...addFinger("ring finger", palm, 3, 33, {
      translation: [25, 0, 0],
      rotation,
    }),
    ...addFinger("pinky", palm, 3, 25, { translation: [45, 0, 0], rotation }),
  ];
  const fingerTip = addTRSSceneGraphNode(
    "finger-tip",
    root.find("index finger-2"),
    { translation: [0, 30, 0] },
  );

  const renderPassDescriptor = {
    label: "our basic canvas renderPass",
    colorAttachments: [
      {
        // view: <- to be filled out when we render
        loadOp: "clear",
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      // view: <- to be filled out when we render
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  };

  const settings = {
    cameraRotation: degToRad(-45),
    animate: false,
    showMeshNodes: false,
    showAllTRS: false,
  };

  // Presents a TRS to the UI. Letting set which TRS
  // is being edited.
  class TRSUIHelper {
    #trs = new TRS();

    constructor() {}

    setTRS(trs) {
      this.#trs = trs;
    }

    get translationX() {
      return this.#trs.translation[0];
    }
    set translationX(x) {
      this.#trs.translation[0] = x;
    }
    get translationY() {
      return this.#trs.translation[1];
    }
    set translationY(x) {
      this.#trs.translation[1] = x;
    }
    get translationZ() {
      return this.#trs.translation[2];
    }
    set translationZ(x) {
      this.#trs.translation[2] = x;
    }

    get rotationX() {
      return this.#trs.rotation[0];
    }
    set rotationX(x) {
      this.#trs.rotation[0] = x;
    }
    get rotationY() {
      return this.#trs.rotation[1];
    }
    set rotationY(x) {
      this.#trs.rotation[1] = x;
    }
    get rotationZ() {
      return this.#trs.rotation[2];
    }
    set rotationZ(x) {
      this.#trs.rotation[2] = x;
    }

    get scaleX() {
      return this.#trs.scale[0];
    }
    set scaleX(x) {
      this.#trs.scale[0] = x;
    }
    get scaleY() {
      return this.#trs.scale[1];
    }
    set scaleY(x) {
      this.#trs.scale[1] = x;
    }
    get scaleZ() {
      return this.#trs.scale[2];
    }
    set scaleZ(x) {
      this.#trs.scale[2] = x;
    }
  }
  const trsUIHelper = new TRSUIHelper();

  const radToDegOptions = {
    min: -90,
    max: 90,
    step: 1,
    converters: GUI.converters.radToDeg,
  };
  const cameraRadToDegOptions = {
    min: -180,
    max: 180,
    step: 1,
    converters: GUI.converters.radToDeg,
  };

  const kUnelected = "\u3000"; // full-width space
  const kSelected = "➡️";
  const prefixRE = new RegExp(`^(?:${kUnelected}|${kSelected})`);

  function setCurrentSceneGraphNode(node) {
    trsUIHelper.setTRS(node.source);
    trsFolder.name(`orientation: ${node.name}`);
    trsFolder.updateDisplay();

    // Mark which node is selected.
    for (const b of nodeButtons) {
      const name = b.button.getName().replace(prefixRE, "");
      b.button.name(`${b.node === node ? kSelected : kUnelected}${name}`);
    }
  }

  // \u00a0 is non-breaking space.
  const threeSpaces = "\u00a0\u00a0\u00a0";
  const barTwoSpaces = "\u00a0|\u00a0";
  const plusDash = "\u00a0+-";
  // add a scene graph node to the GUI and adds the appropriate
  // prefix so it looks something like
  //
  // +-root
  // | +-child
  // | | +-child
  // | +-child
  // +-child
  function addSceneGraphNodeToGUI(gui, node, last, prefix) {
    const nodes = [];
    if (node.source instanceof TRS) {
      const label = `${prefix === undefined ? "" : `${prefix}${plusDash}`}${node.name}`;
      nodes.push({
        button: addButtonLeftJustified(gui, label, () =>
          setCurrentSceneGraphNode(node),
        ),
        node,
      });
    }
    const childPrefix =
      prefix === undefined
        ? ""
        : `${prefix}${last ? threeSpaces : barTwoSpaces}`;
    nodes.push(
      ...node.children.map((child, i) => {
        const childLast = i === node.children.length - 1;
        return addSceneGraphNodeToGUI(gui, child, childLast, childPrefix);
      }),
    );
    return nodes.flat();
  }

  const gui = new GUI();
  gui.onChange(requestRender);
  gui.add(settings, "cameraRotation", cameraRadToDegOptions);
  gui.add(settings, "animate").onChange((v) => {
    trsFolder.enable(!v);
  });
  gui.add(settings, "showMeshNodes").onChange(showMeshNodes);
  gui.add(settings, "showAllTRS").onChange(showTRS);
  gui.addButton("Fire!", fireShot);
  const trsFolder = gui.addFolder("orientation");
  const trsControls = [
    trsFolder.add(trsUIHelper, "translationX", -200, 200, 1),
    trsFolder.add(trsUIHelper, "translationY", -200, 200, 1),
    trsFolder.add(trsUIHelper, "translationZ", -200, 200, 1),
    trsFolder.add(trsUIHelper, "rotationX", radToDegOptions),
    trsFolder.add(trsUIHelper, "rotationY", radToDegOptions),
    trsFolder.add(trsUIHelper, "rotationZ", radToDegOptions),
    trsFolder.add(trsUIHelper, "scaleX", 0.1, 100),
    trsFolder.add(trsUIHelper, "scaleY", 0.1, 100),
    trsFolder.add(trsUIHelper, "scaleZ", 0.1, 100),
  ];
  const nodesFolder = gui.addFolder("nodes");
  const nodeButtons = addSceneGraphNodeToGUI(nodesFolder, root);

  function showMeshNodes(show) {
    for (const { node, button } of nodeButtons) {
      if (node.name.includes("mesh")) {
        button.show(show);
      }
    }
  }
  showMeshNodes(false);

  const alwaysShow = new Set([0, 1, 3]);
  function showTRS(show) {
    trsControls.forEach((trs, i) => {
      trs.show(show || alwaysShow.has(i));
    });
  }
  showTRS(false);

  const kShotVelocity = 100; // units per second
  const shots = [];
  let shotId = 0;
  function fireShot() {
    const node = new SceneGraphNode(`shot-${shotId++}`);
    node.setParent(root);
    mat4.translate(fingerTip.worldMatrix, [0, 20, 0], node.localMatrix);
    const mesh = addMesh(node, shotVertices, kWhite);
    const velocity = vec3.mulScalar(
      vec3.normalize(vec3.getAxis(fingerTip.worldMatrix, 1)),
      kShotVelocity,
    );
    shots.push({
      node,
      mesh,
      velocity,
      endTime: performance.now() * 0.001 + 5,
    });
    requestRender();
  }

  setCurrentSceneGraphNode(root.children[0]);

  let depthTexture;
  let objectNdx = 0;

  function drawObject(ctx, vertices, matrix, color) {
    const { pass, viewProjectionMatrix } = ctx;
    const { vertexBuffer, numVertices } = vertices;
    if (objectNdx === objectInfos.length) {
      objectInfos.push(createObjectInfo());
    }
    const { matrixValue, colorValue, uniformBuffer, uniformValues, bindGroup } =
      objectInfos[objectNdx++];

    mat4.multiply(viewProjectionMatrix, matrix, matrixValue);
    colorValue.set(color);

    // upload the uniform values to the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

    pass.setVertexBuffer(0, vertexBuffer);
    pass.setBindGroup(0, bindGroup);
    pass.draw(numVertices);
  }

  function drawMesh(ctx, mesh) {
    const { node, vertices, color } = mesh;
    drawObject(ctx, vertices, node.worldMatrix, color);
  }

  // request render if not already requested.
  let renderRequestId;
  function requestRender() {
    if (!renderRequestId) {
      renderRequestId = requestAnimationFrame(render);
    }
  }

  let then;
  let time = 0;
  let wasRunning = false;
  function render() {
    renderRequestId = undefined;
    objectNdx = 0;

    // Get the current texture from the canvas context and
    // set it as the texture to render to.
    const canvasTexture = context.getCurrentTexture();
    renderPassDescriptor.colorAttachments[0].view = canvasTexture.createView();

    // If we don't have a depth texture OR if its size is different
    // from the canvasTexture when make a new depth texture
    if (
      !depthTexture ||
      depthTexture.width !== canvasTexture.width ||
      depthTexture.height !== canvasTexture.height
    ) {
      if (depthTexture) {
        depthTexture.destroy();
      }
      depthTexture = device.createTexture({
        size: [canvasTexture.width, canvasTexture.height],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
    }
    renderPassDescriptor.depthStencilAttachment.view =
      depthTexture.createView();

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);

    const aspect = canvas.clientWidth / canvas.clientHeight;
    const projection = mat4.perspective(
      degToRad(60), // fieldOfView,
      aspect,
      1, // zNear
      2000, // zFar
    );

    // Compute a camera matrix.
    const cameraMatrix = mat4.identity();
    mat4.translate(cameraMatrix, [0, 100, 0], cameraMatrix);
    mat4.rotateY(cameraMatrix, settings.cameraRotation, cameraMatrix);
    mat4.translate(cameraMatrix, [100, 0, 300], cameraMatrix);

    // Compute a view matrix
    const viewMatrix = mat4.inverse(cameraMatrix);

    // combine the view and projection matrixes
    const viewProjectionMatrix = mat4.multiply(projection, viewMatrix);

    const ctx = { pass, viewProjectionMatrix };
    root.updateWorldMatrix();
    for (const mesh of meshes) {
      drawMesh(ctx, mesh);
    }

    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);

    const isRunning = settings.animate || shots.length;
    const now = performance.now() * 0.001;
    const deltaTime = wasRunning ? now - then : 0;
    then = now;

    if (isRunning) {
      time += deltaTime;
    }
    wasRunning = isRunning;

    if (settings.animate) {
      animate(time);
      trsFolder.updateDisplay();
      requestRender();
    }

    processShots(now, deltaTime);
  }

  const lerp = (a, b, t) => a + (b - a) * t;

  function animate(time) {
    animNodes.forEach((node, i) => {
      const source = node.source;
      const t = time + i * 0.1;
      const l = Math.sin(t) * 0.5 + 0.5;
      source.rotation[0] = lerp(0, Math.PI * 0.25, l);
    });
  }

  function processShots(now, deltaTime) {
    if (shots.length > 0) {
      requestRender();
      while (shots.length && shots[0].endTime <= now) {
        const shot = shots.shift();
        shot.node.setParent(null);
        removeMesh(shot.mesh);
      }
      for (const shot of shots) {
        const v = vec3.mulScalar(shot.velocity, deltaTime);
        mat4.multiply(
          mat4.translation(v),
          shot.node.localMatrix,
          shot.node.localMatrix,
        );
      }
    }
  }

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const canvas = entry.target;
      const width = entry.contentBoxSize[0].inlineSize;
      const height = entry.contentBoxSize[0].blockSize;
      canvas.width = Math.max(
        1,
        Math.min(width, device.limits.maxTextureDimension2D),
      );
      canvas.height = Math.max(
        1,
        Math.min(height, device.limits.maxTextureDimension2D),
      );
      // re-render
      requestRender();
    }
  });
  observer.observe(canvas);
}

function fail(msg) {
  alert(msg);
}

main(document.querySelector("#canvas"));
