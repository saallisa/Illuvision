
import * as IVE from '/src/illuvision.js';

/**
 * Render a spinning cube and a ground plane onto the canvas.
 * Use lambert material and ambient and directional light in this scene.
 * In this example, use a perspective camera.
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
    const groundGeometry = new IVE.Plane(10, 10, 2, 2);

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
    const boxMaterial = new IVE.LambertMaterial({
        colorMode: IVE.Material.VERTEX_COLOR
    });
    boxMaterial.setCullMode(IVE.Material.CULL_BACK);

    // Create a mesh from the geometry and material
    const box = new IVE.Mesh(boxGeometry, boxMaterial);

    // Create a second scene node for the box
    const sceneNode2 = new IVE.SceneNode(box);
    sceneNode2.setPosition(new IVE.Vector3(-1, 1, 1));

    // Create a material for a second box using COLOR_BLEND
    const box2material = new IVE.LambertMaterial({
        colorMode: IVE.Material.COLOR_BLEND,
        color: IVE.Color.WHITE,
        colorBlend: 0.25
    });
    box2material.setCullMode(IVE.Material.CULL_BACK);

    const box2 = new IVE.Mesh(boxGeometry, box2material);
    const sceneNode3 = new IVE.SceneNode(box2);
    sceneNode3.setPosition(new IVE.Vector3(1, 1, 1));

    // Create a material for a third box using the uniform color
    const box3material = new IVE.LambertMaterial({
        color: IVE.Color.BLUE
    });
    box3material.setCullMode(IVE.Material.CULL_BACK);

    const box3 = new IVE.Mesh(boxGeometry, box3material);
    const sceneNode4 = new IVE.SceneNode(box3);
    sceneNode4.setPosition(new IVE.Vector3(0, 1, -1));

    // Create directional light
    const directionalLight = new IVE.DirectionalLight(
        new IVE.Vector3(5, 10, 5),
        IVE.Color.WHITE,
        0.7
    );

    // Create ambient light
    const ambientLight = new IVE.AmbientLight(
        IVE.Color.WHITE,
        0.3
    );

    // Create a new Scene and add the nodes and the light to it
    const scene = new IVE.Scene();
    scene.addNode(sceneNode);
    scene.addNode(sceneNode2);
    scene.addNode(sceneNode3);
    scene.addNode(sceneNode4);
    scene.addDirectionalLight('sun', directionalLight);
    scene.addAmbientLight(ambientLight);

    // Create a perspective camera
    const camera = new IVE.PerspectiveCamera(45, 0.1, 100);
    camera.setAspectRatio(engine.getAspectRatio());
    camera.setTarget(new IVE.Vector3(0, 0, 0));
    camera.setPosition(new IVE.Vector3(10, 10, 10));

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

        sceneNode4.rotateX = sceneNode4.rotateX - 0.5;
        sceneNode4.rotateY = sceneNode4.rotateY + 0.5;
        sceneNode4.rotateZ = sceneNode4.rotateZ - 0.5;

        engine.render(scene, camera);
    }

    // Set the animation loop
    engine.setAnimationLoop(animation);
}

main();