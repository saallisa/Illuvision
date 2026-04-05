
import * as IVE from '/src/illuvision.js';

/**
 * Very simple terrain generation.
 */
function terrain(x, y)
{
    const n = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 10;
    const m = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 20;

    return n + m;
}

/**
 * Render a modified ground plane onto the canvas.
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
    const groundGeometry = new IVE.Plane(500, 500, 250, 250);

    const vertCount = groundGeometry.getVertexCount();
    const positions = groundGeometry.getVertices();

    for (var i = 0; i < vertCount; i++) {
        positions[i].z = terrain(positions[i].x, positions[i].y) / 5;
    }

    groundGeometry.calculateFaceNormals();
    groundGeometry.calculateVertexNormals();

    // Create a simple raw pixel texture
    const _ = IVE.Color.lerp(IVE.Color.fromHex('89a334'), IVE.Color.BLACK, 0.3).toIntArray();
    const b = IVE.Color.fromHex('89a334').toIntArray();
    const y = IVE.Color.fromHex('ddcbb7').toIntArray();

    const textureData = new Uint8Array([
        b, _, b, _, y,
        _, y, y, _, _,
        _, _, _, y, _,
        _, y, b, _, _,
        _, y, _, _, b,
    ].flat());

    const texture = new IVE.Texture(5, 5, textureData);

    // Create a standard sampler to use with the texture
    const sampler = new IVE.Sampler({
        magFilter: IVE.Sampler.LINEAR,
        minFilter: IVE.Sampler.LINEAR
    });
    const textureAttachment = new IVE.TextureAttachment(texture, sampler);

    // Define the ground material
    const groundMaterial = new IVE.LambertMaterial({
        colorMode: IVE.Material.TEXTURE_RAW
    });
    groundMaterial.setTextureAttachment(textureAttachment);
    groundMaterial.setUseTexture(true);

    // Create a mesh from the geometry and material
    const ground = new IVE.Mesh(groundGeometry, groundMaterial);

    // Create a scene node for the ground
    const sceneNode = new IVE.SceneNode(ground);

    // Create a water geometry
    const waterGeometry = new IVE.Plane(500, 500, 1, 1);

    // Create a water material
    const waterMaterial = new IVE.BasicMaterial({
        color: new IVE.Color(0.5, 0.5, 1, 0.35)
    });

    // Create a water mesh from the geometry and the material
    const water = new IVE.Mesh(waterGeometry, waterMaterial);

    // Create a scene node for the water
    const sceneNode2 = new IVE.SceneNode(water);
    sceneNode2.setPosition(new IVE.Vector3(0, -0.25, 0));

    // Rotate the scene nodes so that it covers the ground
    sceneNode.rotateX = -90;
    sceneNode2.rotateX = -90;

    // Create directional light
    const directionalLight = new IVE.DirectionalLight(
        new IVE.Vector3(10, 10, 10),
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
    const camera = new IVE.PerspectiveCamera(45, 0.1, 1000);
    camera.setAspectRatio(engine.getAspectRatio());
    camera.setTarget(new IVE.Vector3(0, 10, 0));
    camera.setPosition(new IVE.Vector3(30, 20, 25));

    // Create camera controller
    const camController = new IVE.StandardController(camera);
    camController.start();
    engine.getCanvas().onclick = function () {
        camController.pointerLock(engine);
    }

    // Animation speed
    const timer = new IVE.Timer();

    // Create performance monitor
    const perfMonitor = new IVE.Utils.PerformanceMonitor(timer);
    document.body.appendChild(perfMonitor.getContainer());

    // Create the function for the animation loop 
    const animation = function ()
    {
        // Update timer
        timer.update();

        // Move camera according to keyboard and mouse input.
        camController.update(timer);
        
        // Update performance monitor
        perfMonitor.update();

        // Render scene
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