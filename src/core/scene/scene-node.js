
import { Angle } from '../math/angle.js';
import { Matrix3 } from '../math/matrix3.js';
import { Matrix4 } from '../math/matrix4.js';
import { Mesh } from '../mesh.js';
import { UniformBuffer } from '../buffer/uniform-buffer.js';
import { Vector3 } from '../math/vector3.js';

/**
 * Represents an object node in a scene.
 */
class SceneNode
{
    #mesh = null;
    #children = [];
    #parent = null;

    #position = null;
    #scale = null;
    _rotateX = null;
    _rotateY = null;
    _rotateZ = null;

    #localModelMatrix = null;
    #localModelMatrixDirty = true;
    #modelMatrix = null;
    #modelMatrixDirty = true;
    #normalMatrix = null;
    #normalMatrixDirty = true;

    #camera = null;

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
     * Adds a child node to this scene node.
     */
    addChild(node)
    {
        if (!(node instanceof SceneNode)) {
            throw new TypeError('Child must be an instance of SceneNode.');
        }

        node.#parent = this;
        this.#children.push(node);
    }

    /**
     * Gets all children of a scene node.
     */
    getChildren() {
        return this.#children;
    }

    /**
     * Sets the scene node's position relative to its parent object.
     */
    setPosition(position)
    {
        Vector3.validateInstance(position);

        if (this.#position.x !== position.x ||
            this.#position.y !== position.y ||
            this.#position.z !== position.z)
        {
            this.#position = position;
            this.#markLocalModelMatrixDirty();
        }
    }

    /**
     * Changes the position's x value to the given value.
     */
    updateX(x)
    {
        if (this.#position.x !== x) {
            this.#position.x = x;
            this.#markLocalModelMatrixDirty();
        }
    }

    /**
     * Changes the position's y value to the given value.
     */
    updateY(y)
    {
        if (this.#position.y !== y) {
            this.#position.y = y;
            this.#markLocalModelMatrixDirty();
        }
    }

    /**
     * Changes the position's z value to the given value.
     */
    updateZ(z)
    {
        if (this.#position.z !== z) {
            this.#position.z = z;
            this.#markLocalModelMatrixDirty();
        }
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

        if (this.#scale.x !== scale.x ||
            this.#scale.y !== scale.y ||
            this.#scale.z !== scale.z)
        {
            this.#scale = scale;
            this.#markLocalModelMatrixDirty();
        }
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
        const normalizedAngle = (angle + 360) % 360;

        if (this._rotateX !== normalizedAngle) {
            this._rotateX = (angle + 360) % 360;
            this.#markLocalModelMatrixDirty();
        }
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
        const normalizedAngle = (angle + 360) % 360;

        if (this._rotateY !== normalizedAngle) {
            this._rotateY = (angle + 360) % 360;
            this.#markLocalModelMatrixDirty();
        }
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
        const normalizedAngle = (angle + 360) % 360;

        if (this._rotateZ !== normalizedAngle) {
            this._rotateZ = (angle + 360) % 360;
            this.#markLocalModelMatrixDirty();
        }
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
    async compile(device, camera)
    {
        if (this.#compiled) {
            return;
        }

        this.#camera = camera;
        await this.#mesh.compile(device);
        this.#fillUniformBuffer();
        this.#uniformBuffer.compile(device);
        this.#createBindGroup(device);

        for (const child of this.#children) {
            await child.compile(device, camera);
        }

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
     * Require a model-related update on next rendering.
     */
    requireModelUpdate()
    {
        this.#needsUpdate = true;
        this.#modelMatrixDirty = true;
        this.#normalMatrixDirty = true;

        // Propagate to children since parent transform changed
        for (const child of this.#children) {
            child.requireModelUpdate();
        }
    }

    /**
     * Require a view-related update on next rendering.
     */
    requireViewUpdate()
    {
        this.#needsUpdate = true;
        this.#normalMatrixDirty = true;

        // Propagate to children
        for (const child of this.#children) {
            child.requireViewUpdate();
        }
    }

    /**
     * Updates the scene node's uniform buffer with current values.
     */
    update(device, camera)
    {
        if (!this.#compiled) {
            throw new Error(
                'Scene node must be compiled before updating.'
            );
        }

        this.#camera = camera;
        this.#fillUniformBuffer();
        this.#uniformBuffer.updateUniformBuffer(device);

        for (const child of this.#children) {
            if (child.needsUpdate()) {
                child.update(device, camera);
            }
        }

        this.#needsUpdate = false;
    }

    /**
     * Destroys WebGPU resources associated with this scene node.
     */
    destroy()
    {
        // Destroy children first
        for (const child of this.#children) {
            child.destroy();
        }

        if (this.#mesh && this.#mesh.isCompiled()) {
            this.#mesh.destroy();
        }

        this.#bindGroup = null;
        this.#bindGroupLayout = null;
        
        this.#compiled = false;

        // Clear all caches
        this.#localModelMatrix = null;
        this.#modelMatrix = null;
        this.#normalMatrix = null;

        // Mark everything dirty
        this.#localModelMatrixDirty = true;
        this.#modelMatrixDirty = true;
        this.#normalMatrixDirty = true;
        this.#needsUpdate = true;
    }

    /**
     * Returns the local model matrix without considering parent
     * transformations.
     */
    getLocalModelMatrix()
    {
        if (!this.#localModelMatrix || this.#localModelMatrixDirty) {
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

            const rotationX = Matrix4.createRotateX(
                Angle.fromDegrees(this.rotateX)
            );
            const rotationY = Matrix4.createRotateY(
                Angle.fromDegrees(this.rotateY)
            );
            const rotationZ = Matrix4.createRotateZ(
                Angle.fromDegrees(this.rotateZ)
            );

            const rotation = rotationX
                .multiplyOther(rotationY)
                .multiplyOther(rotationZ);

            this.#localModelMatrix = rotation.multiplyOther(position).multiplyOther(scale);
            this.#localModelMatrixDirty = false;
        }

        return this.#localModelMatrix;
    }

    /**
     * Returns the scene node's model matrix.
     */
    getModelMatrix()
    {
        if (!this.#parent) {
            return this.getLocalModelMatrix();
        }

        if (!this.#modelMatrix || this.#modelMatrixDirty) {
            const localModelMatrix = this.getLocalModelMatrix();

            // Parent transformation applied if needed
            if (this.#parent) {
                const parentTransform = this.#parent.getModelMatrix();
                this.#modelMatrix = localModelMatrix.multiplyOther(
                    parentTransform
                );
                this.#modelMatrixDirty = false;
            }
        }

        return this.#modelMatrix;
    }

    /**
     * Returns the scene nodes normal matrix.
     */
    getNormalMatrix()
    {
        if (!this.#normalMatrix || this.#normalMatrixDirty) {
            const mat3 = Matrix3.fromMatrix4(this.getModelMatrix());
            const inverted = Matrix3.invert(mat3);

            this.#normalMatrix = Matrix3.transpose(inverted);
            this.#normalMatrixDirty = false;
        }

        return this.#normalMatrix;
    }

    /**
     * Marks the model matrix dirty and requires an update.
     */
    #markLocalModelMatrixDirty()
    {
        this.#localModelMatrixDirty = true;
        this.#normalMatrixDirty = true;
        this.#needsUpdate = true;
    }

    /**
     * Fill the uniform buffer with the matrices of this scene node.
     */
    #fillUniformBuffer()
    {
        const modelMatrix = this.getModelMatrix();
        const viewMatrix = this.#camera.getViewMatrix();
        const modelViewMatrix = Matrix4.multiply(modelMatrix, viewMatrix);
        const normalMatrix = this.getNormalMatrix();

        this.#uniformBuffer.setUniform(
            'model-matrix', modelMatrix.toArray(), 'mat4x4<f32>'
        );
        this.#uniformBuffer.setUniform(
            'model-view-matrix', modelViewMatrix.toArray(), 'mat4x4<f32>'
        );
        this.#uniformBuffer.setUniform(
            'normal-matrix', normalMatrix.toBufferArray(), 'mat3x3<f32>'
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