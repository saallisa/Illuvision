
import { BasicMaterial } from '/src/core/material/basic-material.js';
import { Color } from '/src/core/color.js';
import { Engine } from '/src/engine.js';
import { Mesh } from '/src/core/mesh.js';
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
}

main();