
import { Engine } from '/src/engine.js';
import { Plane } from '/src/core/geometry/plane.js';

/**
 * Render a plane onto the canvas.
 */
async function main()
{
    // Init engine
    const engine = new Engine();
    await engine.initialize();

    // Add canvas to page
    document.body.appendChild(engine.getCanvas());

    // Create a simple plane
    const planeGeometry = new Plane(1, 1, 1, 1);
    // ... Here I'd like to create a material:
    // planeMaterial = new PhongMaterial();
    // ... Here I'd like to create a mesh
    // plane = new Mesh(planeGeometry, planeMaterial);
}

main();