
import { Engine } from '../engine.js';
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
    #pipeline = null;
    #bindGroup = null;

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
     * Gets the render pipeline.
     */
    getPipeline()
    {
        if (!this.#compiled) {
            throw new Error(
                'Mesh must be compiled before accessing render pipeline.'
            );
        }

        return this.#pipeline;
    }

    /**
     * Gets the bind group of this mesh.
     */
    getBindGroup()
    {
        if (!this.#compiled) {
            throw new Error(
                'Mesh must be compiled before accessing bind group.'
            );
        }

        return this.#bindGroup;
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
    async compile(engine)
    {
        if (this.#compiled) {
            return;
        }

        Mesh.#validateEngine(engine);
        const device = engine.getDevice();

        this.#material.compile(device);
        const bufferLayout = this.#createBufferLayout();
        this.#geometryBuffer = this.#geometry.createBuffer(bufferLayout);
        this.#geometryBuffer.compile(device);

        await this.#createRenderPipeline(device, engine.getFormat());
        this.#createBindGroup(device);

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

        this.#bindGroup = null;
        this.#pipeline = null;

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
     * Creates the bind group layout.
     */
    #createBindGroup(device)
    {
        const uniformBuffer = this.#material.getUniformBuffer();

        this.#bindGroup = device.createBindGroup({
            layout: this.#pipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: {
                    buffer: uniformBuffer.getUniformBuffer()
                }
            }]
        });
    }

    /**
     * Creates the WebGPU render pipeline for this mesh.
     */
    async #createRenderPipeline(device, format)
    {
        const shader = this.#material.getShader();

        this.#pipeline = await device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: shader.getVertexModule(),
                buffers: [
                    await this.#geometryBuffer.getVertexBufferLayout()
                ]
            },
            fragment: {
                module: shader.getFragmentModule(),
                targets: [{
                    format: format
                }]
            },
            primitive: {
                topology: 'triangle-list'
            }
        });
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

    /**
     * Validates the engine instance.
     */
    static #validateEngine(engine)
    {
        if (!(engine instanceof Engine)) {
            throw new TypeError(
                'Engine must be an istance of Engine class.'
            );
        }
    }
}

export {
    Mesh
};