/* global THREE */

global.THREE = require('three')
const TWEEN = require('@tweenjs/tween.js')
require('three/examples/js/controls/OrbitControls')

const { Viewer, Entity } = require('../viewer')

class ThreeViewer {
  constructor(socket, canvas) {
    this.socket = socket
    this.canvas = canvas
    this.firstPositionUpdate = true
    this.controls = null
    this.botMesh = null
    this.viewer = null
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas })
    this.init()
  }

  init() {
    this.renderer.setPixelRatio(window.devicePixelRatio || 1)
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.viewer = new Viewer(this.renderer)
    this.controls = new THREE.OrbitControls(this.viewer.camera, this.renderer.domElement)

    window.addEventListener('resize', this.onWindowResize.bind(this))

    this.socket.on('version', (version) => this.onVersionReceived(version))
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this))
    if (this.controls) this.controls.update()
    this.viewer.update()
    this.renderer.render(this.viewer.scene, this.viewer.camera)
  }

  onWindowResize() {
    this.viewer.camera.aspect = window.innerWidth / window.innerHeight
    this.viewer.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  onVersionReceived(version) {
    if (!this.viewer.setVersion(version)) {
      return false
    }

    this.firstPositionUpdate = true
    this.viewer.listen(this.socket)

    this.socket.on('position', ({ pos, addMesh, yaw, pitch }) => this.onPositionReceived(pos, addMesh, yaw, pitch))
  }

  onPositionReceived(pos, addMesh, yaw, pitch) {
    if (yaw !== undefined && pitch !== undefined) {
      if (this.controls) {
        this.controls.dispose()
        this.controls = null
      }
      this.viewer.setFirstPersonCamera(pos, yaw, pitch)
      return
    }
    if (pos.y > 0 && this.firstPositionUpdate) {
      this.controls.target.set(pos.x, pos.y, pos.z)
      this.viewer.camera.position.set(pos.x, pos.y + 20, pos.z + 20)
      this.controls.update()
      this.firstPositionUpdate = false
    }
    if (addMesh) {
      if (!this.botMesh) {
        this.botMesh = new Entity('1.16.4', 'player', this.viewer.scene).mesh
        this.viewer.scene.add(this.botMesh)
      }
      new TWEEN.Tween(this.botMesh.position).to({ x: pos.x, y: pos.y, z: pos.z }, 50).start()

      const da = (yaw - this.botMesh.rotation.y) % (Math.PI * 2)
      const dy = 2 * da % (Math.PI * 2) - da
      new TWEEN.Tween(this.botMesh.rotation).to({ y: this.botMesh.rotation.y + dy }, 50).start()
    }
  }
}

module.exports = ThreeViewer
