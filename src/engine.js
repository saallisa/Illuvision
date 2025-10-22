
import { Camera } from './core/camera/camera.js';
import { Color } from './core/color.js';
import { Loader } from './core/loader.js';
import { Scene } from './core/scene.js';

/**
 * 3D rendering engine using the WebGPU API and HTML canvas.
 */
class Engine
{
    // Settings
    #width = null;
    #height = null;
    #aspectRatio = null;
    #clearColor = null;
    static #rootPath = '';

    // WebGPU properties
    #canvas = null;
    #adapter = null;
    #device = null;
    #context = null;
    #format = null;
    #commandEncoder = null;
    #renderPass = null;
    #depthTexture = null;
    #pipelines = new Map();

    // Animation
    #animationId = null;
    #animation = null;

    // State
    #initialized = false;
    #animating = false;

    constructor()
    {
        this.#width = 800;
        this.#height = 600;
        this.#aspectRatio = this.#width / this.#height;
        this.#clearColor = Color.BLACK;
    }

    /**
     * Sets the absolute path to the engine folder. 
     */
    static setRootPath(path)
    {
        if (typeof path !== 'string') {
            throw new TypeError('Path must be a string.');
        }

        if (path.length === 0) {
            throw new Error('Path may not be an empty string.');
        }

        Engine.#rootPath = Loader.normalizePath(path);
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

        this.#width = width;
        this.#height = height;
        this.#aspectRatio = this.#width / this.#height;

        if (this.#canvas) {
            this.#updateCanvasSize();
        }
    }

    /**
     * Resizes canvas to fit the current window size.
     */
    setSizeToWindow() {
        this.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Sets the clear color to use when rendering a scene.
     */
    setClearColor(color)
    {
        if (!(color instanceof Color)) {
            throw new TypeError('Clear color must be an instance of Color.');
        }

        this.#clearColor = color;
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
     * Returns the absolute path to the engine folder
     */
    static getRootPath() {
        return Engine.#rootPath;
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
     * Returns the preferred canvas format.
     */
    getFormat()
    {
        if (!this.#initialized) {
            throw new Error('Engine must be initialized!');
        }

        return this.#format;
    }

    /**
     * Returns the aspect ratio of the canvas element.
     */
    getAspectRatio() {
        return this.#aspectRatio;
    }

    /**
     * Returns the clear color to use when rendering a scene.
     */
    getClearColor() {
        return this.#clearColor;
    }

    /**
     * Returns whether the animation loop is currently running.
     */
    isAnimating() {
        return this.#animating;
    }

    /**
     * Sets the animation loop callback function.
     */
    setAnimationLoop(callback)
    {
        if (callback !== null && typeof callback !== 'function') {
            throw new TypeError(
                'Animation callback must be a function or null.'
            );
        }

        this.#animation = callback;

        if (callback === null) {
            this.stopAnimation();
        }

        if (!this.#animating && callback !== null) {
            this.#startAnimation();
        }
    }

    /**
     * Stops the animation loop.
     */
    stopAnimation()
    {
        if (this.#animationId) {
            cancelAnimationFrame(this.#animationId);
            this.#animationId = null;
        }

        this.#animating = false;
    }

    /**
     * Render a scene using the provided camera.
     */
    async render(scene, camera)
    {
        if (!this.#initialized) {
            throw new Error('Engine must be initialized before rendering!');
        }

        if (!(scene instanceof Scene)) {
            throw new TypeError('Scene must be an instance of Scene class.');
        }

        if (!(camera instanceof Camera)) {
            throw new TypeError('Camera must be an instance of Camera class.');
        }

        await scene.compile(this.#device);
        camera.compile(this.#device);
        this.#createRenderPass();
        this.#renderPass.setBindGroup(0, camera.getBindGroup());
        this.#renderPass.setBindGroup(1, scene.getBindGroup());
        await this.#renderScene(scene, camera);
        this.#renderPass.end();

        this.#device.queue.submit([
            this.#commandEncoder.finish()
        ]);
    }

    /**
     * Creates a new HTML canvas element with the specified dimensions.
     */
    #createCanvas()
    {
        this.#canvas = document.createElement('canvas');
        this.#updateCanvasSize();
    }

    /**
     * Updates the canvas dimensions and CSS styles.
     */
    #updateCanvasSize()
    {
        this.#canvas.width = this.#width;
        this.#canvas.height = this.#height;
        
        // Set CSS size to match canvas size for proper display
        this.#canvas.style.width = this.#width + 'px';
        this.#canvas.style.height = this.#height + 'px';
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

    /**
     * Starts the animation loop.
     */
    #startAnimation()
    {
        if (this.#animating) {
            return;
        }

        this.#animating = true;
        this.#animationLoop();
    }

    /**
     * Internal animation loop function.
     */
    #animationLoop()
    {
        if (!this.#animating || !this.#animation) {
            return;
        }

        try {
            this.#animation();
        } catch (error) {
            console.error('Error in animation callback:', error);
            this.stopAnimation();
            return;
        }

        // Schedule next frame
        this.#animationId = requestAnimationFrame(function () {
            return this.#animationLoop()
        }.bind(this));
    }

    /**
     * Creates the WebGPU commend encoder and render pass.
     */
    #createRenderPass()
    {
        this.#commandEncoder = this.#device.createCommandEncoder();

        if (!this.#depthTexture) {
            this.#createDepthTextureView();
        }
        
        const depthAttachment = this.#createDepthAttachment();

        // Create render pass descriptor
        const renderPassDescriptor = {
            colorAttachments: [{
                clearValue: this.#clearColor.toClearValue(),
                loadOp: "clear",
                storeOp: "store"
            }],
            depthStencilAttachment: depthAttachment
        };

        renderPassDescriptor.colorAttachments[0].view = this.#context
            .getCurrentTexture()
            .createView();
        
        this.#renderPass = this.#commandEncoder.beginRenderPass(
            renderPassDescriptor
        );
    }

    /**
     * Create the depth texture view.
     */
    #createDepthTextureView()
    {
        const depthTextureDesc = {
            size: [this.#width, this.#height, 1],
            dimension: '2d',
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.RENDER_ATTACHMENT 
        };

        const depthTexture = this.#device.createTexture(depthTextureDesc);
        this.#depthTexture = depthTexture.createView();
    }

    /**
     * Create the depth attachment description.
     */
    #createDepthAttachment()
    {
        return {
            view: this.#depthTexture,
            depthClearValue: 1,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
            stencilClearValue: 0,
            stencilLoadOp: 'clear',
            stencilStoreOp: 'store'
        };
    }

    /**
     * Render a scene using the provided camera.
     */
    async #renderScene(scene, camera)
    {
        const nodes = scene.getNodes();

        for (const node of nodes) {
            await this.#renderNode(node, camera, scene);
        }
    }

    /**
     * Render a single node of a scene.
     */
    async #renderNode(node, camera, scene)
    {
        if (node.needsUpdate()) {
            node.update(this.#device);
        }

        const material = node.getMesh().getMaterial();
        const vertices = node.getMesh().getVertexBuffer();
        const indices = node.getMesh().getIndexBuffer();
        const geometryId = node.getMesh().getGeometry().getId();

        const pipelineKey = material.getId() + '_' + geometryId;
        let pipeline = null;

        if (this.#pipelines.has(pipelineKey)) {
            pipeline = this.#pipelines.get(pipelineKey);
        } else {
            pipeline = await this.#createRenderPipeline(
                vertices, material, [
                    camera.getBindGroupLayout(),
                    scene.getBindGroupLayout(),
                    material.getBindGroupLayout(),
                    node.getBindGroupLayout(),
                ]
            );
            this.#pipelines.set(pipelineKey, pipeline);
        }

        this.#renderPass.setPipeline(pipeline);
        this.#renderPass.setBindGroup(2, material.getBindGroup());
        this.#renderPass.setBindGroup(3, node.getBindGroup());

        this.#renderPass.setVertexBuffer(0, vertices.getGpuVertexBuffer());
        this.#renderPass.setIndexBuffer(indices.getGpuIndexBuffer(), 'uint16');
        this.#renderPass.drawIndexed(indices.getIndexCount());
    }

    /**
     * Creates a render pipeline for the given material and geometry.
     */
    async #createRenderPipeline(vertices, material, groups)
    {
        const shader = material.getShader();
        
        const pipelineLayout = this.#device.createPipelineLayout({
            bindGroupLayouts: groups
        });

        return this.#device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: shader.getVertexModule(),
                buffers: [
                    await vertices.getVertexBufferLayout()
                ]
            },
            fragment: {
                module: shader.getFragmentModule(),
                targets: [{
                    format: this.#format
                }]
            },
            primitive: {
                topology: 'triangle-list',
                frontFace: 'ccw',
                cullMode: material.getCullMode()
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus-stencil8'
            }
        });
    }

    /**
     * Validates that the provided device is a valid WebGPU device.
     */
    static validateDevice(device)
    {
        // Check if device exists
        if (!device) {
            throw new TypeError(
                'WebGPU device is required but was not provided.'
            );
        }

        const requiredMethods = [
            'createShaderModule',
            'createBuffer',
            'createRenderPipeline',
            'createCommandEncoder'
        ];

        // Check if device has the required WebGPU methods
        for (const method of requiredMethods)
        {
            if (typeof device[method] !== 'function') {
                throw new TypeError(
                    `Invalid WebGPU device: missing ${method} method.`
                );
            }
        }

        // Check for queue property
        if (!device.queue) {
            throw new TypeError(
                'Invalid WebGPU device: missing queue property.'
            );
        }

        // Check if device has been destroyed
        if (device.destroyed === true) {
            throw new Error(
                'WebGPU device has been destroyed and cannot be used.'
            );
        }
    }

    /**
     * Validates the engine instance.
     */
    static validateEngine(engine)
    {
        if (!(engine instanceof Engine)) {
            throw new TypeError(
                'Engine must be an istance of Engine class.'
            );
        }
    }
}

export {
    Engine
};