
import { Engine } from '/src/engine.js';
import { Plane } from '/src/core/geometry/plane.js';

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