
import { Engine } from '../../engine.js';

/**
 * Manages WebGPU samplers for storing sampler configuration.
 */
class Sampler
{
    #addressModeU = null;
    #addressModeV = null;
    #magFilter = null;
    #minFilter = null;

    #compiled = false;
    #sampler = null;

    constructor(settings = {})
    {
        // Set address modes
        this.addressModeU = settings.addressModeU ?? Sampler.CLAMP_TO_EDGE;
        this.addressModeV = settings.addressModeV ?? Sampler.CLAMP_TO_EDGE;

        // Set the filter settings
        this.magFilter = settings.magFilter ?? Sampler.NEAREST;
        this.minFilter = settings.minFilter ?? Sampler.NEAREST;
    }

    /**
     * Returns the address mode U setting.
     */
    get addressModeU() {
        return this.#addressModeU;
    }

    /**
     * Sets the address mode U setting.
     */
    set addressModeU(addressModeU)
    {
        this.#validateAddressMode(addressModeU);
        this.#addressModeU = addressModeU;
    }

    /**
     * Returns the address mode V setting.
     */
    get addressModeV() {
        return this.#addressModeV;
    }

    /**
     * Sets the address mode V setting.
     */
    set addressModeV(addressModeV)
    {
        this.#validateAddressMode(addressModeV);
        this.#addressModeV = addressModeV;
    }

    /**
     * Returns the mag filter setting.
     */
    get magFilter() {
        return this.#magFilter;
    }

    /**
     * Sets the mag filter setting.
     */
    set magFilter(magFilter)
    {
        this.#validateFilterSetting(magFilter);
        this.#magFilter = magFilter;
    }

    /**
     * Returns the min filter setting.
     */
    get minFilter() {
        return this.#minFilter;
    }

    /**
     * Sets the min filter setting.
     */
    set minFilter(minFilter)
    {
        this.#validateFilterSetting(minFilter);
        this.#minFilter = minFilter;
    }

    /**
     * Returns the GPU sampler.
     */
    getGpuSampler()
    {
        if (!this.#compiled) {
            throw new Error(
                'Sampler must be compiled before accessing sampler!'
            );
        }

        return this.#sampler;
    }

    /**
     * Returns if the sampler is compiled.
     */
    isCompiled() {
        return this.#compiled;
    }

    /**
     * Compiles the sampler into a WebGPU sampler.
     */
    compile(device)
    {
        if (this.#compiled) {
            return;
        }

        Engine.validateDevice(device);
        this.#createSampler(device);
        this.#compiled = true;
    }

    /**
     * Destroys the sampler and releases GPU resources.
     */
    destroy()
    {
        this.#sampler = null;
        this.#compiled = false;
    }

    /**
     * Creates a sampler with the specified settings.
     */
    #createSampler(device)
    {
        // Create the sampler
        this.#sampler = device.createSampler({
            addressModeU: this.#addressModeU,
            addressModeV: this.#addressModeV,
            magFilter: this.#magFilter,
            minFilter: this.#minFilter
        });
    }

    /**
     * Validates that a value is a valid address mode.
     */
    #validateAddressMode(addressMode)
    {
        const validModes = [
            Sampler.CLAMP_TO_EDGE,
            Sampler.REPEAT,
            Sampler.MIRROR_REPEAT
        ];

        if (!validModes.includes(addressMode)) {
            throw new Error(
                `Invalid address mode: ${addressMode}.`
            );
        }
    }

    /**
     * Validates that a value is a valid filter setting value.
     */
    #validateFilterSetting(filterSetting)
    {
        const validSettings = [
            Sampler.NEAREST,
            Sampler.LINEAR
        ];

        if (!validSettings.includes(filterSetting)) {
            throw new Error(
                `Invalid filter setting: ${filterSetting}.`
            );
        }
    }

    // Some fake constants containing valid address U and V modes.

    static get CLAMP_TO_EDGE() {
        return 'clamp-to-edge';
    }

    static get REPEAT() {
        return 'repeat';
    }

    static get MIRROR_REPEAT() {
        return 'mirror-repeat';
    }

    // Some fake constants containing valid filter settings.

    static get NEAREST() {
        return 'nearest';
    }

    static get LINEAR() {
        return 'linear';
    }
}

export {
    Sampler
};