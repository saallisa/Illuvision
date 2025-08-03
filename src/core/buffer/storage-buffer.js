
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
    #alignedElementSize = 0;
    #fieldOffsets = new Map();

    #growthFactor = 1.5;
    #minBufferSize = 256;
    #aligned = true;
    #storageBuffer = null;
    #compiled = false;

    constructor(layout = {}, length = 5, aligned = true)
    {
        super();

        this.setStorageLayout(layout);

        const byteLength = length * 4;

        if (aligned) {
            this.#minBufferSize = this.#alignedElementSize * length + byteLength;
        } else {
            this.#minBufferSize = this.#elementSize * byteLength + byteLength;
        }

        this.#aligned = aligned;
    }

    /**
     * Adds a storage entry that matches the storage's layout. If the entry
     * doesn't conform to the storage's layout, throws an Error.
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

        this.#alignedElementSize = 0;
        this.#fieldOffsets.clear();

        if (this.#aligned) {
            // Calculate proper aligned size and field offsets
            this.#alignedElementSize = StorageBuffer.calculateStructSize(layout);
            this.#fieldOffsets = StorageBuffer.calculateFieldOffsets(layout);
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
     * Returns the aligned entry size (with padding).
     */
    getAlignedEntrySize() {
        return this.#alignedElementSize;
    }

    /**
     * Returns the number of entries in the storage.
     */
    getEntryCount() {
        return this.#storage.size;
    }

    /**
     * Returns field offsets within the struct as a copy.
     */
    getFieldOffsets() {
        return new Map(this.#fieldOffsets);
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
        this.#createStorageBuffer(device);
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
        const alignedSize = Math.ceil(flatData.byteLength / 256) * 256;
        const requiredSize = Math.max(alignedSize, this.#minBufferSize);

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
    #createStorageBuffer(device)
    {
        let flatData = this.#flattenStorage();

        const alignedSize = Math.ceil(flatData.byteLength / 256) * 256;

        this.#storageBuffer = device.createBuffer({
            size: Math.max(alignedSize, this.#minBufferSize),
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        // Write initial data if available
        if (flatData.byteLength > 0) {
            device.queue.writeBuffer(this.#storageBuffer, 0, flatData);
        }
    }

    /**
     * Flattens the storage as required in the storage constructor.
     */
    #flattenStorage()
    {
        if (this.#aligned) {
            return this.#flattenStorageWithAlignment();
        } else {
            return this.#flattenStorageSimple();
        }
    }

    /**
     * Flattens the storage values as they are to a Float32Array.
     */
    #flattenStorageSimple()
    {
        let flatData = [];

        for (const value of this.#storage.values()) {
            const flatValues = StorageBuffer.flattenValues(
                Object.values(value)
            );
            flatData.push(...flatValues);
        }

        return new Float32Array(flatData);
    }

    /**
     * Flattens the storage values with proper WGSL alignment.
     */
    #flattenStorageWithAlignment()
    {
        if (this.#storage.size === 0) {
            return new Float32Array(0);
        }

        const bufferSize = this.#alignedElementSize * this.#storage.size;
        const buffer = new ArrayBuffer(bufferSize);
        const view = new DataView(buffer);
        
        let entryIndex = 0;

        for (const entry of this.#storage.values()) {
            const baseOffset = entryIndex * this.#alignedElementSize;
            
            for (const [fieldName, fieldType] of this.#storageLayout) {
                const fieldOffset = this.#fieldOffsets.get(fieldName);
                const value = entry[fieldName];
                
                StorageBuffer.writeValueToBuffer(
                    view, 
                    baseOffset + fieldOffset, 
                    value, 
                    fieldType
                );
            }
            
            entryIndex++;
        }
        
        return new Float32Array(buffer);
    }
}

export {
    StorageBuffer
};