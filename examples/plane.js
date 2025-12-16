
import * as IVE from '/src/illuvision.js';

/**
 * Render a plane onto the canvas.
 */
async function main()
{
    // Init engine
    const engine = new IVE.Engine();
    engine.setSizeToWindow();
    engine.setClearColor(IVE.Color.GREY);
    await engine.initialize();

    // Add canvas to page
    document.body.appendChild(engine.getCanvas());

    // Create a simple plane
    const planeGeometry = new IVE.Plane(1, 1, 1, 1);

    // Define the material to use
    const planeMaterial = new IVE.BasicMaterial({
        color: IVE.Color.RED
    });

    // Create a mesh from the geometry and material
    const plane = new IVE.Mesh(planeGeometry, planeMaterial);

    // Create a scene node
    const sceneNode = new IVE.SceneNode(plane);

    // Set the position relative to the origin
    sceneNode.setPosition(new IVE.Vector3(0.5, 0, 0));

    // Scale it by half
    sceneNode.setScale(new IVE.Vector3(0.5, 0.5, 0.5));

    // Create a new Scene and add the node to it
    const scene = new IVE.Scene();
    scene.addNode(sceneNode);

    // Create an orthographic camera
    const camera = new IVE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    camera.setAspectRatio(engine.getAspectRatio());
    camera.setPosition(new IVE.Vector3(0, 0, -1));
    camera.setTarget(new IVE.Vector3(0, 0, 0));

    await engine.render(scene, camera);
}

main();