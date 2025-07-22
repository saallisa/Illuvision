
import { Geometry } from './geometry/geometry.js';
import { Material } from './material/material.js';

/**
 * Combines geometry and material data to create a renderable object.
 */
class Mesh
{
    #geometry = null;
    #material = null;

    #compiled = false;
    #geometryBuffer = null;

    constructor(geometry, material)
    {
        Mesh.#validateGeometry(geometry);
        Mesh.#validateMaterial(material);

        this.#geometry = geometry;
        this.#material = material;
    }

    /**
     * Gets the geometry.
     */
    getGeometry() {
        return this.#geometry;
    }

    /**
     * Gets the material.
     */
    getMaterial() {
        return this.#material;
    }

    /**
     * Gets the geometry buffer for this mesh.
     */
    getGeometryBuffer()
    {
        if (!this.#compiled) {
            throw new Error(
                'Mesh must be compiled before accessing geometry buffer.'
            );
        }

        return this.#geometryBuffer;
    }

    /**
     * Returns whether the mesh is compiled.
     */
    isCompiled() {
        return this.#compiled;
    }

    /**
     * Compiles the mesh by creating geometry buffers, material uniforms
     * and render pipeline.
     */
    async compile(device)
    {
        if (this.#compiled) {
            return;
        }

        this.#material.compile(device);
        const bufferLayout = this.#createBufferLayout();
        this.#geometryBuffer = this.#geometry.createBuffer(bufferLayout);
        this.#geometryBuffer.compile(device);

        this.#compiled = true;
    }

    /**
     * Destroys WebGPU resources associated with this mesh.
     */
    destroy()
    {
        if (this.#geometryBuffer && this.#geometryBuffer.isCompiled()) {
            this.#geometryBuffer.destroy();
        }

        if (this.#material && this.#material.isCompiled()) {
            this.#material.destroy();
        }

        this.#compiled = false;
    }

    /**
     * Creates the appropriate buffer layout based on material and geometry
     * requirements.
     */
    #createBufferLayout()
    {
        const layout = [Geometry.VERTEX];

        // Add normals if geometry has faces
        if (this.#geometry.getFaceCount() > 0) {
            layout.push(Geometry.NORMAL);
        }

        // Add UV coordinates if geometry has them
        if (this.#geometry.getUvCount() > 0) {
            layout.push(Geometry.UV);
        }

        // Add vertex colors if material is configured to use them
        if (
            this.#material.getUseVertexColor()
            && this.#geometry.getVertexColors().length > 0
        ) {
            layout.push(Geometry.COLOR);
        }

        return layout;
    }

    /**
     * Validates the geometry instance.
     */
    static #validateGeometry(geometry)
    {
        if (!(geometry instanceof Geometry)) {
            throw new TypeError(
                'Geometry must be an instance of Geometry class.'
            );
        }

        if (geometry.getVertexCount() === 0) {
            throw new Error('Geometry must contain at least one vertex.');
        }
    }

    /**
     * Validates the material instance.
     */
    static #validateMaterial(material)
    {
        if (!(material instanceof Material)) {
            throw new TypeError(
                'Material must be an instance of Material class.'
            );
        }

        if (!material.getShader()) {
            throw new Error('Material must have a shader assigned.');
        }
    }
}

export {
    Mesh
};