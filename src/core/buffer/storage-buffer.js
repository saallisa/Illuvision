
import { BaseBuffer } from './base-buffer.js';
import { Engine } from '../../engine.js';

/**
 * Manages WebGPU storage buffers for variable-length arrays of structured data.
 * Ideal for scenarios like dynamic light arrays, particle systems, etc.
 */
class StorageBuffer extends BaseBuffer
{
    #storage = new Map();
    #storageLayout = new Map();
    #elementSize = 0;

    #growthFactor = 1.5;
    #minBufferSize = 256;
    #storageBuffer = null;
    #compiled = false;

    constructor(layout = {}, length = 5)
    {
        super();

        this.setStorageLayout(layout);
        this.#minBufferSize = this.#elementSize * length * 4 + length * 4;
    }

    /**
     * Adds a storage entry that matches the storage's layout. If the entry
     * doesn't conform to the sorage's layout, throws an Error.
     */
    setStorageEntry(name, value)
    {
        this.#validateEntryData(value);

        this.#storage.set(name, value);
    }

    /**
     * Returns the storage value with the given name.
     */
    getStorageEntry(name) {
        return this.#storage.get(name);
    }

    /**
     * Returns a copy of the current storage.
     */
    getStorage() {
        return new Map(this.#storage);
    }

    /**
     * Removes the storage entry with the given name.
     */
    removeStorageEntry(name) {
        this.#storage.delete(name);
    }

    /**
     * Removes all elements from the storage.
     */
    clearStorage() {
        this.#storage.clear();
    }

    /**
     * Returns the current storage layout.
     */
    getStorageLayout() {
        return this.#storageLayout;
    }

    /**
     * Sets the layout for elements in the storage buffer.
     */
    setStorageLayout(layout)
    {
        if (typeof layout !== 'object' || layout === null) {
            throw new TypeError('Storage layout must be a non-null object.');
        }

        this.#storageLayout.clear();
        this.#elementSize = 0;

        for (const [name, type] of Object.entries(layout)) {
            StorageBuffer.validateBufferValueType(type);
            this.#storageLayout.set(name, type);
            this.#elementSize += StorageBuffer.getBufferTypeSize(type);
        }

        // Clear existing storage when layout changes
        this.#storage.clear();
        this.#compiled = false;
    }

    /**
     * Returns the set storage entry size.
     */
    getEntrySize() {
        return this.#elementSize;
    }

    /**
     * Returns the number of entries in the storage.
     */
    getEntryCount() {
        return this.#storage.size;
    }

    /**
     * Sets the growth factor for buffer resizing.
     */
    setGrowthFactor(factor)
    {
        if (typeof factor !== 'number' || factor <= 1) {
            throw new TypeError(
                'Growth factor must be a number greater than 1.'
            );
        }

        this.#growthFactor = factor;
    }

    /**
     * Gets the storage buffer.
     */
    getStorageBuffer()
    {
        if (!this.#compiled) {
            throw new Error(
                'Storage buffer must be compiled before accessing it!'
            );
        }

        return this.#storageBuffer;
    }

    /**
     * Compiles the uniform buffer.
     */
    compile(device)
    {
        if (this.#compiled) {
            return;
        }

        Engine.validateDevice(device);

        const initialSize = Math.max(
            this.#storage.size * this.#elementSize * 4,
            this.#minBufferSize
        );
        this.#createStorageBuffer(device, initialSize);
        this.#compiled = true;
    }

    /**
     * Updates the storage buffer with current data.
     */
    update(device)
    {
        if (!this.#compiled) {
            throw new Error(
                'Storage buffer must be compiled before updating!'
            );
        }

        Engine.validateDevice(device);

        const flatData = this.#flattenStorage();
        const requiredSize = Math.max(flatData.byteLength, this.#minBufferSize);

        // Resize buffer if needed
        if (requiredSize > this.#storageBuffer.size) {
            this.#storageBuffer.destroy();
            this.#createStorageBuffer(
                device, Math.ceil(requiredSize * this.#growthFactor)
            );
        }

        // Write data to buffer
        if (flatData.byteLength > 0) {
            device.queue.writeBuffer(this.#storageBuffer, 0, flatData);
        }
    }

    /**
     * Returns if the storage buffer is compiled.
     */
    isCompiled() {
        return this.#compiled;
    }

    /**
     * Destroys the WebGPU buffer.
     */
    destroy()
    {
        if (this.#storageBuffer) {
            this.#storageBuffer.destroy();
            this.#storageBuffer = null;
        }

        this.#compiled = false;
    }

    /**
     * Validates storage entry data against the defined storage layout.
     */
    #validateEntryData(entryData)
    {
        if (typeof entryData !== 'object' || entryData === null) {
            throw new TypeError(
                'Storage entry must be a non-null object.'
            );
        }

        // Check if required layout values exist in entry
        for (const [fieldName, fieldType] of this.#storageLayout) {
            if (!(fieldName in entryData)) {
                throw new TypeError(
                    `Missing required field '${fieldName}' in storage entry.`
                );
            }

            const value = entryData[fieldName];
            StorageBuffer.validateBufferValueSize(value, fieldType);
            StorageBuffer.validateBufferValue(value, fieldType);
        }

        // Check for extra fields
        for (const fieldName of Object.keys(entryData)) {
            if (!this.#storageLayout.has(fieldName)) {
                throw new TypeError(
                    `Unknown field '${fieldName}' in storage entry.`
                );
            }
        }
    }

    /**
     * Creates the WebGPU storage buffer.
     */
    #createStorageBuffer(device, size)
    {
        this.#storageBuffer = device.createBuffer({
            size: size,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const flatData = this.#flattenStorage();

        // Write initial data if available
        if (flatData.byteLength > 0) {
            device.queue.writeBuffer(this.#storageBuffer, 0, flatData);
        }
    }

    /**
     * Flattens the storage values to a Float32Array.
     */
    #flattenStorage()
    {
        let flatData = [];

        for (const value of this.#storage.values()) {
            const flatValues = StorageBuffer.flattenValues(
                Object.entries(value)
            );
            flatData.push(...flatValues);
        }

        return new Float32Array(flatData);
    }
}

export {
    StorageBuffer
};