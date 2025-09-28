
import * as VYXEN from '/src/vyxen.js';

/**
 * Render a triangle onto the canvas.
 */
async function main()
{
    // Configure engine
    const baseUrl = new URL(window.location.href);
    VYXEN.Engine.setRootPath(baseUrl.origin + '/src/');

    // Init engine
    const engine = new VYXEN.Engine();
    engine.setSizeToWindow();
    engine.setClearColor(VYXEN.Color.GREY);
    await engine.initialize();

    // Add canvas to page
    document.body.appendChild(engine.getCanvas());

    // Create a simple triangle
    const triangleGeometry = new VYXEN.Triangle(
        new VYXEN.Vector3(0, 0.5, 0),
        new VYXEN.Vector3(-0.5, -0.5, 0),
        new VYXEN.Vector3(0.5, -0.5, 0)
    );

    // Define the material to use
    const triangleMaterial = await VYXEN.BasicMaterial.init({
        color: VYXEN.Color.MAGENTA
    });

    // Create a mesh from the geometry and material
    const triangle = new VYXEN.Mesh(triangleGeometry, triangleMaterial);

    // Create a scene node
    const sceneNode = new VYXEN.SceneNode(triangle);

    // Set the position relative to the origin
    sceneNode.setPosition(new VYXEN.Vector3(0.5, 0, 0));

    // Scale it by half
    sceneNode.setScale(new VYXEN.Vector3(0.5, 0.5, 0.5));

    // Create a new Scene and add the node to it
    const scene = new VYXEN.Scene();
    scene.addNode(sceneNode);

    // Create an orthographic camera
    const camera = new VYXEN.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    camera.setAspectRatio(engine.getAspectRatio());
    camera.setPosition(new VYXEN.Vector3(0, 0, -1));
    camera.setTarget(new VYXEN.Vector3(0, 0, 0));

    await engine.render(scene, camera);
}

main();