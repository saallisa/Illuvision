
import * as VYXEN from '/src/vyxen.js';

/**
 * Render two rotating shapes onto the canvas.
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
    const sceneNode2 = new VYXEN.SceneNode(triangle);

    // Set the position relative to the origin
    sceneNode2.setPosition(new VYXEN.Vector3(-0.5, 0, 0));

    // Scale it by half
    sceneNode2.setScale(new VYXEN.Vector3(0.5, 0.5, 0.5));

    // Create the node to the scene
    scene.addNode(sceneNode2);

    // Create an orthographic camera
    const camera = new VYXEN.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    camera.setAspectRatio(engine.getAspectRatio());
    camera.setPosition(new VYXEN.Vector3(0, 0, -1));
    camera.setTarget(new VYXEN.Vector3(0, 0, 0));

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