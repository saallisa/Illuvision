
import { BasicMaterial } from '/src/core/material/basic-material.js';
import { Box } from '/src/core/geometry/box.js';
import { Color } from '/src/core/color.js';
import { Engine } from '/src/engine.js';
import { Mesh } from '../src/core/mesh.js';
import { PerspectiveCamera } from '/src/core/camera/perspective-camera.js';
import { Plane } from '/src/core/geometry/plane.js';
import { Scene } from '/src/core/scene.js';
import { SceneNode } from '/src/core/scene-node.js';
import { Vector3 } from '/src/core/vector3.js';

/**
 * Render a plane onto the canvas.
 */
async function main()
{
    // Configure engine
    const baseUrl = new URL(window.location.href);
    Engine.setRootPath(baseUrl.origin + '/src/');

    // Init engine
    const engine = new Engine();
    engine.setSizeToWindow();
    engine.setClearColor(Color.fromHex('87ceeb')); // sky blue
    await engine.initialize();

    // Add canvas to page
    document.body.appendChild(engine.getCanvas());

    // Create a simple ground plane
    const groundGeometry = new Plane(5, 5, 1, 1);

    // Define the material to use
    const groundMaterial = await BasicMaterial.init({
        color: Color.GREEN
    });

    // Create a mesh from the geometry and material
    const ground = new Mesh(groundGeometry, groundMaterial);

    // Create a scene node for the ground
    const sceneNode = new SceneNode(ground);
    sceneNode.setPosition(new Vector3(0, 0, 0));

    // Rotate the scene node so that it covers the ground
    sceneNode.rotateX = 90;

    // Create a simple box
    const boxGeometry = new Box(1, 1, 1);

    // Define the material to use
    const boxMaterial = await BasicMaterial.init({
        color: Color.BLUE
    });

    // Create a mesh from the geometry and material
    const box = new Mesh(boxGeometry, boxMaterial);

    // Create a second scene node for the box
    const sceneNode2 = new SceneNode(box);
    sceneNode2.setPosition(new Vector3(0, 1, 0));

    // Create a new Scene and add the node to it
    const scene = new Scene();
    scene.addNode(sceneNode);
    scene.addNode(sceneNode2);

    // Create an perspective camera
    const camera = new PerspectiveCamera(45, 0.1, 100);
    camera.setAspectRatio(engine.getAspectRatio());
    camera.setTarget(new Vector3(0, 0, 0));
    camera.setPosition(new Vector3(5, 5, 5));

    // Create the function for the animation loop 
    const animation = function ()
    {
        // Rotate the cube
        sceneNode2.rotateX = sceneNode2.rotateX + 0.5;
        sceneNode2.rotateY = sceneNode2.rotateY + 0.5;
        sceneNode2.rotateZ = sceneNode2.rotateZ + 0.5;

        engine.render(scene, camera);
    }

    // Set the animation loop
    engine.setAnimationLoop(animation);
}

main();