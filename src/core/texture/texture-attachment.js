
import { Texture } from './texture.js';

/**
 * Describes a texture attachment that contains both a texture and sampler.
 */
class TextureAttachment
{
    #texture = null;
    #compiled = false;

    constructor(texture)
    {
        Texture.validateInstance(texture);

        this.#texture = texture;
    }

    /**
     * Gets the texture associated with this attachment.
     */
    getTexture() {
        return this.#texture;
    }

    /**
     * Compiles the texture attachment by compiling the underlying ressources.
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

        this.#texture.compile(device);
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

        this.#compiled = false;
    }
}

export {
    TextureAttachment
};