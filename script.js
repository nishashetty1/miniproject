document.addEventListener('DOMContentLoaded', () => {
    // GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    // Animate main title
    gsap.from('.main-title', {
        opacity: 0,
        y: -50,
        duration: 1,
        ease: 'power3.out'
    });

    // Animate cards
    gsap.from('.card', {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.cards-container',
            start: 'top 80%'
        }
    });

    // Launch visualizer
    const sketches = {};

    function createSketch(topic) {
        return function(p) {
            let particles = [];

            p.setup = function() {
                const container = document.querySelector(`[data-topic="${topic}"] .animation-container`);
                const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
                canvas.parent(container);
                for (let i = 0; i < 50; i++) {
                    particles.push(new Particle(p));
                }
            };

            p.draw = function() {
                p.background(0, 20);
                particles.forEach(particle => {
                    particle.update();
                    particle.display();
                });
            };

            class Particle {
                constructor(p) {
                    this.p = p;
                    this.pos = p.createVector(p.random(p.width), p.random(p.height));
                    this.vel = p5.Vector.random2D().mult(p.random(0.5, 2));
                    this.color = p.random([
                        p.color(30, 144, 255), // #1e90ff
                        p.color(138, 43, 226), // #8a2be2
                        p.color(255, 111, 145) // #ff6f91
                    ]);
                }

                update() {
                    this.pos.add(this.vel);
                    if (this.pos.x < 0 || this.pos.x > this.p.width) this.vel.x *= -1;
                    if (this.pos.y < 0 || this.pos.y > this.p.height) this.vel.y *= -1;
                }

                display() {
                    this.p.noStroke();
                    this.p.fill(this.color);
                    this.p.ellipse(this.pos.x, this.pos.y, 4);
                }
            }
        };
    }

    const topics = ['algorithm', 'os', 'networking', 'ai'];
    topics.forEach(topic => {
        sketches[topic] = new p5(createSketch(topic));
    });

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const topic = card.getAttribute('data-topic');
        card.addEventListener('mouseenter', () => sketches[topic].loop());
        card.addEventListener('mouseleave', () => sketches[topic].noLoop());
    });

    // Resize event listener for responsiveness
    window.addEventListener('resize', () => {
        topics.forEach(topic => {
            const container = document.querySelector(`[data-topic="${topic}"] .animation-container`);
            sketches[topic].resizeCanvas(container.offsetWidth, container.offsetHeight);
        });
    });
});