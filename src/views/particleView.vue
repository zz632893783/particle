<template>
    <div class="particle">
        <canvas ref="canvas" :width="canvasSize.width" :height="canvasSize.height"></canvas>
    </div>
</template>
<script>

import P5 from 'p5'
class Factory {
    constructor (x, y) {
        this.x = x
        this.y = y
        // this.radius = radius
        // this.angle = angle
        // this.computePosition()
        this.particles = []
    }
}

class Particle {
    constructor (res, mouseX, mouseY, area = 100, canvasWidth, canvasHeight) {
        this.res = res
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        this.opacity = 1
        this.area = area
        this.angle = Math.random() * 2 * Math.PI
        this.x = mouseX + Math.random() * this.area / 2 * Math.cos(this.angle)
        this.y = mouseY + Math.random() * this.area / 2 * Math.sin(this.angle)
        this.vx = 0
        this.vy = 0
        this.i = Math.round(this.x / this.res)
        this.j = Math.round(this.y / this.res)
        this.l = Math.random() * 100
        this.f = this.l / 10
        this.opacitySpeed = Math.random() * 0.02 + 0.01
    }

    move (ff, mouseX, mouseY) {
        this.opacity = this.opacity - this.opacitySpeed

        this.i = Math.abs(Math.round(this.x / this.res) - 1)
        this.j = Math.abs(Math.round(this.y / this.res) - 1)

        this.angle = ff[this.i][this.j]

        this.vx = this.f * Math.cos(this.angle)
        this.vy = this.f * Math.sin(this.angle)

        this.x = this.x + this.vx
        this.y = this.y + this.vy

        if (
            this.x <= 0 ||
            this.x >= this.canvasWidth ||
            this.y <= 0 ||
            this.y >= this.canvasHeight ||
            this.opacity <= 0 ||
            isNaN(this.x) ||
            isNaN(this.y) ||
            this.x === undefined ||
            this.y === undefined
        ) {
            this.opacity = 1
            this.angle = Math.random() * 2 * Math.PI
            this.x = mouseX + Math.random() * this.area / 2 * Math.cos(this.angle)
            this.y = mouseY + Math.random() * this.area / 2 * Math.sin(this.angle)
            this.vx = 0
            this.vy = 0
            this.i = Math.round(this.x / this.res)
            this.j = Math.round(this.y / this.res)
        }
    }

    show (ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
        // ctx.fillRect(this.x, this.y, 10, 10);
        // ctx.fillRect(this.x, this.y, 0.5, 0.5)
        ctx.fillRect(this.x, this.y, 1, 1)
    }
}

class Dot {
    constructor (centerX, centerY, radius, angle, process = 0, processSpeed = 0.01) {
        this.centerX = centerX
        this.centerY = centerY
        this.radius = radius
        this.angle = angle
        this.angleSpeed = 0.002 * Math.random() * 0.002
        this.process = process
        this.processSpeed = processSpeed
        this.particles = []
        this.ballSize = Math.random() * 4 + 4
        this.computePosition()
        // this.factory = new Factory(centerX, centerY)
    }

    computePosition () {
        this.x = this.centerX + Math.cos(this.angle) * this.radius * this.process
        this.y = this.centerY + Math.sin(this.angle) * this.radius * this.process
    }

    nextState () {
        this.process = this.process + this.processSpeed
        this.process = this.process > 1 ? 0 : this.process
        this.angle = (this.angle + this.angleSpeed) % (2 * Math.PI)
        if (this.process === 0) {
            this.angle = Math.random() * 2 * Math.PI
            this.angleSpeed = 0.002 * Math.random() * 0.002
            this.ballSize = Math.random() * 3 + 3
        }
        this.computePosition()
    }

    show (ctx) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.ballSize, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fillStyle = `rgba(255, 255, 255, ${(1 - Math.cos(this.process * 2 * Math.PI)) * 0.1})`
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        ctx.shadowColor = 'white'
        ctx.fill()
        ctx.fill()
        this.particles.forEach(particle => {
            particle.show(ctx)
        })
    }
}

export default {
    components: {},
    data: function () {
        return {
            p5: null,
            canvasSize: {
                width: 0,
                height: 0
            },
            radius: 256,
            factoryCount: 16,
            res: 10,
            factorys: [],
            time: 0,
            ct: 0,
            perlinNoiseArray: [],
            mouse: {
                x: 100,
                y: 100
            },
            dots: []
        }
    },
    methods: {
        init: function () {
            this.p5 = new P5()
            this.canvasSize.width = window.innerWidth
            this.canvasSize.height = window.innerHeight
            this.ctx = this.$refs.canvas.getContext('2d')
        },
        createFactorys: function () {
            this.factorys = []
            for (let i = 0; i < this.factoryCount; i++) {
                const angle = i / this.factoryCount * Math.PI * 2
                const x = Math.cos(angle) * this.radius + this.canvasSize.width / 2
                const y = Math.sin(angle) * this.radius + this.canvasSize.height / 2
                this.factorys.push(new Factory(x, y))
            }
            this.dots = []
            for (let i = 0; i < 4; i++) {
                const angle = Math.random() * Math.PI * 2
                const processSpeed = 0.02
                this.dots.push(new Dot(this.canvasSize.width / 2, this.canvasSize.height / 2, this.radius, angle, Math.random(), processSpeed))
            }
        },
        createParticles: function () {
            this.factorys.forEach(factory => {
                factory.particles = []
                for (let i = 0; i < 100; i++) {
                    factory.particles.push(new Particle(this.res, factory.x, factory.y, 100, this.canvasSize.width, this.canvasSize.height))
                }
            })
            this.dots.forEach(dot => {
                for (let i = 0; i < 100; i++) {
                    dot.particles.push(new Particle(this.res, dot.x, dot.y, 10, this.canvasSize.width, this.canvasSize.height))
                }
            })
        },
        draw: function () {
            this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height)
            this.factorys.forEach(factory => {
                factory.particles.forEach(particle => {
                    particle.show(this.ctx)
                })
            })
            this.dots.forEach(dot => {
                dot.show(this.ctx)
            })
        },
        computeNextState: function () {
            const cols = Math.floor(this.canvasSize.width / this.res) + 1
            const rows = Math.floor(this.canvasSize.height / this.res) + 1
            const res = this.res
            const scl = 0.5
            this.perlinNoiseArray = new Array(cols)
            for (let i = 0; i < cols; i++) {
                this.perlinNoiseArray[i] = new Array(rows)
                for (let j = 0; j < rows; j++) {
                    window.noiseDetail(0, 0)
                    this.perlinNoiseArray[i][j] = window.noise(scl * i / res, scl * j / res, this.time) * 5 * Math.PI
                }
            }
            this.time = this.time + 0.01
            this.ct = window.noise(this.time) * 5
            this.factorys.forEach(factory => {
                factory.particles.forEach(particle => {
                    particle.move(this.perlinNoiseArray, factory.x, factory.y)
                })
            })
            this.dots.forEach(dot => {
                dot.nextState()
                dot.particles.forEach(particle => {
                    particle.move(this.perlinNoiseArray, dot.x, dot.y)
                })
            })
        },
        setAnimation: function () {
            window.cancelAnimationFrame(window.animation)
            window.animation = window.requestAnimationFrame(this.setAnimation)
            this.draw()
            this.computeNextState()
        }
    },
    mounted: function () {
        this.init()
        this.createFactorys()
        this.createParticles()
        this.setAnimation()
    }
}

</script>
<style lang="stylus" scoped>
.particle {
    font-size: 0;
    height: 100vh;
    background-color: rgba(6, 20, 36, 1);
}
</style>
