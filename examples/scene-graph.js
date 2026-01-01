
import * as IVE from '/src/illuvision.js';

/**
 * Render a spinning node made of cubes and a ground plane onto the canvas.
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
    sceneNode2.setPosition(new IVE.Vector3(0, 3, 0));

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
    sceneNode4.setPosition(new IVE.Vector3(1, 1, -1));

    sceneNode2.addChild(sceneNode3);
    sceneNode2.addChild(sceneNode4);

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
    scene.addDirectionalLight('sun', directionalLight);
    scene.addAmbientLight(ambientLight);

    // Create a perspective camera
    const camera = new IVE.PerspectiveCamera(45, 0.1, 100);
    camera.setAspectRatio(engine.getAspectRatio());
    camera.setTarget(new IVE.Vector3(0, 0, 0));
    camera.setPosition(new IVE.Vector3(10, 10, 10));

    const timer = new IVE.Timer();
    const rotationSpeed = 15; // 15 degrees per second

    // Create the function for the animation loop 
    const animation = function ()
    {
        // Update timer
        timer.update();

        // Use delta time for frame-rate independent rotation
        const deltaRotation = rotationSpeed * timer.getDeltaTime();

        // Rotate the scene node
        sceneNode2.rotateX = sceneNode2.rotateX + deltaRotation;
        sceneNode2.rotateY = sceneNode2.rotateY + deltaRotation;
        sceneNode2.rotateZ = sceneNode2.rotateZ + deltaRotation;

        engine.render(scene, camera);
    }

    // Set the animation loop
    engine.setAnimationLoop(animation);
}

main();