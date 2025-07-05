
import { Engine } from '/src/engine.js';
import { Triangle } from '/src/core/geometry/triangle.js';
import { Vector3 } from '/src/core/vector3.js';

/**
 * Render a triangle onto the canvas.
 */
async function main()
{
    // Init engine
    const engine = new Engine();
    await engine.initialize();

    // Add canvas to page
    document.body.appendChild(engine.getCanvas());

    // Create a simple triangle
    const triangleGeometry = new Triangle(
        new Vector3(0, 0.5, 0),
        new Vector3(-0.5, -0.5, 0),
        new Vector3(0.5, -0.5, 0)
    );

    // ... Here I'd like to create a material:
    // triangleMaterial = new PhongMaterial();
    // ... Here I'd like to create a mesh
    // triangle = new Mesh(triangleGeometry, triangleMaterial);
}

main();