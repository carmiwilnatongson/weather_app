<script lang="ts">
    //C:\xampp\htdocs\weather_app\src\lib\components\ParticlesBackground.svelte
    import { onMount } from 'svelte';
    import { type Container, type Engine } from "@tsparticles/engine";
    import { loadSlim } from "@tsparticles/slim";

    let container: Container | undefined;

    onMount(async () => {
        try {
            const engine = window.tsParticles as unknown as Engine;
            await loadSlim(engine);
            
            container = await engine.load({
                id: "tsparticles",
                options: {
                    fpsLimit: 120,
                    particles: {
                        color: {
                            value: "#ffffff"
                        },
                        links: {
                            color: "#ffffff",
                            distance: 150,
                            enable: true,
                            opacity: 0.1,
                            width: 1
                        },
                        move: {
                            enable: true,
                            speed: 1
                        },
                        number: {
                            value: 50,
                            density: {
                                enable: true
                            }
                        },
                        opacity: {
                            value: 0.3
                        },
                        shape: {
                            type: "circle"
                        },
                        size: {
                            value: { min: 1, max: 3 }
                        }
                    },
                    detectRetina: true
                }
            });
        } catch (error) {
            console.error("Error initializing particles:", error);
        }
    });
</script>

<div id="tsparticles"></div>

<style>
    #tsparticles {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 1;
        pointer-events: none;
    }
</style> 