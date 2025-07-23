
import { BasicMaterial } from '/src/core/material/basic-material.js';
import { Color } from '/src/core/color.js';
import { Engine } from '/src/engine.js';
import { Mesh } from '../src/core/mesh.js';
import { OrthographicCamera } from '/src/core/camera/orthographic-camera.js';
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
    engine.setClearColor(Color.GREY);
    await engine.initialize();

    // Add canvas to page
    document.body.appendChild(engine.getCanvas());

    // Create a simple plane
    const planeGeometry = new Plane(1, 1, 1, 1);

    // Define the material to use
    const planeMaterial = await BasicMaterial.init({
        color: Color.RED
    });

    // Create a mesh from the geometry and material
    const plane = new Mesh(planeGeometry, planeMaterial);

    // Create a scene node
    const sceneNode = new SceneNode(plane);

    // Set the position relative to the origin
    sceneNode.setPosition(new Vector3(0.5, 0, 0));

    // Scale it by half
    sceneNode.setScale(new Vector3(0.5, 0.5, 0.5));

    // Create a new Scene and add the node to it
    const scene = new Scene();
    scene.addNode(sceneNode);

    // Create an orthographic camera
    const camera = new OrthographicCamera();
    camera.setAspectRatio(engine.getAspectRatio());

    await engine.render(scene, camera);
}

main();