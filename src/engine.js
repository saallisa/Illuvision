
/**
 * 3D rendering engine using the WebGPU API and HTML canvas.
 */
class Engine
{
    #canvas = null;
    #adapter = null;
    #device = null;
    #context = null;
    #format = null;

    #initialized = false;

    constructor()
    {
        this.width = 800;
        this.height = 600;
    }

    /**
     * Sets the canvas size in pixels.
     */
    setSize(width, height)
    {
        // Validate input
        if (typeof width !== 'number' || width <= 0) {
            throw new TypeError('Width must be a positive number.');
        }

        if (typeof height !== 'number' || height <= 0) {
            throw new TypeError('Height must be a positive number.');
        }

        this.width = width;
        this.height = height;

        if (this.#canvas) {
            this.#canvas.width = width;
            this.#canvas.height = height;
            this.#canvas.style.width = width + 'px';
            this.#canvas.style.height = height + 'px';
        }
    }

    /**
     * Initializes WebGPU and configures the canvas context.
     */
    async initialize()
    {
        await this.#checkWebGpuSupport();
        await this.#requestAdapterAndDevice();
        this.#createCanvas();
        await this.#configureContext();

        this.#initialized = true;
    }

    /**
     * Returns the canvas element.
     */
    getCanvas()
    {
        if (!this.#initialized) {
            throw new Error('Engine must be initialized!');
        }

        return this.#canvas;
    }

    /**
     * Returns the WebGPU device
     */
    getDevice()
    {
        if (!this.#initialized) {
            throw new Error('Engine must be initialized!');
        }

        return this.#device;
    }

    /**
     * Returns the WebGPU canvas context.
     */
    getContext()
    {
        if (!this.#initialized) {
            throw new Error('Engine must be initialized!');
        }

        return this.#context;
    }

    /**
     * Creates a new HTML canvas element with the specified dimensions.
     */
    #createCanvas()
    {
        this.#canvas = document.createElement('canvas');
        this.#canvas.width = this.width;
        this.#canvas.height = this.height;
        
        // Set CSS size to match canvas size for proper display
        this.#canvas.style.width = this.width + 'px';
        this.#canvas.style.height = this.height + 'px';
    }

    /**
     * Ensures WebGPU is supported in the current environment.
     */
    async #checkWebGpuSupport()
    {
        if (typeof navigator === 'undefined' || !navigator.gpu) {
            throw new Error('WebGPU is not supported by this browser.');
        }
    }

    /**
     * Requests the GPU adapter and device.
     */
    async #requestAdapterAndDevice()
    {
        this.#adapter = await navigator.gpu.requestAdapter();
        if (!this.#adapter) {
            throw new Error('No compatible GPU adapter found.');
        }

        this.#device = await this.#adapter.requestDevice();
        if (!this.#device) {
            throw new Error('Failed to initialize GPU device.');
        }
    }

    /**
     * Retrieves and configures the WebGPU context from the canvas.
     */
    async #configureContext()
    {
        this.#context = this.#canvas.getContext('webgpu');
        if (!this.#context) {
            throw new Error('Unable to get WebGPU context from canvas.');
        }

        this.#format = navigator.gpu.getPreferredCanvasFormat();
        if (!this.#format) {
            throw new Error('Failed to get a supported canvas format.');
        }

        try {
            this.#context.configure({
                device: this.#device,
                format: this.#format
            });
        } catch (e) {
            throw new Error(
                'Failed to configure WebGPU context: ' + e.message
            );
        }
    }
}

export {
    Engine
};