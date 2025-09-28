
import * as VYXEN from '/src/vyxen.js';

/**
 * Render a plane onto the canvas.
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

    // Create a simple plane
    const planeGeometry = new VYXEN.Plane(1, 1, 1, 1);

    // Define the material to use
    const planeMaterial = await VYXEN.BasicMaterial.init({
        color: VYXEN.Color.RED
    });

    // Create a mesh from the geometry and material
    const plane = new VYXEN.Mesh(planeGeometry, planeMaterial);

    // Create a scene node
    const sceneNode = new VYXEN.SceneNode(plane);

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