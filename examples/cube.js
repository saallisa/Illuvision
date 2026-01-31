
import * as IVE from '/src/illuvision.js';

/**
 * Render a plane and a spinning cube onto the canvas.
 */
async function main()
{
    // Init engine
    const engine = new IVE.Engine();
    engine.setSizeToWindow();
    engine.setClearColor(IVE.Color.fromHex('87ceeb')); // sky blue
    await engine.initialize();

    // Add canvas to page
    document.body.appendChild(engine.getCanvas());

    // Create a simple ground plane
    const groundGeometry = new IVE.Plane(5, 5, 1, 1);

    // Define the material to use
    const groundMaterial = new IVE.BasicMaterial({
        color: IVE.Color.GREEN
    });

    // Create a mesh from the geometry and material
    const ground = new IVE.Mesh(groundGeometry, groundMaterial);

    // Create a scene node for the ground
    const sceneNode = new IVE.SceneNode(ground);

    // Rotate the scene node so that it covers the ground
    sceneNode.rotateX = 90;

    // Create a simple box
    const boxGeometry = new IVE.Box(0.5, 0.5, 0.5);

    // Define the material to use
    const boxMaterial = new IVE.BasicMaterial({
        color: IVE.Color.BLUE
    });

    // Create a mesh from the geometry and material
    const box = new IVE.Mesh(boxGeometry, boxMaterial);

    // Create a second scene node for the box
    const sceneNode2 = new IVE.SceneNode(box);
    sceneNode2.setPosition(new IVE.Vector3(0, 0.5, 0));

    // Create a new Scene and add the node to it
    const scene = new IVE.Scene();
    scene.addNode(sceneNode);
    scene.addNode(sceneNode2);

    // Create an orthographic camera
    const camera = new IVE.OrthographicCamera(-1, 1, 1, -1, 0, 20);
    camera.setAspectRatio(engine.getAspectRatio());
    camera.setTarget(new IVE.Vector3(0, 0, 0));
    camera.setPosition(new IVE.Vector3(10, 5, 10));

    // Create the function for the animation loop 
    const animation = function ()
    {
        // Rotate the cube
        sceneNode2.rotateX = sceneNode2.rotateX + 0.5;
        sceneNode2.rotateY = sceneNode2.rotateY + 0.5;
        sceneNode2.rotateZ = sceneNode2.rotateZ + 0.5;

        engine.render(scene, camera);
    }

    // Set the animation loop
    engine.setAnimationLoop(animation);

    // Add resize events
    window.addEventListener('resize', function () {
        engine.setSizeToWindow();
        camera.setAspectRatio(engine.getAspectRatio());
    });
}

main();