
import { Engine } from '../../engine.js';

/**
 * Manages WebGPU texture buffers for storing texture data.
 */
class TextureBuffer
{
    #textureWidth = 0;
    #textureHeight = 0;
    #textureData = null;

    #compiled = false;
    #textureBuffer = null;

    constructor(width, height, data)
    {
        this.#textureWidth = width;
        this.#textureHeight = height;
        this.#textureData = data;
    }

    /**
     * Gets the width of the texture.
     */
    getTextureWidth() {
        return this.#textureWidth;
    }

    /**
     * Gets the height of the texture.
     */
    getTextureHeight() {
        return this.#textureHeight;
    }

    /**
     * Gets the raw texture data as an Uint8Array.
     */
    getTextureData() {
        return this.#textureData;
    }

    /**
     * Gets the GPU texture buffer.
     */
    getGpuTextureBuffer()
    {
        if (!this.#compiled) {
             throw new Error(
                'Texture must be compiled before accessing texture buffer!'
            );
        }

        return this.#textureBuffer;
    }

    /**
     * Returns if the texture buffer is compiled.
     */
    isCompiled() {
        return this.#compiled;
    }

    /**
     * Compiles the texture into a WebGPU texture buffer.
     */
    compile(device)
    {
        if (this.#compiled) {
            return;
        }

        Engine.validateDevice(device);
        this.#createTexture(device);
        this.#compiled = true;
    }

    /**
     * Destroys the texture buffer and releases GPU resources.
     */
    destroy()
    {
        if (this.#textureBuffer) {
            this.#textureBuffer.destroy();
            this.#textureBuffer = null;
        }

        this.#compiled = false;
    }

    /**
     * Creates a texture buffer with the specified width and height.
     */
    #createTexture(device)
    {
        // Create the texture buffer
        this.#textureBuffer =device.createTexture({
            size: [this.#textureWidth, this.#textureHeight],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        });

        // Write initial data if available
        if (this.#textureData.byteLength > 0) {
            device.queue.writeTexture(this.#textureBuffer, this.#textureData, {
                bytesPerRow: this.#textureWidth * 4,
                rowsPerImage: this.#textureHeight
            }, {
                width: this.#textureWidth,
                height: this.#textureHeight
            });
        }
    }
}

export {
    TextureBuffer
};