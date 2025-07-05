
import { Engine } from "../engine.js";

/**
 * Encapsulates vertex and fragment shader code and handles compilation when
 * device is available.
 */
class Shader
{
    #vertexSource = null;
    #fragmentSource = null;
    #vertexModule = null;
    #fragmentModule = null;
    #compiled = false;

    constructor(vertexSource, fragmentSource)
    {
        Shader.#validateShaderSource(vertexSource, 'Vertex');
        Shader.#validateShaderSource(fragmentSource, 'Fragment');

        this.#vertexSource = vertexSource;
        this.#fragmentSource = fragmentSource;
    }

    /**
     * Compiles the shader modules using the provided device
     */
    compile(device)
    {
        // Exit function if shader modules are already compiled.
        if (this.#compiled) {
            return;
        }

        Engine.validateDevice(device);

        this.#vertexModule = device.createShaderModule({
            code: this.#vertexSource
        });

        this.#fragmentModule = device.createShaderModule({
            code: this.#fragmentSource
        });

        this.#compiled = true;
    }

    /**
     * Checks if shader is compiled
     */
    isCompiled() {
        return this.#compiled;
    }

    /**
     * Gets the compiled vertex shader module.
     */
    getVertexModule()
    {
        if (!this.isCompiled()) {
            throw new Error('Shader must be compiled before use.');
        }

        return this.#vertexModule;
    }

    /**
     * Gets the compiled fragment shader module.
     */
    getFragmentModule()
    {
        if (!this.isCompiled()) {
            throw new Error('Shader must be compiled before use.');
        }

        return this.#fragmentModule;
    }

    /**
     * Validates that the shader source code is valid.
     */
    static #validateShaderSource(source, shaderType)
    {
        if (typeof source !== 'string') {
            throw new TypeError(
                `${shaderType} shader source must be a string.`
            );
        }

        if (source.trim().length === 0) {
            throw new Error(
                `${shaderType} shader source cannot be empty.`
            );
        }
    }
}

export {
    Shader
};