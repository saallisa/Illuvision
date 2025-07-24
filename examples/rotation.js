
import { BasicMaterial } from '/src/core/material/basic-material.js';
import { Color } from '/src/core/color.js';
import { Engine } from '/src/engine.js';
import { Mesh } from '../src/core/mesh.js';
import { OrthographicCamera } from '/src/core/camera/orthographic-camera.js';
import { Plane } from '/src/core/geometry/plane.js';
import { Scene } from '/src/core/scene.js';
import { SceneNode } from '/src/core/scene-node.js';
import { Triangle } from '/src/core/geometry/triangle.js';
import { Vector3 } from '/src/core/vector3.js';

/**
 * Render two rotating shapes onto the canvas.
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

    // Create a simple triangle
    const triangleGeometry = new Triangle(
        new Vector3(0, 0.5, 0),
        new Vector3(-0.5, -0.5, 0),
        new Vector3(0.5, -0.5, 0)
    );

    // Define the material to use
    const triangleMaterial = await BasicMaterial.init({
        color: Color.MAGENTA
    });

    // Create a mesh from the geometry and material
    const triangle = new Mesh(triangleGeometry, triangleMaterial);

    // Create a scene node
    const sceneNode2 = new SceneNode(triangle);

    // Set the position relative to the origin
    sceneNode2.setPosition(new Vector3(-0.5, 0, 0));

    // Scale it by half
    sceneNode2.setScale(new Vector3(0.5, 0.5, 0.5));

    // Create the node to the scene
    scene.addNode(sceneNode2);

    // Create an orthographic camera
    const camera = new OrthographicCamera();
    camera.setAspectRatio(engine.getAspectRatio());

    // Create the function for the animation loop 
    const animation = function ()
    {
        // Set the rotation increase / decrease for the nodes
        sceneNode.rotateZ = sceneNode.rotateZ - 0.5;
        sceneNode2.rotateZ = sceneNode2.rotateZ + 0.5;

        // Render the scene on each frame using the camera
        engine.render(scene, camera);
    }

    // Set the animation loop
    engine.setAnimationLoop(animation);
}

main();