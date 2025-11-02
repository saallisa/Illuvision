
import * as IVE from '/src/illuvision.js';

/**
 * Render a spinning cube and a ground plane onto the canvas.
 * In this example, use a perspective camera.
 */
async function main()
{
    // Configure engine
    const baseUrl = new URL(window.location.href);
    IVE.Engine.setRootPath(baseUrl.origin + '/src/');

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
    sceneNode.setPosition(new IVE.Vector3(0, 0, 0));

    // Rotate the scene node so that it covers the ground
    sceneNode.rotateX = 90;

    // Create a simple box
    const boxGeometry = new IVE.Box(1, 1, 1);
    boxGeometry.setFaceColors(
        IVE.Color.BLUE,
        IVE.Color.LIME,
        IVE.Color.YELLOW,
        IVE.Color.RED,
        IVE.Color.WHITE,
        IVE.Color.BLACK
    );

    // Define the material to use
    const boxMaterial = new IVE.BasicMaterial({
        colorMode: IVE.BasicMaterial.VERTEX_COLOR
    });

    // Create a mesh from the geometry and material
    const box = new IVE.Mesh(boxGeometry, boxMaterial);

    // Create a second scene node for the box
    const sceneNode2 = new IVE.SceneNode(box);
    sceneNode2.setPosition(new IVE.Vector3(-1, 1, 0));

    // Create a material for a second box using COLOR_BLEND
    const box2material = new IVE.BasicMaterial({
        colorMode: IVE.BasicMaterial.COLOR_BLEND,
        color: IVE.Color.WHITE,
        colorBlend: 0.25
    });

    const box2 = new IVE.Mesh(boxGeometry, box2material);
    const sceneNode3 = new IVE.SceneNode(box2);
    sceneNode3.setPosition(new IVE.Vector3(1, 1, 0));

    // Create a new Scene and add the node to it
    const scene = new IVE.Scene();
    scene.addNode(sceneNode);
    scene.addNode(sceneNode2);
    scene.addNode(sceneNode3);

    // Create a perspective camera
    const camera = new IVE.PerspectiveCamera(45, 0.1, 100);
    camera.setAspectRatio(engine.getAspectRatio());
    camera.setTarget(new IVE.Vector3(0, 0, 0));
    camera.setPosition(new IVE.Vector3(5, 5, 5));

    // Create the function for the animation loop 
    const animation = function ()
    {
        // Rotate the cube
        sceneNode2.rotateX = sceneNode2.rotateX + 0.5;
        sceneNode2.rotateY = sceneNode2.rotateY + 0.5;
        sceneNode2.rotateZ = sceneNode2.rotateZ + 0.5;

        sceneNode3.rotateX = sceneNode3.rotateX - 0.5;
        sceneNode3.rotateY = sceneNode3.rotateY - 0.5;
        sceneNode3.rotateZ = sceneNode3.rotateZ - 0.5;

        engine.render(scene, camera);
    }

    // Set the animation loop
    engine.setAnimationLoop(animation);
}

main();