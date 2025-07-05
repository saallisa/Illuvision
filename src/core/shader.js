
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
}