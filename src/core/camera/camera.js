
import { Engine } from '../../engine.js';
import { UniformBuffer } from '../buffer/uniform-buffer.js';
import { Matrix4 } from '../matrix4.js';
import { Vector3 } from '../vector3.js';

/**
 * Camera class for managing camera properties and transformations.
 */
class Camera
{
    #aspectRatio = 1;
    #position = null;
    #target = null;
    #up = null;

    #uniformBuffer = null;
    #bindGroupLayout = null;
    #bindGroup = null;
    #compiled = false;

    constructor()
    {
        if (this.constructor === Camera) {
            throw new Error('Camera cannot be instantiated directly.');
        }

        this.#position = new Vector3(5, 5, 5);
        this.#target = new Vector3(0, 0, 0);
        this.#up = new Vector3(0, 1, 0);

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
     * Set the position of the camera in the world.
     */
    setPosition(position)
    {
        Vector3.validateInstance(position);
        this.#position = position;
    }

    /**
     * Returns the current position of the camera.
     */
    getPosition() {
        return this.#position;
    }

    /**
     * Set the target of the camera in the world.
     */
    setTarget(target)
    {
        Vector3.validateInstance(target);
        this.#target = target;
    }

    /**
     * Returns the current target of the camera.
     */
    getTarget() {
        return this.#target;
    }

    /**
     * Returns the view matrix for the camera.
     */
    getViewMatrix() {
        return Matrix4.createLookAt(this.#position, this.#target, this.#up);
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
        if (this.#compiled) {
            return;
        }

        Engine.validateDevice(device);

        this.#uniformBuffer.setUniform(
            'projection', this.getProjectionMatrix().toArray(), 'mat4x4<f32>'
        );
        this.#uniformBuffer.setUniform(
            'view', this.getViewMatrix().toArray(), 'mat4x4<f32>'
        );

        this.#uniformBuffer.compile(device);
        this.#createBindGroup(device);
        this.#compiled = true;
    }

    /**
     * Updates the camera's uniform buffer with the current values.
     */
    update(device)
    {
        if (!this.#compiled) {
            throw new Error(
                'Camera must be compiled before updating uniform buffer!'
            );
        }
        
        this.#uniformBuffer.setUniform(
            'projection', this.getProjectionMatrix().toArray(), 'mat4x4<f32>'
        );
        this.#uniformBuffer.setUniform(
            'view', this.getViewMatrix().toArray(), 'mat4x4<f32>'
        );
        this.#uniformBuffer.updateUniformBuffer(device);
    }

    /**
     * Returns if the camera is compiled.
     */
    isCompiled() {
        return this.#compiled;
    }

    /**
     * Destroys WebGPU resources associated with this camera.
     */
    destroy()
    {
        if (this.#uniformBuffer.isCompiled()) {
            this.#uniformBuffer.destroy();
        }

        this.#bindGroup = null;
        this.#bindGroupLayout = null;

        this.#compiled = false;
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