(function() {
    'use strict';

    const { PI, cos, sin, abs, sqrt, pow, round, random, atan2 } = Math;
    const HALF_PI = 0.5 * PI;
    const TAU = 2 * PI;
    const TO_RAD = PI / 180;
    const rand = n => n * random();
    const fadeInOut = (t, m) => {
        let hm = 0.5 * m;
        return abs((t + hm) % m - hm) / (hm);
    };

    class AmbientPipeline {
        constructor(container) {
            this.container = container;
            this.pipeCount = 30;
            this.pipePropCount = 8;
            this.pipePropsLength = this.pipeCount * this.pipePropCount;
            this.turnCount = 8;
            this.turnAmount = (360 / this.turnCount) * TO_RAD;
            this.turnChanceRange = 58;
            this.baseSpeed = 0.5;
            this.rangeSpeed = 1;
            this.baseTTL = 100;
            this.rangeTTL = 300;
            this.baseWidth = 2;
            this.rangeWidth = 4;
            this.baseHue = 180; // Cyan
            this.rangeHue = 60;  // Shifts to blue
            this.backgroundColor = 'rgba(5, 5, 5, 1)'; // Matches MYNEXT dark background

            this.canvas = null;
            this.ctx = null;
            this.center = [];
            this.tick = 0;
            this.pipeProps = null;

            this.init();
        }

        init() {
            this.createCanvas();
            this.resize();
            this.initPipes();
            this.draw = this.draw.bind(this);
            this.draw();
        }

        createCanvas() {
            this.canvas = {
                a: document.createElement('canvas'),
                b: document.createElement('canvas')
            };
            this.canvas.b.style = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 0;
            `;
            this.container.appendChild(this.canvas.b);
            this.ctx = {
                a: this.canvas.a.getContext('2d'),
                b: this.canvas.b.getContext('2d')
            };
            this.tick = 0;
        }

        resize() {
            if (!this.canvas) return;
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            
            this.canvas.a.width = width;
            this.canvas.a.height = height;

            this.ctx.a.drawImage(this.canvas.b, 0, 0);

            this.canvas.b.width = width;
            this.canvas.b.height = height;
            
            this.ctx.b.drawImage(this.canvas.a, 0, 0);

            this.center[0] = 0.5 * width;
            this.center[1] = 0.5 * height;
        }

        initPipes() {
            this.pipeProps = new Float32Array(this.pipePropsLength);
            for (let i = 0; i < this.pipePropsLength; i += this.pipePropCount) {
                this.initPipe(i);
            }
        }

        initPipe(i) {
            let x = rand(this.canvas.a.width);
            let y = this.center[1];
            let direction = (round(rand(1)) ? HALF_PI : TAU - HALF_PI);
            let speed = this.baseSpeed + rand(this.rangeSpeed);
            let life = 0;
            let ttl = this.baseTTL + rand(this.rangeTTL);
            let width = this.baseWidth + rand(this.rangeWidth);
            let hue = this.baseHue + rand(this.rangeHue);

            this.pipeProps.set([x, y, direction, speed, life, ttl, width, hue], i);
        }

        updatePipes() {
            this.tick++;
            for (let i = 0; i < this.pipePropsLength; i += this.pipePropCount) {
                this.updatePipe(i);
            }
        }

        updatePipe(i) {
            let i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i;
            let x = this.pipeProps[i];
            let y = this.pipeProps[i2];
            let direction = this.pipeProps[i3];
            let speed = this.pipeProps[i4];
            let life = this.pipeProps[i5];
            let ttl = this.pipeProps[i6];
            let width = this.pipeProps[i7];
            let hue = this.pipeProps[i8];

            this.drawPipe(x, y, life, ttl, width, hue);

            life++;
            x += cos(direction) * speed;
            y += sin(direction) * speed;
            let turnChance = !(this.tick % round(rand(this.turnChanceRange))) && (!(round(x) % 6) || !(round(y) % 6));
            let turnBias = round(rand(1)) ? -1 : 1;
            direction += turnChance ? this.turnAmount * turnBias : 0;

            this.pipeProps[i] = x;
            this.pipeProps[i2] = y;
            this.pipeProps[i3] = direction;
            this.pipeProps[i5] = life;

            this.checkBounds(x, y);
            if (life > ttl) {
                this.initPipe(i);
            }
        }

        drawPipe(x, y, life, ttl, width, hue) {
            this.ctx.a.save();
            this.ctx.a.strokeStyle = `hsla(${hue},75%,50%,${fadeInOut(life, ttl) * 0.125})`;
            this.ctx.a.beginPath();
            this.ctx.a.arc(x, y, width, 0, TAU);
            this.ctx.a.stroke();
            this.ctx.a.closePath();
            this.ctx.a.restore();
        }

        checkBounds(x, y) {
            if (x > this.canvas.a.width) x = 0;
            if (x < 0) x = this.canvas.a.width;
            if (y > this.canvas.a.height) y = 0;
            if (y < 0) y = this.canvas.a.height;
        }

        render() {
            this.ctx.b.save();
            this.ctx.b.fillStyle = this.backgroundColor;
            this.ctx.b.fillRect(0,0,this.canvas.b.width,this.canvas.b.height);
            this.ctx.b.restore();

            this.ctx.b.save();
            this.ctx.b.filter = 'blur(12px)'
            this.ctx.b.drawImage(this.canvas.a, 0, 0);
            this.ctx.b.restore();

            this.ctx.b.save();
            this.ctx.b.drawImage(this.canvas.a, 0, 0);
            this.ctx.b.restore();
        }

        draw() {
            this.updatePipes();
            this.render();
            window.requestAnimationFrame(this.draw);
        }
    }

    const instances = [];

    function setup() {
        const containers = document.querySelectorAll('.content--canvas');
        containers.forEach(container => {
            instances.push(new AmbientPipeline(container));
        });
    }

    function handleResize() {
        instances.forEach(instance => instance.resize());
    }

    document.addEventListener('DOMContentLoaded', setup);
    window.addEventListener('resize', handleResize);
})();
