
import { Engine } from '../../engine.js';
import { UniformBuffer } from '../buffer/uniform-buffer.js';

/**
 * Camera class for managing camera properties and transformations.
 */
class Camera
{
    #aspectRatio = 1;
    #uniformBuffer = null;
    #bindGroupLayout = null;
    #bindGroup = null;
    #compiled = false;

    constructor()
    {
        if (this.constructor === Camera) {
            throw new Error('Camera cannot be instantiated directly.');
        }

        this.#uniformBuffer = new UniformBuffer();
    }

    /**
     * Set the aspect ratio of the window.
     */
    setAspectRatio(aspectRatio)
    {
        if (typeof aspectRatio !== 'number' || aspectRatio <= 0) {
            throw new Error('Aspect ratio must be a positive number.');
        }

        this.#aspectRatio = aspectRatio;
    }

    /**
     * Returns the current aspect ratio of the camera.
     */
    getAspectRatio() {
        return this.#aspectRatio;
    }

    /**
     * Returns the projection matrix for the camera.
     * This is a placeholder method and should be implemented in subclasses.
     */
    getProjectionMatrix()
    {
        throw new Error(
            'getProjectionMatrix must be implemented in subclasses.'
        );
    }

    /**
     * Retrieve the uniform buffer.
     */
    getUniformBuffer()
    {
        if (!this.#compiled) {
            throw new Error(
                'Camera must be compiled before accessing uniform buffer!'
            );
        }

        return this.#uniformBuffer;
    }

    /**
     * Gets the bind group layout of this camera.
     */
    getBindGroupLayout()
    {
        if (!this.#compiled) {
            throw new Error(
                'Camera must be compiled before accessing bind group layout.'
            );
        }

        return this.#bindGroupLayout;
    }

    /**
     * Gets the bind group of this camera.
     */
    getBindGroup()
    {
        if (!this.#compiled) {
            throw new Error(
                'Camera must be compiled before accessing bind group.'
            );
        }

        return this.#bindGroup;
    }

    /**
     * Compiles the camera's uniform buffer.
     */
    compile(device)
    {
        Engine.validateDevice(device);

        this.#uniformBuffer.setUniform(
            'matrix', this.getProjectionMatrix().toArray(), 'mat4x4<f32>'
        );

        this.#uniformBuffer.compile(device);
        this.#createBindGroup(device);
        this.#compiled = true;
    }

    /**
     * Returns if the camera is compiled.
     */
    isCompiled() {
        return this.#compiled;
    }

    /**
     * Creates the bind group for the camera.
     */
    #createBindGroup(device)
    {
        this.#bindGroupLayout = device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {},
            }]
        });

        this.#bindGroup = device.createBindGroup({
            label: 'camera',
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
    Camera
};