const PreviewObjects = {}

class PreviewObject {
	static all = {}
	static active;

	constructor(id, geometry) {
		this.id = id;
		this.geometry = geometry;
		geometry.computeVertexNormals(true);
		PreviewObjects[id] = this;
	}
	setActive() {
		PreviewObject.active = this;
		Canvas.updateGeometry();
	}
}

const Canvas = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera( 45, 200 / 200, 1, 1000 ),
	// camera: new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 ),
	renderer: new THREE.WebGLRenderer({alpha: true,antialias: true}),
	setup() {
		this.renderer.setSize( 200, 200 );
		this.renderer.domElement.classList.add('checker');
		document.body.appendChild( this.renderer.domElement );

		const material = new THREE.ShaderMaterial({
			uniforms: {
				ScreenSize: { value: Canvas.renderer.getSize(Reuseable.vec2) }
			},
			vertexShader: 
			`
			varying vec2 vUv;
			varying vec3 vNormal;
			varying vec3 vPos;
			varying vec3 vNormalView;
			varying vec3 vView;
			varying vec3 vPositionView;

			void main() {
				vUv = uv;
				vNormal = normal;
				vPos = position;
				vPositionView = vec3( modelViewMatrix * vec4(vPos, 0.0) );
				vNormalView = vec3( modelViewMatrix * vec4(vNormal, 0.0) );

				vView = vec3(modelViewMatrix[0][2], modelViewMatrix[1][2], modelViewMatrix[2][2]);

				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );	
				gl_Position = projectionMatrix * mvPosition;
			}`,
		});
		material.shading = THREE.SmoothShading;
		material.flatShading = false;

		this.object = new THREE.Mesh(undefined, material);

		this.scene.add(this.object);
		this.animate();

		onMouseDownMove(this.renderer.domElement, 'auto', null, e => {
			this.moveX(e.movementX);
			this.moveY(e.movementY);
		})
	},
	moveX(offset) {
		const angle = Math.degToRad(offset);
		const vec3 = Reuseable.vec3.set(0,1,0);

		this.object.rotateOnWorldAxis(vec3, angle);
	},
	moveY(offset) {
		const angle = Math.degToRad(offset);
		const vec3 = Reuseable.vec3.set(1,0,0);

		this.object.rotateOnWorldAxis(vec3, angle);
	},
	updateGeometry() {
		this.object.geometry = PreviewObject.active.geometry;
		return this;
	},
	setShaders(fragment) {
		this.object.material.fragmentShader = fragment;
		this.object.material.needsUpdate = true;
	},
	animate() {
		requestAnimationFrame(() => this.animate());
		try {
			this.renderer.render( this.scene, this.camera );
			this.renderer.domElement.style.background = '';
		} catch (error) {
			this.renderer.domElement.style.background = 'red';
		}
	},
	preview() {
		const fragment = Compiler.compile();
		
		Canvas.setShaders( fragment );
	}
}
Canvas.setup();

new PreviewObject('plane', new THREE.PlaneBufferGeometry( 2, 2 ))
new PreviewObject('block', new THREE.BoxBufferGeometry( 2, 2, 2, 2, 2, 2 ))
new PreviewObject('sphere', new THREE.SphereBufferGeometry(1,32,16))
new PreviewObject('torus', new THREE.TorusBufferGeometry(1, .5, 16, 32)).setActive();

Canvas.camera.position.z = 5;

const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 100, 1000, 100 );

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;
Canvas.scene.add( spotLight );

const spotLight2 = new THREE.SpotLight( 0xffffff );
spotLight2.position.set( 100, -1000, 100 );
spotLight2.rotation.x = Math.PI;

spotLight2.castShadow = true;

spotLight2.shadow.mapSize.width = 1024;
spotLight2.shadow.mapSize.height = 1024;

spotLight2.shadow.camera.near = 500;
spotLight2.shadow.camera.far = 4000;
spotLight2.shadow.camera.fov = 30;
Canvas.scene.add( spotLight2 );1