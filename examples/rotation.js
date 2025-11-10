
import * as IVE from '/src/illuvision.js';

/**
 * Render two rotating shapes onto the canvas.
 */
async function main()
{
    // Configure engine
    const baseUrl = new URL(window.location.href);
    IVE.Engine.setRootPath(baseUrl.origin + '/src/');

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

    // Create a simple triangle
    const triangleGeometry = new IVE.Triangle(
        new IVE.Vector3(0, 0.5, 0),
        new IVE.Vector3(-0.5, -0.5, 0),
        new IVE.Vector3(0.5, -0.5, 0)
    );

    // Define the material to use
    const triangleMaterial = new IVE.BasicMaterial({
        color: IVE.Color.MAGENTA
    });

    // Create a mesh from the geometry and material
    const triangle = new IVE.Mesh(triangleGeometry, triangleMaterial);

    // Create a scene node
    const sceneNode2 = new IVE.SceneNode(triangle);

    // Set the position relative to the origin
    sceneNode2.setPosition(new IVE.Vector3(-0.5, 0, 0));

    // Scale it by half
    sceneNode2.setScale(new IVE.Vector3(0.5, 0.5, 0.5));

    // Create the node to the scene
    scene.addNode(sceneNode2);

    // Create an orthographic camera
    const camera = new IVE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    camera.setAspectRatio(engine.getAspectRatio());
    camera.setPosition(new IVE.Vector3(0, 0, -1));
    camera.setTarget(new IVE.Vector3(0, 0, 0));

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