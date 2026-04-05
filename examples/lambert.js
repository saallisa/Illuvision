
import * as IVE from '/src/illuvision.js';

/**
 * Creates a scene node with a single mesh, material and position and
 * returns the new scene node.
 */
function createSceneNode(geometry, material, position)
{
    const mesh = new IVE.Mesh(geometry, material);
    const node = new IVE.SceneNode(mesh);
    node.setPosition(position);
    return node;
}

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

    // Define the material to use for the ground
    const groundMaterial = new IVE.BasicMaterial({
        colorMode: IVE.Material.UNIFORM_COLOR,
        color: IVE.Color.GREEN
    });
    
    // Create a scene node with the ground
    const ground = createSceneNode(
        groundGeometry,
        groundMaterial,
        new IVE.Vector3(0, 0, 0)
    );

    // Rotate the ground so that it sits horizontally
    ground.rotateX = 90;

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

    // Define a material that uses the vertex colors
    const vertexMaterial = new IVE.LambertMaterial({
        colorMode: IVE.Material.VERTEX_COLOR
    });
    vertexMaterial.setCullMode(IVE.Material.CULL_BACK);

    // Define a material that uses a blend between uniform and vertex colors
    const blendMaterial = new IVE.LambertMaterial({
        colorMode: IVE.Material.COLOR_BLEND,
        color: IVE.Color.WHITE,
        colorBlend: 0.25
    });
    blendMaterial.setCullMode(IVE.Material.CULL_BACK);

    // Create a material that uses the uniform colors
    const uniformMaterial = new IVE.LambertMaterial({
        color: IVE.Color.BLUE
    });
    uniformMaterial.setCullMode(IVE.Material.CULL_BACK);

    // Create colors to use in a raw pixel texture
    const _ = IVE.Color.YELLOW.toIntArray();
    const b = IVE.Color.lerp(IVE.Color.RED, IVE.Color.YELLOW, 0.7).toIntArray();
    const y = IVE.Color.lerp(IVE.Color.GREEN, IVE.Color.YELLOW, 0.8).toIntArray();

    // Create the raw pixel texture data
    const textureData = new Uint8Array([
        b, _, _, _, _,
        _, y, y, y, _,
        _, y, _, _, _,
        _, y, y, _, _,
        _, y, _, _, _,
    ].flat());

    // Create a raw pixel texture
    const texture = new IVE.Texture(5, 5, textureData);
    const sampler = new IVE.Sampler();
    const textureAttachment = new IVE.TextureAttachment(texture, sampler);

    // Create a material that uses the texture
    const textureMaterial = new IVE.LambertMaterial({
        colorMode: IVE.Material.TEXTURE_RAW
    });
    textureMaterial.setTextureAttachment(textureAttachment);
    textureMaterial.setUseTexture(true);
    textureMaterial.setCullMode(IVE.Material.CULL_BACK);
    
    // Create for boxes for each material
    const vertexColorBox = createSceneNode(
        boxGeometry,
        vertexMaterial,
        new IVE.Vector3(-1, 1, 1)
    );

    const uniformColorBox = createSceneNode(
        boxGeometry,
        uniformMaterial,
        new IVE.Vector3(-1, 1, -1)
    );

    const blendColorBox = createSceneNode(
        boxGeometry,
        blendMaterial,
        new IVE.Vector3(1, 1, -1)
    );

    const textureBox = createSceneNode(
        boxGeometry,
        textureMaterial,
        new IVE.Vector3(1, 1, 1)
    );

    // Create a new Scene and add the nodes to it
    const scene = new IVE.Scene();
    scene.addNode(ground);
    scene.addNode(vertexColorBox);
    scene.addNode(uniformColorBox);
    scene.addNode(blendColorBox);
    scene.addNode(textureBox);

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
    
    // Add the lights to the scene
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
        vertexColorBox.rotateX = vertexColorBox.rotateX + 0.5;
        vertexColorBox.rotateY = vertexColorBox.rotateY + 0.5;
        vertexColorBox.rotateZ = vertexColorBox.rotateZ + 0.5;

        uniformColorBox.rotateX = uniformColorBox.rotateX - 0.5;
        uniformColorBox.rotateY = uniformColorBox.rotateY - 0.5;
        uniformColorBox.rotateZ = uniformColorBox.rotateZ - 0.5;

        blendColorBox.rotateX = blendColorBox.rotateX - 0.5;
        blendColorBox.rotateY = blendColorBox.rotateY + 0.5;
        blendColorBox.rotateZ = blendColorBox.rotateZ - 0.5;

        textureBox.rotateX = textureBox.rotateX + 0.5;
        textureBox.rotateY = textureBox.rotateY - 0.5;
        textureBox.rotateZ = textureBox.rotateZ + 0.5;

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