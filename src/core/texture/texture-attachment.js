
import { Texture } from './texture.js';
import { Sampler } from './sampler.js';

/**
 * Describes a texture attachment that contains both a texture and sampler.
 */
class TextureAttachment
{
    #texture = null;
    #sampler = null;
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
     * Compiles the texture attachment by compiling the underlying resources.
     */
    compile(device)
    {
        if (this.#compiled) {
            return;
        }

        if (!this.#texture) {
            throw new Error(
                'Need to set a texture before compilation!'
            );
        }

        if (!this.#sampler) {
            throw new Error(
                'Need to set a sampler before compilation!'
            );
        }

        this.#texture.compile(device);
        this.#sampler.compile(device);

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
        if (this.#texture.isCompiled()) {
            this.#texture.destroy();
        }

        if (this.#sampler.isCompiled()) {
            this.#sampler.destroy();
        }

        this.#compiled = false;
    }
}

export {
    TextureAttachment
};