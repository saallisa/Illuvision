
import { AmbientLight } from './light/ambient-light.js';
import { Engine } from '../engine.js';
import { SceneNode } from './scene-node.js';
import { UniformBuffer } from './buffer/uniform-buffer.js';
import { Color } from './color.js';

/**
 * Manages the camera and objects in a scene.
 */
class Scene
{
    #nodes = [];
    #ambientLights = [];

    #uniformBuffer = null;
    #bindGroupLayout = null;
    #bindGroup = null;
    #compiled = false;

    constructor() {
        this.#uniformBuffer = new UniformBuffer();
    }

    /**
     * Adds a scene node to the scene.
     */
    addNode(node)
    {
        if (!(node instanceof SceneNode)) {
            throw new TypeError('Node must be an instance of SceneNode.');
        }

        this.#nodes.push(node);
    }

    /**
     * Gets all nodes as an array.
     */
    getNodes() {
        return this.#nodes;
    }

    /**
     * Adds a light to the scene.
     */
    addAmbientLight(light)
    {
        if (!(light instanceof AmbientLight)) {
            throw new TypeError('Light must be an instance of AmbientLight.');
        }

        this.#ambientLights.push(light);
    }

    /**
     * Gets the ambient lights visible in this scene.
     */
    getAmbientLights() {
        return this.#ambientLights;
    }

    /**
     * Retrieve the uniform buffer.
     */
    getUniformBuffer()
    {
        if (!this.#compiled) {
            throw new Error(
                'Scene must be compiled before accessing uniform buffer!'
            );
        }

        return this.#uniformBuffer;
    }

    /**
     * Gets the bind group layout of this scene.
     */
    getBindGroupLayout()
    {
        if (!this.#compiled) {
            throw new Error(
                'Scene must be compiled before accessing bind group layout.'
            );
        }

        return this.#bindGroupLayout;
    }

    /**
     * Gets the bind group of this scene.
     */
    getBindGroup()
    {
        if (!this.#compiled) {
            throw new Error(
                'Scene must be compiled before accessing bind group.'
            );
        }

        return this.#bindGroup;
    }

    /**
     * Gets the compilation status.
     */
    isCompiled() {
        return this.#compiled;
    }

    /**
     * Compiles the scene.
     */
    async compile(device)
    {
        if (this.#compiled) {
            return;
        }

        Engine.validateDevice(device);

        this.#fillUniformBuffer();
        this.#uniformBuffer.compile(device);
        this.#createBindGroup(device);

        // Compile all nodes
        for (const node of this.#nodes) {
            await node.compile(device);
        }

        this.#compiled = true;
    }

    /**
     * Destroys WebGPU resources associated with this scene.
     */
    destroy()
    {
        // Destroy all nodes
        for (const node of this.#nodes) {
            node.destroy();
        }

        if (this.#uniformBuffer.isCompiled()) {
            this.#uniformBuffer.destroy();
        }

        this.#bindGroup = null;
        this.#bindGroupLayout = null;

        this.#compiled = false;
    }

    /**
     * Fills the uniform buffer with the scene data.
     */
    #fillUniformBuffer()
    {
        if (this.#ambientLights.length === 0) {
            return;
        }

        const ambient = this.#createAccumulatedAmbientLight();

        this.#uniformBuffer.setUniform(
            'ambient_color',
            ambient.color.toRgbArray(),
            'vec3<f32>'
        );

        this.#uniformBuffer.setUniform(
            'ambient_intensity',
            ambient.intensity,
            'f32'
        );
    }

    /**
     * Creates a new ambient that combines all the ambient lights in the scene
     * into one ambient light.
     */
    #createAccumulatedAmbientLight()
    {
        let intensity = 0;
        const colors = [];
        const weights = [];

        // Get total intensity and all lights
        for (const light of this.#ambientLights) {
            colors.push(light.color);
            intensity += light.intensity;
        }

        // Calculate weights for multi-lerp
        for (const light of this.#ambientLights) {
            weights.push(light.intensity / intensity);
        }

        // Interpolates
        return new AmbientLight(
            Color.multiLerp(colors, weights),
            intensity
        );
    }

    /**
     * Creates the bind group layout.
     */
    #createBindGroup(device)
    {
        this.#bindGroupLayout = device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {},
            }]
        });

        this.#bindGroup = device.createBindGroup({
            label: 'lights',
            layout: this.#bindGroupLayout,
            entries: [{
                binding: 0,
                resource: {
                    buffer: this.#uniformBuffer.getUniformBuffer()
                }
            }]
        });
    }
}

export {
    Scene
};