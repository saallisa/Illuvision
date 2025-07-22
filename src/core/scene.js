
import { Engine } from "../engine.js";
import { SceneNode } from "./scene-node.js";

/**
 * Manages the camera and objects in a scene.
 */
class Scene
{
    #nodes = [];
    #compiled = false;

    /**
     * Adds a scene node to the scene.
     */
    addNode(node)
    {
        if (!(node instanceof SceneNode)) {
            throw new TypeError('Node must be an instance of SceneNode.');
        }

        this.#nodes.push(node);
    }

    /**
     * Gets all nodes as an array.
     */
    getNodes() {
        return this.#nodes;
    }

    /**
     * Gets the compilation status.
     */
    isCompiled() {
        return this.#compiled;
    }

    /**
     * Compiles the scene.
     */
    async compile(device)
    {
        if (this.#compiled) {
            return;
        }

        Engine.validateDevice(device);

        // Compile all nodes
        for (const node of this.#nodes) {
            await node.compile(device);
        }

        this.#compiled = true;
    }

    /**
     * Destroys WebGPU resources associated with this scene.
     */
    destroy()
    {
        // Destroy all nodes
        for (const node of this.#nodes) {
            node.destroy();
        }

        this.#compiled = false;
    }
}

export {
    Scene
};