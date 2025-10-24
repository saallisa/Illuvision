
import { Matrix3 } from './matrix3.js';
import { Matrix4 } from './matrix4.js';
import { Mesh } from './mesh.js';
import { UniformBuffer } from './buffer/uniform-buffer.js';
import { Vector3 } from './vector3.js';

/**
 * Represents an object node in a scene.
 */
class SceneNode
{
    #mesh = null;
    #position = null;
    #scale = null;

    #uniformBuffer = null;
    #bindGroupLayout = null;
    #bindGroup = null;

    #compiled = false;
    #needsUpdate = false;

    constructor(mesh = null)
    {
        if (mesh !== null) {
            SceneNode.#validateMesh(mesh);
            this.#mesh = mesh;
        }

        this.#position = new Vector3(0, 0, 0);
        this.#scale = new Vector3(1, 1, 1);

        this.rotateX = 0;
        this.rotateY = 0;
        this.rotateZ = 0;

        this.#uniformBuffer = new UniformBuffer();
    }

    /**
     * Gets the scene node's mesh.
     */
    getMesh() {
        return this.#mesh;
    }

    /**
     * Sets the scene node's position relative to its parent object.
     */
    setPosition(position)
    {
        Vector3.validateInstance(position);

        this.#position = position;
        this.#needsUpdate = true;
    }

    /**
     * Changes the position's x value to the given value.
     */
    updateX(x)
    {
        this.#position.x = x;
        this.#needsUpdate = true;
    }

    /**
     * Changes the position's y value to the given value.
     */
    updateY(y)
    {
        this.#position.y = y;
        this.#needsUpdate = true;
    }

    /**
     * Changes the position's z value to the given value.
     */
    updateZ(z)
    {
        this.#position.z = z;
        this.#needsUpdate = true;
    }

    /**
     * Returns the scene node's position relative to its parent object.
     */
    getPosition() {
        return this.#position;
    }

    /**
     * Returns the scene node's scale factors.
     */
    getScale() {
        return this.#scale;
    }

    /**
     * Sets the scene node's scale factors.
     */
    setScale(scale)
    {
        Vector3.validateInstance(scale);

        this.#scale = scale;
        this.#needsUpdate = true;
    }

    /**
     * Get the x rotation directly.
     */
    get rotateX() {
        return this._rotateX;
    }

    /**
     * Sets the x rotation directly.
     */
    set rotateX(angle)
    {
        this._rotateX = (angle + 360) % 360;
        this.#needsUpdate = true;
    }

    /**
     * Get the y rotation directly.
     */
    get rotateY() {
        return this._rotateY;
    }

    /**
     * Sets the y rotation directly.
     */
    set rotateY(angle)
    {
        this._rotateY = (angle + 360) % 360;
        this.#needsUpdate = true;
    }

    /**
     * Get the z rotation directly.
     */
    get rotateZ() {
        return this._rotateZ;
    }

    /**
     * Sets the z rotation directly.
     */
    set rotateZ(angle)
    {
        this._rotateZ = (angle + 360) % 360;
        this.#needsUpdate = true;
    }

    /**
     * Retrieve the uniform buffer.
     */
    getUniformBuffer()
    {
        if (!this.#compiled) {
            throw new Error(
                'Scene node must be compiled before accessing uniform buffer!'
            );
        }

        return this.#uniformBuffer;
    }

    /**
     * Gets the bind group layout of this material.
     */
    getBindGroupLayout()
    {
        if (!this.#compiled) {
            throw new Error(
                'Scene node must be compiled before accessing bind group layout.'
            );
        }

        return this.#bindGroupLayout;
    }

    /**
     * Retrieve the bind group.
     */
    getBindGroup()
    {
        if (!this.#compiled) {
            throw new Error(
                'Scene node must be compiled before accessing bind group!'
            );
        }

        return this.#bindGroup;
    }

    /**
     * Compiles the scene node.
     */
    async compile(device)
    {
        if (this.#compiled) {
            return;
        }

        await this.#mesh.compile(device);
        this.#fillUniformBuffer();
        this.#uniformBuffer.compile(device);
        this.#createBindGroup(device);

        this.#needsUpdate = false;
        this.#compiled = true;
    }

    /**
     * Returns whether the scene node's uniform buffer needs to be updated.
     */
    needsUpdate() {
        return this.#needsUpdate;
    }

    /**
     * Require an update on next rendering.
     */
    requireUpdate() {
        this.#needsUpdate = true;
    }

    /**
     * Updates the scene node's uniform buffer with current values.
     */
    update(device)
    {
        if (!this.#compiled) {
            throw new Error(
                'Scene node must be compiled before updating.'
            );
        }

        this.#fillUniformBuffer();
        this.#uniformBuffer.updateUniformBuffer(device);
        this.#needsUpdate = false;
    }

    /**
     * Destroys WebGPU resources associated with this scene node.
     */
    destroy()
    {
        if (this.#mesh && this.#mesh.isCompiled()) {
            this.#mesh.destroy();
        }

        this.#bindGroup = null;
        this.#bindGroupLayout = null;
        
        this.#compiled = false;
        this.#needsUpdate = true;
    }

    /**
     * Returns the scene node's model matrix.
     */
    #getModelMatrix()
    {
        const position = Matrix4.createTranslation(
            this.#position.x,
            this.#position.y,
            this.#position.z
        );

        const scale = Matrix4.createScale(
            this.#scale.x,
            this.#scale.y,
            this.#scale.z
        );

        const rotationX = Matrix4.createRotateX(this.rotateX);
        const rotationY = Matrix4.createRotateY(this.rotateY);
        const rotationZ = Matrix4.createRotateZ(this.rotateZ);
        const rotation = rotationX
            .multiplyOther(rotationY)
            .multiplyOther(rotationZ);

        return rotation.multiplyOther(position).multiplyOther(scale);
    }

    /**
     * Returns the scene nodes normal matrix.
     */
    #getNormalMatrix(modelMatrix)
    {
        // Extract upper 3x3
        const mat3 = Matrix3.fromMatrix4(modelMatrix);
        
        // Inverse-transpose
        const inverted = Matrix3.invert(mat3);
        return Matrix3.transpose(inverted);
    }

    /**
     * Fill the uniform buffer with the matrices of this scene node.
     */
    #fillUniformBuffer()
    {
        const modelMatrix = this.#getModelMatrix();
        const normalMatrix = this.#getNormalMatrix(modelMatrix);

        this.#uniformBuffer.setUniform(
            'model-matrix', modelMatrix.toArray(), 'mat4x4<f32>'
        );
        this.#uniformBuffer.setUniform(
            'normal-matrix', normalMatrix.toArray(), 'mat3x3<f32>'
        );
    }

    /**
     * Create the bind group for this node.
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
            label: 'model',
            layout: this.#bindGroupLayout,
            entries: [{
                binding: 0,
                resource: {
                    buffer: this.#uniformBuffer.getUniformBuffer()
                }
            }]
        });
    }

    /**
     * Validates the mesh instance.
     */
    static #validateMesh(mesh)
    {
        if (!(mesh instanceof Mesh)) {
            throw new TypeError(
                'Mesh must be an instance of Mesh class.'
            );
        }
    }
}

export {
    SceneNode
};