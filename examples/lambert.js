
import * as VYXEN from '/src/vyxen.js';

/**
 * Render a spinning cube and a ground plane onto the canvas.
 * Use lambert material and ambient and directional light in this scene.
 * In this example, use a perspective camera.
 */
async function main()
{
    // Configure engine
    const baseUrl = new URL(window.location.href);
    VYXEN.Engine.setRootPath(baseUrl.origin + '/src/');

    // Init engine
    const engine = new VYXEN.Engine();
    engine.setSizeToWindow();
    engine.setClearColor(VYXEN.Color.fromHex('87ceeb')); // sky blue
    await engine.initialize();

    // Add canvas to page
    document.body.appendChild(engine.getCanvas());

    // Create a simple ground plane
    const groundGeometry = new VYXEN.Plane(5, 5, 1, 1);

    // Define the material to use
    const groundMaterial = await VYXEN.BasicMaterial.init({
        color: VYXEN.Color.GREEN
    });

    // Create a mesh from the geometry and material
    const ground = new VYXEN.Mesh(groundGeometry, groundMaterial);

    // Create a scene node for the ground
    const sceneNode = new VYXEN.SceneNode(ground);
    sceneNode.setPosition(new VYXEN.Vector3(0, 0, 0));

    // Rotate the scene node so that it covers the ground
    sceneNode.rotateX = 90;

    // Create a simple box
    const boxGeometry = new VYXEN.Box(1, 1, 1);

    // Define the material to use
    const boxMaterial = await VYXEN.LambertMaterial.init({
        color: VYXEN.Color.BLUE
    });

    // Create a mesh from the geometry and material
    const box = new VYXEN.Mesh(boxGeometry, boxMaterial);

    // Create a second scene node for the box
    const sceneNode2 = new VYXEN.SceneNode(box);
    sceneNode2.setPosition(new VYXEN.Vector3(0, 1, 0));

    // Create directional light
    const directionalLight = new VYXEN.DirectionalLight(
        new VYXEN.Vector3(5, 10, 5),
        VYXEN.Color.WHITE,
        0.7
    );

    // Create a new Scene and add the nodes and lights to it
    const scene = new VYXEN.Scene();
    scene.addNode(sceneNode);
    scene.addNode(sceneNode2);
    scene.addDirectionalLight('sun', directionalLight);

    // Create a perspective camera
    const camera = new VYXEN.PerspectiveCamera(45, 0.1, 100);
    camera.setAspectRatio(engine.getAspectRatio());
    camera.setTarget(new VYXEN.Vector3(0, 0, 0));
    camera.setPosition(new VYXEN.Vector3(5, 5, 5));

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
}

main();