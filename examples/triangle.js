
import { BasicMaterial } from '/src/core/material/basic-material.js';
import { Color } from '/src/core/color.js';
import { Engine } from '/src/engine.js';
import { Mesh } from '/src/core/mesh.js';
import { Scene } from '/src/core/scene.js';
import { SceneNode } from '/src/core/scene-node.js';
import { Triangle } from '/src/core/geometry/triangle.js';
import { Vector3 } from '/src/core/vector3.js';

/**
 * Render a triangle onto the canvas.
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
    const sceneNode = new SceneNode(triangle);

    // Set the position relative to the origin
    sceneNode.setPosition(new Vector3(0.5, 0, 0));

    // Scale it by half
    sceneNode.setScale(new Vector3(0.5, 0.5, 0.5));

    // Create a new Scene and add the node to it
    const scene = new Scene();
    scene.addNode(sceneNode);

    await engine.render(scene);
}

main();