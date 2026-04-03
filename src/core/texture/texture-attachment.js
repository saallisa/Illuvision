
import { Texture } from './texture.js';
import { Sampler } from './sampler.js';

/**
 * Describes a texture attachment that contains both a texture and sampler.
 */
class TextureAttachment
{
    #texture = null;
    #sampler = null;

    #bindGroupLayout = null;
    #bindGroup = null;
    #compiled = false;

    constructor(texture, sampler)
    {
        Texture.validateInstance(texture);
        Sampler.validateInstance(sampler);

        this.#texture = texture;
        this.#sampler = sampler;
    }

    /**
     * Gets the texture associated with this attachment.
     */
    getTexture() {
        return this.#texture;
    }

    /**
     * Gets the sampler associated with this attachment.
     */
    getSampler() {
        return this.#sampler;
    }

    /**
     * Gets the bind group layout of this texture attachment.
     */
    getBindGroupLayout()
    {
        if (!this.#compiled) {
            throw new Error(
                'Texture attachment must be compiled before '
                + 'accessing bind group layout.'
            );
        }

        return this.#bindGroupLayout;
    }

    /**
     * Gets the bind group of this texture attachment.
     */
    getBindGroup()
    {
        if (!this.#compiled) {
            throw new Error(
                'Texture attachment must be compiled before '
                + 'accessing bind group.'
            );
        }

        return this.#bindGroup;
    }

    /**
     * Compiles the texture attachment by compiling the underlying resources.
     */
    compile(device)
    {
        if (this.#compiled) {
            return;
        }

        this.#texture.compile(device);
        this.#sampler.compile(device);
        this.#createBindGroup(device);

        this.#compiled = true;
    }

    /**
     * Returns if the texture attachment is compiled.
     */
    isCompiled() {
        return this.#compiled; 
    }

    /**
     * Destroys the WebGPU resources associated with this texture attachment.
     */
    destroy()
    {
        this.#bindGroupLayout = null;
        this.#bindGroup = null;

        this.#compiled = false;
    }

    /**
     * Creates the bind group for this texture and sampler combination.
     */
    #createBindGroup(device)
    {
        this.#bindGroupLayout = device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {},
            }, {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {},
            }]
        });

        this.#bindGroup = device.createBindGroup({
            layout: this.#bindGroupLayout,
            entries: [{
                binding: 0,
                resource: this.#sampler.getGpuSampler()
            }, {
                binding: 1,
                resource: this.#texture.getGpuTextureView()
            }]
        });
    }
}

export {
    TextureAttachment
};