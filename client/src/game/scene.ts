import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Ray } from "@babylonjs/core/Culling/ray";
import "@babylonjs/core/Collisions/collisionCoordinator";
import { Engine } from "@babylonjs/core/Engines/engine";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import "@babylonjs/core/Shaders/default.vertex";
import "@babylonjs/core/Shaders/default.fragment";
import type { Nullable } from "@babylonjs/core/types";

export type HudState = {
  health: number;
  ammo: number;
  reserve: number;
  reloading: boolean;
  score: number;
  wave: number;
  enemies: number;
  objective: string;
  locked: boolean;
  player: { x: number; z: number; angle: number };
  radarEnemies: Array<{ x: number; z: number }>;
};

type Callbacks = {
  onHud: (hud: HudState) => void;
  onGameOver: () => void;
};

type Enemy = {
  root: TransformNode;
  body: Mesh;
  head: Mesh;
  health: number;
  attackTimer: number;
  seed: number;
};

export type GameHandle = {
  scene: Scene;
  dispose: () => void;
};

const BRICK_URL = "/manus-storage/iut-brick-texture_ec5cddf1.png";

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement, callbacks: Callbacks): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.46, 0.68, 0.82, 1);
  scene.imageProcessingConfiguration.exposure = 1.05;
  scene.imageProcessingConfiguration.contrast = 1.04;
  scene.collisionsEnabled = true;
  scene.gravity = new Vector3(0, -0.24, 0);

  const brickTexture = new Texture(BRICK_URL, scene);
  brickTexture.uScale = 2.5;
  brickTexture.vScale = 2.5;
  const brick = new StandardMaterial("campus-brick", scene);
  brick.diffuseTexture = null;
  brick.diffuseColor = new Color3(0.78, 0.3, 0.2);
  brick.specularColor = new Color3(0.12, 0.08, 0.06);

  const paverTexture = new Texture(BRICK_URL, scene);
  paverTexture.uScale = 18;
  paverTexture.vScale = 42;

  const brickDark = new StandardMaterial("dark-brick", scene);
  brickDark.diffuseColor = new Color3(0.48, 0.15, 0.09);
  brickDark.specularColor = new Color3(0.08, 0.04, 0.02);

  const road = new StandardMaterial("brick-paving", scene);
  road.diffuseTexture = null;
  road.diffuseColor = new Color3(0.74, 0.34, 0.22);
  road.emissiveColor = new Color3(0.035, 0.012, 0.008);
  road.specularColor = new Color3(0.12, 0.08, 0.05);

  const lawn = new StandardMaterial("lawn", scene);
  lawn.diffuseColor = new Color3(0.09, 0.28, 0.12);
  lawn.specularColor = new Color3(0.025, 0.05, 0.02);

  const trim = new StandardMaterial("sandstone-trim", scene);
  trim.diffuseColor = new Color3(0.72, 0.38, 0.17);

  const water = new StandardMaterial("reflective-water", scene);
  water.diffuseColor = new Color3(0.08, 0.3, 0.34);
  water.emissiveColor = new Color3(0.018, 0.07, 0.08);
  water.alpha = 0.82;
  water.specularColor = new Color3(0.52, 0.65, 0.62);
  water.backFaceCulling = false;
  const waterGlint = new StandardMaterial("water-glint", scene);
  waterGlint.diffuseColor = new Color3(0.3, 0.72, 0.7);
  waterGlint.emissiveColor = new Color3(0.04, 0.16, 0.15);
  waterGlint.alpha = 0.28;
  waterGlint.backFaceCulling = false;

  const dark = new StandardMaterial("arch-shadow", scene);
  dark.diffuseColor = new Color3(0.18, 0.075, 0.05);
  dark.emissiveColor = new Color3(0.05, 0.018, 0.01);

  const leaf = new StandardMaterial("palm-leaf", scene);
  leaf.diffuseColor = new Color3(0.04, 0.29, 0.1);

  const trunk = new StandardMaterial("palm-trunk", scene);
  trunk.diffuseColor = new Color3(0.35, 0.2, 0.1);

  const white = new StandardMaterial("painted-trunk", scene);
  white.diffuseColor = new Color3(0.82, 0.81, 0.69);

  const lamp = new StandardMaterial("lamp-post", scene);
  lamp.diffuseColor = new Color3(0.05, 0.07, 0.075);
  lamp.emissiveColor = new Color3(0.02, 0.025, 0.02);

  const enemyMat = new StandardMaterial("hostile-suit", scene);
  enemyMat.diffuseColor = new Color3(0.56, 0.11, 0.065);
  enemyMat.emissiveColor = new Color3(0.08, 0.012, 0.006);

  const enemyGlow = new StandardMaterial("hostile-glow", scene);
  enemyGlow.diffuseColor = new Color3(1, 0.42, 0.12);
  enemyGlow.emissiveColor = new Color3(0.75, 0.18, 0.02);

  const muzzleMat = new StandardMaterial("muzzle-flash", scene);
  muzzleMat.diffuseColor = new Color3(1, 0.62, 0.12);
  muzzleMat.emissiveColor = new Color3(1, 0.28, 0.02);
  muzzleMat.alpha = 0.92;
  const sparkMat = new StandardMaterial("impact-spark", scene);
  sparkMat.diffuseColor = new Color3(1, 0.32, 0.08);
  sparkMat.emissiveColor = new Color3(1, 0.16, 0.01);

  const weaponMat = new StandardMaterial("sidearm-polymer", scene);
  weaponMat.diffuseColor = new Color3(0.055, 0.065, 0.07);
  weaponMat.specularColor = new Color3(0.22, 0.24, 0.26);
  const weaponMetal = new StandardMaterial("sidearm-metal", scene);
  weaponMetal.diffuseColor = new Color3(0.2, 0.22, 0.22);
  weaponMetal.specularColor = new Color3(0.7, 0.72, 0.7);
  const weaponAccent = new StandardMaterial("sidearm-accent", scene);
  weaponAccent.diffuseColor = new Color3(0.28, 0.035, 0.018);
  weaponAccent.emissiveColor = new Color3(0.05, 0.004, 0.002);

  const ground = MeshBuilder.CreateGround("campus-ground", { width: 120, height: 120 }, scene);
  ground.material = lawn;
  ground.checkCollisions = true;

  const plaza = MeshBuilder.CreateBox("central-plaza", { width: 22, height: 0.18, depth: 58 }, scene);
  plaza.position = new Vector3(0, 0.08, 3);
  plaza.material = road;
  plaza.checkCollisions = true;

  const avenue = MeshBuilder.CreateBox("palm-avenue", { width: 17, height: 0.2, depth: 92 }, scene);
  avenue.position = new Vector3(0, 0.1, 2);
  avenue.material = road;
  avenue.checkCollisions = true;

  function box(name: string, position: Vector3, dimensions: { width: number; height: number; depth: number }, material: StandardMaterial, collision = false) {
    const mesh = MeshBuilder.CreateBox(name, dimensions, scene);
    mesh.position = position;
    mesh.material = material;
    mesh.checkCollisions = collision;
    return mesh;
  }

  function cylinder(name: string, position: Vector3, dimensions: { diameter: number; height: number }, material: StandardMaterial) {
    const mesh = MeshBuilder.CreateCylinder(name, dimensions, scene);
    mesh.position = position;
    mesh.material = material;
    return mesh;
  }

  function makeWindowRow(parentX: number, frontZ: number, width: number, floors: number, side = false) {
    for (let floor = 0; floor < floors; floor += 1) {
      const y = 2.2 + floor * 2.35;
      const count = Math.max(3, Math.floor(width / 3));
      for (let i = 0; i < count; i += 1) {
        const offset = -width / 2 + 1.6 + i * ((width - 3) / Math.max(1, count - 1));
        const win = box(`arch-window-${parentX}-${floor}-${i}`, side ? new Vector3(frontZ, y, parentX + offset) : new Vector3(parentX + offset, y, frontZ), side ? { width: 0.13, height: 1.55, depth: 1.05 } : { width: 1.05, height: 1.55, depth: 0.13 }, dark);
        win.isPickable = false;
      }
    }
  }

  function createBuilding(name: string, position: Vector3, width: number, depth: number, height: number, windows = true) {
    const body = box(name, new Vector3(position.x, height / 2, position.z), { width, height, depth }, brick, true);
    if (windows) {
      makeWindowRow(position.x, position.z - depth / 2 - 0.08, width - 2, Math.max(1, Math.floor(height / 2.3)));
      makeWindowRow(position.x, position.z + depth / 2 + 0.08, width - 2, Math.max(1, Math.floor(height / 2.3)));
    }
    const towerRadius = 1.15;
    for (const side of [-1, 1]) {
      const tower = cylinder(`${name}-round-tower-${side}`, new Vector3(position.x + side * (width / 2 - 0.7), height / 2, position.z), { diameter: towerRadius * 2, height: height + 0.4 }, brick);
      tower.checkCollisions = true;
    }
    const roof = box(`${name}-roof-cap`, new Vector3(position.x, height + 0.18, position.z), { width: width + 0.35, height: 0.35, depth: depth + 0.35 }, brickDark);
    roof.checkCollisions = true;
    return body;
  }

  function createArchway(name: string, position: Vector3, scale = 1) {
    const pillarWidth = 2.35 * scale;
    box(`${name}-left`, new Vector3(position.x - 5.1 * scale, 3.9 * scale, position.z), { width: pillarWidth, height: 7.8 * scale, depth: 2.1 * scale }, brick, true);
    box(`${name}-right`, new Vector3(position.x + 5.1 * scale, 3.9 * scale, position.z), { width: pillarWidth, height: 7.8 * scale, depth: 2.1 * scale }, brick, true);
    box(`${name}-lintel`, new Vector3(position.x, 7.55 * scale, position.z), { width: 12.5 * scale, height: 1.9 * scale, depth: 2.1 * scale }, brick, true);
  }

  function createCentralPavilion(position: Vector3) {
    const body = box("central-pavilion", new Vector3(position.x, 2.25, position.z), { width: 7.2, height: 4.5, depth: 6.2 }, brick, true);
    body.isPickable = false;
    for (const side of [-1, 1]) {
      const tower = cylinder("central-pavilion-corner", new Vector3(position.x + side * 3.15, 2.35, position.z), { diameter: 1.45, height: 4.7 }, brick);
      tower.checkCollisions = true;
    }
    const roof = box("central-pavilion-roof", new Vector3(position.x, 4.62, position.z), { width: 7.55, height: 0.28, depth: 6.55 }, brickDark);
    roof.checkCollisions = true;
    const dome = MeshBuilder.CreateSphere("central-pavilion-dome", { diameter: 4.7, segments: 24, slice: 0.5 }, scene);
    dome.position = new Vector3(position.x, 5.15, position.z);
    dome.scaling.y = 0.72;
    dome.material = trim;
    const minaret = cylinder("central-pavilion-minaret", new Vector3(position.x + 4.55, 4.2, position.z - 0.4), { diameter: 0.95, height: 8.4 }, brick);
    minaret.checkCollisions = true;
    const minaretCap = cylinder("central-pavilion-minaret-cap", new Vector3(position.x + 4.55, 8.55, position.z - 0.4), { diameter: 1.35, height: 0.35 }, trim);
    minaretCap.checkCollisions = true;
    const finial = cylinder("central-pavilion-finial", new Vector3(position.x + 4.55, 9.25, position.z - 0.4), { diameter: 0.18, height: 1.1 }, trim);
    finial.isPickable = false;
    for (const side of [-1, 1]) {
      const facade = box("central-pavilion-facade", new Vector3(position.x + side * 2.25, 2.05, position.z - 3.14), { width: 1.25, height: 3.5, depth: 0.18 }, dark);
      facade.isPickable = false;
    }
  }

  function createBridge(x: number, z: number, width: number, depth: number) {
    box("bridge-deck", new Vector3(x, 0.42, z), { width, height: 0.42, depth }, road, true);
    box("bridge-rail-a", new Vector3(x - width / 2 + 0.28, 1.1, z), { width: 0.32, height: 1.2, depth }, brick, true);
    box("bridge-rail-b", new Vector3(x + width / 2 - 0.28, 1.1, z), { width: 0.32, height: 1.2, depth }, brick, true);
    for (const end of [-1, 1]) box("bridge-end", new Vector3(x, 0.9, z + end * (depth / 2 - 0.18)), { width, height: 0.85, depth: 0.28 }, brickDark);
  }

  function createCourtParapet(x: number, z: number, length: number, side: number) {
    const railX = x + side * 3.35;
    box("court-parapet-base", new Vector3(railX, 0.38, z), { width: 0.55, height: 0.24, depth: length }, brick, true);
    for (let offset = -length / 2 + 1.2; offset < length / 2; offset += 3.6) {
      box("court-parapet-pier", new Vector3(railX, 1.15, z + offset), { width: 0.72, height: 1.18, depth: 0.46 }, brick, true);
      box("court-parapet-cap", new Vector3(railX, 1.72, z + offset + 1.55), { width: 0.62, height: 0.18, depth: 3.1 }, brickDark);
    }
  }

  function createPalm(x: number, z: number, size = 1) {
    cylinder("palm-white-base", new Vector3(x, 0.65 * size, z), { diameter: 0.72 * size, height: 1.3 * size }, white);
    cylinder("palm-trunk", new Vector3(x, 2.8 * size, z), { diameter: 0.43 * size, height: 4.5 * size }, trunk);
    for (let i = 0; i < 7; i += 1) {
      const angle = (i / 7) * Math.PI * 2;
      const frond = box("palm-frond", new Vector3(x + Math.cos(angle) * 1.15 * size, 5.2 * size, z + Math.sin(angle) * 1.15 * size), { width: 0.16 * size, height: 0.14 * size, depth: 2.8 * size }, leaf);
      frond.rotation.y = angle;
      frond.rotation.x = 0.45;
    }
  }

  function createLampPost(x: number, z: number) {
    cylinder("lamp-post", new Vector3(x, 2.5, z), { diameter: 0.1, height: 5 }, lamp);
    box("lamp-head", new Vector3(x + 0.48, 4.88, z), { width: 0.92, height: 0.1, depth: 0.18 }, lamp);
  }

  // A connected rectangular water court frames the ceremonial bridge.
  box("water-court-left", new Vector3(-14, 0.18, 1), { width: 10.5, height: 0.18, depth: 32 }, water);
  box("water-court-right", new Vector3(14, 0.18, 1), { width: 10.5, height: 0.18, depth: 32 }, water);
  box("water-court-back", new Vector3(0, 0.18, -15), { width: 38.5, height: 0.18, depth: 5 }, water);
  box("water-court-front", new Vector3(0, 0.18, 17), { width: 38.5, height: 0.18, depth: 4.5 }, water);
  box("water-court-left-border", new Vector3(-19.6, 0.28, 1), { width: 0.6, height: 0.4, depth: 38 }, brick, true);
  box("water-court-right-border", new Vector3(19.6, 0.28, 1), { width: 0.6, height: 0.4, depth: 38 }, brick, true);
  for (const side of [-14, 14]) {
    for (const z of [-10, -2, 6, 14]) {
      const glint = box("water-surface-glint", new Vector3(side, 0.3, z), { width: 7.2, height: 0.025, depth: 0.12 }, waterGlint);
      glint.rotation.y = side < 0 ? -0.12 : 0.12;
      glint.isPickable = false;
    }
  }
  for (const x of [-10, 0, 10]) {
    const glint = box("water-back-glint", new Vector3(x, 0.3, -15), { width: 0.12, height: 0.025, depth: 3.4 }, waterGlint);
    glint.rotation.y = x * 0.01;
    glint.isPickable = false;
  }
  createBridge(0, 1, 6.6, 40);
  createCourtParapet(0, 1, 40, -1);
  createCourtParapet(0, 1, 40, 1);
  createBridge(-14, 11, 10.5, 4.1);
  createBridge(14, -7, 10.5, 4.1);
  createBridge(0, -15, 18, 4.5);

  createArchway("monumental-gateway", new Vector3(0, 0, -11), 1.15);
  createArchway("garden-gateway", new Vector3(0, 0, 20), 0.68);
  createCentralPavilion(new Vector3(-10.2, 0, -7.2));

  // Academic blocks and a residence flank reproduce the supplied red-brick silhouette.
  createBuilding("north-academic", new Vector3(-24, 0, -16), 18, 13, 9, true);
  createBuilding("south-academic", new Vector3(24, 0, -14), 17, 14, 8, true);
  createBuilding("residence-west", new Vector3(-27, 0, 12), 19, 16, 12, true);
  createBuilding("residence-east", new Vector3(27, 0, 10), 19, 16, 12, true);

  // Low arcades and garden walls create readable cover around the arena.
  for (let i = -2; i <= 2; i += 1) {
    box(`left-arcade-${i}`, new Vector3(-20, 2.1, i * 6 - 2), { width: 2.1, height: 4.2, depth: 3.8 }, brick, true);
    box(`right-arcade-${i}`, new Vector3(20, 2.1, i * 6 - 2), { width: 2.1, height: 4.2, depth: 3.8 }, brick, true);
  }
  box("field-wall", new Vector3(32, 1.6, -1), { width: 1.1, height: 3.2, depth: 46 }, brick, true);
  box("west-garden-wall", new Vector3(-32, 1.6, -1), { width: 1.1, height: 3.2, depth: 46 }, brick, true);

  for (let z = -26; z <= 27; z += 6) {
    createPalm(-9.5, z, 0.82);
    createPalm(9.5, z, 0.82);
    createLampPost(-7.4, z + 2.4);
    createLampPost(7.4, z + 2.4);
  }
  for (let z = -25; z <= 25; z += 8) {
    createPalm(-34, z, 1.05);
    createPalm(34, z, 1.05);
  }
  for (let z = -14; z <= 16; z += 5) {
    createPalm(-20.8, z, 0.92);
    createPalm(20.8, z, 0.92);
  }

  const hemi = new HemisphericLight("warm-sky", new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.85;
  hemi.diffuse = new Color3(1, 0.82, 0.66);
  hemi.groundColor = new Color3(0.12, 0.16, 0.13);
  const sun = new DirectionalLight("sunset-sun", new Vector3(-0.4, -1, 0.3), scene);
  sun.position = new Vector3(25, 40, -30);
  sun.intensity = 1.1;
  sun.diffuse = new Color3(1, 0.78, 0.58);

  const gatewayLight = new PointLight("gateway-amber", new Vector3(0, 4.5, -9.2), scene);
  gatewayLight.diffuse = new Color3(1, 0.34, 0.12);
  gatewayLight.specular = new Color3(1, 0.48, 0.2);
  gatewayLight.intensity = 8;
  gatewayLight.range = 18;
  const gatewayFill = new PointLight("gateway-fill", new Vector3(0, 2.8, -13), scene);
  gatewayFill.diffuse = new Color3(0.95, 0.55, 0.3);
  gatewayFill.intensity = 4;
  gatewayFill.range = 13;
  const courtFill = new PointLight("court-fill", new Vector3(0, 6.5, 7), scene);
  courtFill.diffuse = new Color3(1, 0.62, 0.36);
  courtFill.intensity = 5;
  courtFill.range = 28;
  const waterLightPositions = [new Vector3(-14, 2.2, -5), new Vector3(14, 2.2, -5), new Vector3(-14, 2.2, 9), new Vector3(14, 2.2, 9)];
  waterLightPositions.forEach((position, index) => {
    const waterLight = new PointLight(`water-court-glow-${index}`, position, scene);
    waterLight.diffuse = new Color3(0.1, 0.65, 0.72);
    waterLight.specular = new Color3(0.3, 0.8, 0.9);
    waterLight.intensity = 2.5;
    waterLight.range = 12;
  });

  const camera = new FreeCamera("operator-camera", new Vector3(0, 2.1, 34), scene);
  camera.attachControl(canvas, true);
  camera.minZ = 0.15;
  camera.maxZ = 160;
  camera.speed = 0.22;
  camera.angularSensibility = 3200;
  camera.inertia = 0.15;
  camera.keysUp = [87];
  camera.keysDown = [83];
  camera.keysLeft = [65];
  camera.keysRight = [68];
  camera.applyGravity = false;
  camera.checkCollisions = true;
  camera.ellipsoid = new Vector3(0.72, 1.0, 0.72);
  camera.rotation = new Vector3(0, Math.PI, 0);
  scene.activeCamera = camera;

  const weaponRoot = new TransformNode("operator-rifle", scene);
  weaponRoot.parent = camera;
  weaponRoot.position = new Vector3(0.42, -0.54, 1.02);
  weaponRoot.scaling = new Vector3(0.72, 0.72, 0.72);
  weaponRoot.rotation = new Vector3(-0.08, 0.02, 0.02);
  const weaponFrame = MeshBuilder.CreateBox("rifle-receiver", { width: 0.42, height: 0.3, depth: 0.92 }, scene);
  weaponFrame.parent = weaponRoot;
  weaponFrame.position = new Vector3(0, 0.08, 0.22);
  weaponFrame.material = weaponMat;
  const weaponSlide = MeshBuilder.CreateBox("rifle-upper", { width: 0.36, height: 0.16, depth: 0.72 }, scene);
  weaponSlide.parent = weaponRoot;
  weaponSlide.position = new Vector3(0, 0.27, 0.08);
  weaponSlide.material = weaponMetal;
  const weaponHandguard = MeshBuilder.CreateBox("rifle-handguard", { width: 0.34, height: 0.22, depth: 1.22 }, scene);
  weaponHandguard.parent = weaponRoot;
  weaponHandguard.position = new Vector3(0, 0.18, -0.72);
  weaponHandguard.material = weaponMat;
  const weaponBarrel = MeshBuilder.CreateCylinder("rifle-barrel", { diameter: 0.1, height: 1.05, tessellation: 12 }, scene);
  weaponBarrel.parent = weaponRoot;
  weaponBarrel.rotation.x = Math.PI / 2;
  weaponBarrel.position = new Vector3(0, 0.22, -1.34);
  weaponBarrel.material = weaponMetal;
  const weaponStock = MeshBuilder.CreateBox("rifle-stock", { width: 0.34, height: 0.26, depth: 0.52 }, scene);
  weaponStock.parent = weaponRoot;
  weaponStock.position = new Vector3(0, 0.08, 0.86);
  weaponStock.material = weaponMat;
  const weaponGrip = MeshBuilder.CreateBox("rifle-grip", { width: 0.26, height: 0.62, depth: 0.3 }, scene);
  weaponGrip.parent = weaponRoot;
  weaponGrip.position = new Vector3(0, -0.3, 0.42);
  weaponGrip.rotation.x = -0.2;
  weaponGrip.material = weaponMat;
  const weaponSight = MeshBuilder.CreateBox("rifle-optic", { width: 0.12, height: 0.1, depth: 0.24 }, scene);
  weaponSight.parent = weaponRoot;
  weaponSight.position = new Vector3(0, 0.43, -0.08);
  weaponSight.material = weaponMetal;
  const weaponMagazine = MeshBuilder.CreateBox("rifle-magazine", { width: 0.24, height: 0.58, depth: 0.22 }, scene);
  weaponMagazine.parent = weaponRoot;
  weaponMagazine.position = new Vector3(0, -0.48, 0.28);
  weaponMagazine.rotation.x = -0.22;
  weaponMagazine.material = weaponMetal;
  const weaponMeshes = [weaponFrame, weaponSlide, weaponHandguard, weaponBarrel, weaponStock, weaponGrip, weaponSight, weaponMagazine];
  weaponMeshes.forEach((mesh) => { mesh.isPickable = false; });

  let health = 100;
  let ammo = 30;
  const reserve = Number.POSITIVE_INFINITY;
  let score = 0;
  let wave = 1;
  let waveClearTimer = 0;
  let gameOver = false;
  let lastShot = 0;
  let reloadTimer = 0;
  const reloadDuration = 1.35;
  let recoil = 0;
  let hudTimer = 0;
  const enemies: Enemy[] = [];
  const transientEffects: Array<{ mesh: Mesh; life: number; maxLife: number }> = [];
  let audioContext: AudioContext | null = null;

  function spawnEnemy(position: Vector3, seed: number) {
    const root = new TransformNode(`hostile-${seed}`, scene);
    root.position = position.clone();
    const body = MeshBuilder.CreateBox(`hostile-body-${seed}`, { width: 0.85, height: 1.35, depth: 0.62 }, scene);
    body.position = new Vector3(0, 1.05, 0);
    body.parent = root;
    body.material = enemyMat;
    body.metadata = { enemy: root };
    const head = MeshBuilder.CreateSphere(`hostile-head-${seed}`, { diameter: 0.62, segments: 12 }, scene);
    head.position = new Vector3(0, 2.0, 0);
    head.parent = root;
    head.material = enemyGlow;
    head.metadata = { enemy: root };
    const shoulder = box(`hostile-shoulder-${seed}`, new Vector3(0, 1.4, 0), { width: 1.25, height: 0.18, depth: 0.76 }, enemyMat);
    shoulder.parent = root;
    shoulder.metadata = { enemy: root };
    enemies.push({ root, body, head, health: 100, attackTimer: 0, seed });
  }

  function clearEnemies() {
    while (enemies.length) {
      const enemy = enemies.pop();
      enemy?.root.dispose(false, true);
    }
  }

  function startWave() {
    clearEnemies();
    const count = Math.min(10, 4 + wave * 2);
    const positions = [
      new Vector3(-18, 0, -5), new Vector3(18, 0, -1), new Vector3(-25, 0, -24), new Vector3(25, 0, -22),
      new Vector3(-25, 0, 23), new Vector3(25, 0, 24), new Vector3(-5, 0, -31), new Vector3(6, 0, -34),
      new Vector3(-29, 0, 2), new Vector3(29, 0, 0),
    ];
    for (let i = 0; i < count; i += 1) spawnEnemy(positions[i], i + wave * 13);
    waveClearTimer = 0;
  }

  startWave();

  const cleanup: Array<() => void> = [];
  const onPointerDown = (event: PointerEvent) => {
    if (gameOver) return;
    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
      return;
    }
    if (event.button === 0) shoot();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.code === "KeyR" && reloadTimer <= 0 && ammo < 30) startReload();
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") camera.speed = 0.38;
  };
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") camera.speed = 0.22;
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  cleanup.push(() => canvas.removeEventListener("pointerdown", onPointerDown));
  cleanup.push(() => window.removeEventListener("keydown", onKeyDown));
  cleanup.push(() => window.removeEventListener("keyup", onKeyUp));

  function shoot() {
    const now = performance.now();
    if (reloadTimer > 0 || now - lastShot < 130) return;
    if (ammo <= 0) { startReload(); return; }
    lastShot = now;
    ammo -= 1;
    recoil = 0.12;
    createMuzzleFlash();
    playShotSound();
    const ray = new Ray(camera.position, camera.getForwardRay().direction, 80);
    const pick = scene.pickWithRay(ray, (mesh) => mesh.metadata?.enemy != null);
    if (pick?.hit && pick.pickedMesh?.metadata?.enemy) {
      if (pick.pickedPoint) createHitEffect(pick.pickedPoint);
      playHitSound();
      const root = pick.pickedMesh.metadata.enemy as TransformNode;
      const enemy = enemies.find((item) => item.root === root);
      if (enemy) {
        enemy.health -= 55;
        enemy.root.scaling = new Vector3(1.14, 1.14, 1.14);
        if (enemy.health <= 0) {
          score += 100;
          enemy.root.dispose(false, true);
          const index = enemies.indexOf(enemy);
          if (index >= 0) enemies.splice(index, 1);
        }
      }
    }
    if (ammo === 0) startReload();
  }

  function startReload() {
    if (reloadTimer > 0 || ammo >= 30) return;
    reloadTimer = reloadDuration;
    playReloadSound();
  }

  function playReloadSound() {
    playTone(105, 72, 0.12, 0.025);
    window.setTimeout(() => playTone(280, 170, 0.09, 0.022), 420);
    window.setTimeout(() => playTone(170, 430, 0.14, 0.025), 930);
  }

  function createMuzzleFlash() {
    const flash = MeshBuilder.CreateSphere("muzzle-flash", { diameter: 0.34, segments: 8 }, scene);
    flash.parent = camera;
    flash.position = new Vector3(0.34, -0.18, 1.15);
    flash.scaling = new Vector3(1.8, 0.6, 0.6);
    flash.material = muzzleMat;
    transientEffects.push({ mesh: flash, life: 0.075, maxLife: 0.075 });
  }

  function createHitEffect(point: Vector3) {
    const spark = MeshBuilder.CreateSphere("impact-spark", { diameter: 0.24, segments: 8 }, scene);
    spark.position = point.clone();
    spark.material = sparkMat;
    transientEffects.push({ mesh: spark, life: 0.24, maxLife: 0.24 });
  }

  function getAudioContext() {
    if (!audioContext) audioContext = new AudioContext();
    if (audioContext.state === "suspended") void audioContext.resume();
    return audioContext;
  }

  function playTone(startFrequency: number, endFrequency: number, duration: number, volume: number) {
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(startFrequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, context.currentTime + duration);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  function playShotSound() { playTone(150, 62, 0.11, 0.035); }
  function playHitSound() { playTone(720, 240, 0.08, 0.025); }

  function updateEnemies(delta: number) {
    for (const enemy of enemies) {
      enemy.root.scaling = Vector3.Lerp(enemy.root.scaling, Vector3.One(), Math.min(1, delta * 8));
      const toPlayer = camera.position.subtract(enemy.root.position);
      const distance = toPlayer.length();
      enemy.root.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
      if (distance > 2.5) {
        const step = toPlayer.normalize().scale(Math.min(delta * (0.85 + wave * 0.06), distance - 2.3));
        enemy.root.position.addInPlace(new Vector3(step.x, 0, step.z));
      } else {
        enemy.attackTimer -= delta;
        if (enemy.attackTimer <= 0) {
          health = Math.max(0, health - 8);
          enemy.attackTimer = 1.0;
          if (health === 0 && !gameOver) {
            gameOver = true;
            document.exitPointerLock?.();
            callbacks.onGameOver();
          }
        }
      }
    }
  }

  const hudSnapshot = (): HudState => ({
    health,
    ammo,
    reserve,
    score,
    wave,
    enemies: enemies.length,
    reloading: reloadTimer > 0,
    objective: enemies.length ? "CLEAR THE CENTRAL COURT" : waveClearTimer < 0.8 ? "SECTOR SECURED" : "REINFORCEMENTS INBOUND",
    locked: document.pointerLockElement === canvas,
    player: { x: camera.position.x, z: camera.position.z, angle: camera.rotation.y },
    radarEnemies: enemies.map((enemy) => ({ x: enemy.root.position.x, z: enemy.root.position.z })),
  });

  const onBeforeRender = scene.onBeforeRenderObservable.add(() => {
    const delta = Math.min(0.05, engine.getDeltaTime() / 1000);
    recoil = Math.max(0, recoil - delta * 1.8);
    const sway = Math.sin(performance.now() * 0.004) * 0.006;
    weaponRoot.position.x = 0.42 + sway;
    weaponRoot.position.y = -0.54 - recoil;
    if (!gameOver) {
      if (reloadTimer > 0) {
        reloadTimer -= delta;
        const reloadProgress = 1 - Math.max(0, reloadTimer / reloadDuration);
        weaponSlide.position.z = 0.08 + (reloadProgress < 0.2 ? reloadProgress * 0.35 : 0.07 - Math.max(0, reloadProgress - 0.82) * 0.35);
        weaponMagazine.position.y = reloadProgress > 0.26 && reloadProgress < 0.68 ? -0.9 : -0.48;
        if (reloadTimer <= 0) {
          ammo = 30;
          weaponSlide.position.z = 0.08;
          weaponMagazine.position.y = -0.48;
        }
      }
      updateEnemies(delta);
      if (enemies.length === 0) {
        waveClearTimer += delta;
        if (waveClearTimer > 2.2) {
          wave += 1;
          startWave();
        }
      }
    }
    for (let index = transientEffects.length - 1; index >= 0; index -= 1) {
      const effect = transientEffects[index];
      effect.life -= delta;
      const progress = Math.max(0, effect.life / effect.maxLife);
      effect.mesh.scaling.scaleInPlace(0.94);
      effect.mesh.visibility = progress;
      if (effect.life <= 0) {
        effect.mesh.dispose();
        transientEffects.splice(index, 1);
      }
    }
    hudTimer += delta;
    if (hudTimer > 0.1) {
      hudTimer = 0;
      callbacks.onHud(hudSnapshot());
    }
  });

  callbacks.onHud(hudSnapshot());

  return {
    scene,
    dispose: () => {
      if (onBeforeRender) scene.onBeforeRenderObservable.remove(onBeforeRender);
      cleanup.forEach((remove) => remove());
      clearEnemies();
      transientEffects.forEach((effect) => effect.mesh.dispose());
      audioContext?.close();
      scene.dispose();
    },
  };
}
