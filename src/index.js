import "./index.css";
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

let ww = window.innerWidth;
let wh = window.innerHeight;

// colors
const green = 0x00AB6B;
const blue = 0x0F52BA;
const red = 0x800000;
const black = 0x000000;
const white = 0xFFFFFF;
const gray = 0xC3B091;

// Three colors
const blackColor = new THREE.Color(black);
const whiteColor = new THREE.Color(white);

// dna colors
const aColor = red;
const cColor = blue;
const tColor = green;
const gColor = gray;
const backboneColor = black;

// dna settings
// https://www.ncbi.nlm.nih.gov/nuccore/NM_005163
const refSeq = "ctgtggcgcagtgccagctgatgaagacggagcggccccg";
const bpCount = refSeq.length;
const complementMap = {
	a: 't',
	c: 'g',
	t: 'a',
	g: 'c',
}
const leadNucleotides = [];
const lagNucleotides = [];
const nucleotideGap = 3;

// pattern fields
const clock = new THREE.Clock();
const patternCount = 3;
let pattern = 1;
let tIdx, curIdx;
let r, r2;
let bloomedObj;

// bloom settings
const bloomScene = 1;
const bloomStrength = 4;
const bloomThreshold = 0;
const bloomRadius = 0;

const bloomLayer = new THREE.Layers();
bloomLayer.set(bloomScene);

// bloom materials
const materialsBank = {};
const blackMaterial = new THREE.MeshBasicMaterial({ color: black });

// scene
const scene = new THREE.Scene();

// camera
let aspect = ww / wh;
const frustumSize = 60;
const camera = new THREE.OrthographicCamera(
	frustumSize * aspect / - 2,
	frustumSize * aspect / 2,
	frustumSize / 2,
	frustumSize / - 2,
	0.1, 1000);
camera.position.set(0, 0, 50);
camera.lookAt(new THREE.Vector3(0, 0, 0));
camera.position.z = 50;
camera.rotation.z = -10 * Math.PI / 180;

// renderer
const renderer = new THREE.WebGLRenderer({
	antialias: true,
	canvas: document.querySelector("#scene")
});
renderer.setSize(ww, wh);
// renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2;

// render pass
const renderScene = new RenderPass(scene, camera);

// bloom pass
const bloomPass = new UnrealBloomPass(new THREE.Vector2(ww, wh), 1.5, 0.4, 0.85);
bloomPass.threshold = bloomThreshold;
bloomPass.strength = bloomStrength;
bloomPass.radius = bloomRadius;

// bloom composer
const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

// final pass
const finalPass = new ShaderPass(
	new THREE.ShaderMaterial( {
		uniforms: {
			baseTexture: { value: null },
			bloomTexture: { value: bloomComposer.renderTarget2.texture }
		},
		vertexShader: document.getElementById('vertexshader').textContent,
		fragmentShader: document.getElementById('fragmentshader').textContent,
		defines: {}
	} ), 'baseTexture'
);
finalPass.needsSwap = true;

// multisample renderer for antialiasing w/ postprocessing
let size = renderer.getDrawingBufferSize( new THREE.Vector2() );
const renderTarget = new THREE.WebGLRenderTarget( size.width, size.height, { samples: 16 } );

// final composer
const finalComposer = new EffectComposer(renderer, renderTarget);
finalComposer.addPass(renderScene);
finalComposer.addPass(finalPass);

window.addEventListener('resize', resize);

const dnaHolder = new THREE.Object3D();
setupDna();

function setupDna() {
	const bpCountHalf = bpCount / 2;

	const tubeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4.813, 32);
	const ballGeometry = new THREE.SphereGeometry(0.8, 32, 32);

	const materialMap = {
		a: new THREE.MeshBasicMaterial({ color: aColor }),
		c: new THREE.MeshBasicMaterial({ color: cColor }),
		t: new THREE.MeshBasicMaterial({ color: tColor }),
		g: new THREE.MeshBasicMaterial({ color: gColor }),
	};
	const backboneMaterial = new THREE.MeshBasicMaterial({ color: backboneColor });

	const dna = new THREE.Object3D();

	for (let i = 0; i <= bpCount; i++) {
		const leadNucleotide = new THREE.Mesh(tubeGeometry, materialMap[refSeq[i]]);
		leadNucleotide.rotation.z = 90 * Math.PI/180;
		leadNucleotide.rotation.y = 34.846 * Math.PI/180;
		leadNucleotide.position.x = 4.025;
		leadNucleotide.position.z = 1.375;
		leadNucleotides.unshift(leadNucleotide);

		const lagNucleotide = new THREE.Mesh(tubeGeometry, materialMap[complementMap[refSeq[i]]]);
		lagNucleotide.rotation.z = 90 * Math.PI/180;
		lagNucleotide.rotation.y = 34.846 * Math.PI/180;
		lagNucleotide.position.x = 0.075;
		lagNucleotide.position.z = 4.125;
		lagNucleotides.unshift(lagNucleotide);
		
		const leadStrandBackbone = new THREE.Mesh(ballGeometry, backboneMaterial);
		leadStrandBackbone.position.x = 6;

		const lagStrandBackbone = new THREE.Mesh(ballGeometry, backboneMaterial);
		lagStrandBackbone.position.x = -1.9;
		lagStrandBackbone.position.z = 5.5;

		const row = new THREE.Object3D();
		row.add(leadNucleotide);
		row.add(lagNucleotide);
		row.add(leadStrandBackbone);
		row.add(lagStrandBackbone);

		// split dna above and below 0 plane
		if (i < bpCountHalf) {
			row.position.y = -(bpCountHalf - i) * nucleotideGap;
		} else {
			row.position.y = (i - bpCountHalf) * nucleotideGap;
		}
		row.rotation.y = 34.3 * i * Math.PI/180;

		dna.add(row);
	};

	dnaHolder.add(dna)
	scene.add(dnaHolder);

	render();
}

function render() {
	dnaHolder.rotation.y += 0.001;
	renderBloom(true);
}

function renderBloom(bloom) {
	if (bloom) {
		scene.background = blackColor;
		scene.traverse(darkenNonBloomed);
		bloomComposer.render();
		scene.background = whiteColor;
		scene.traverse(restoreMaterial);
		finalComposer.render();
	} else {
		// fallback renderer without bloom pass; primarily for testing
		scene.background = whiteColor;
		renderer.render(scene, camera);
	}
}

function darkenNonBloomed(obj) {
	if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
		materialsBank[obj.uuid] = obj.material;
		obj.material = blackMaterial;
	}
}

function restoreMaterial(obj) {
	if (materialsBank[obj.uuid]) {
		obj.material = materialsBank[obj.uuid];
		delete materialsBank[obj.uuid];
	}
}

function renderPattern() {
	switch (pattern) {
		case 1:
			renderPattern1();
			break;
		case 2:
			renderPattern2();
			break;
		case 3:
			renderPattern3();
		default:
			return;
	}
}

// quickly flash down every bp, random strand
function renderPattern1() {
	tIdx = (clock.getElapsedTime() / 0.03) % bpCount | 0;
	r = Math.random();
	if (tIdx != curIdx) {
		if (bloomedObj) {
			bloomedObj.layers.disable(bloomScene);
		}
		if (r < 0.5) {
			bloomedObj = leadNucleotides[tIdx];
			bloomedObj.layers.enable(bloomScene);
		} else {
			bloomedObj = lagNucleotides[tIdx];
			bloomedObj.layers.enable(bloomScene);
		}
		curIdx = tIdx;
	}
}

// quickly flash down bps with random skips, random strand
function renderPattern2() {
	tIdx = (clock.getElapsedTime() / 0.03) % bpCount | 0;
	r = Math.random();
	if (tIdx != curIdx) {
		if (bloomedObj) {
			bloomedObj.layers.disable(bloomScene);
		}
		if (r < 0.2) {
			bloomedObj = leadNucleotides[tIdx];
			bloomedObj.layers.enable(bloomScene);
		} else if (r < 0.4) {
			bloomedObj = lagNucleotides[tIdx];
			bloomedObj.layers.enable(bloomScene);
		}
		curIdx = tIdx;
	}
}

// slowly flash random bp with random skips, random strand
function renderPattern3() {
	tIdx = ((clock.getElapsedTime() / 0.3) | 0) * 10;
	r = Math.random() | 0;
	// center the flashes to the middle half of the sequence
	r2 = (Math.random() * (bpCount / 2) + (bpCount / 4)) | 0;
	if (tIdx != curIdx) {
		if (bloomedObj) {
			bloomedObj.layers.disable(bloomScene);
		}
		if (r < 0.3) {
			bloomedObj = leadNucleotides[r2];
			bloomedObj.layers.enable(bloomScene);
		} else if (r < 0.6) {
			bloomedObj = lagNucleotides[r2];
			bloomedObj.layers.enable(bloomScene);
		}
		curIdx = tIdx;
	}
}

function manageClock() {
	if (pattern > 0 && clock.getElapsedTime() > (30 * bpCount / 1000)) {
		// end of pattern, set pattern to 0
		clock.start();
		bloomedObj.layers.disable(bloomScene);
		pattern = 0;
	} else if (pattern === 0 && clock.getElapsedTime() > 2) {
		// randomly choose and restart pattern after 2 seconds
		clock.start();
		pattern = Math.ceil(Math.random() * patternCount);
	}
}

function resize() {
	ww = window.innerWidth;
	wh = window.innerHeight;

	aspect = ww / wh;
	camera.left = frustumSize * aspect / - 2;
	camera.right = frustumSize * aspect / 2;
	camera.updateProjectionMatrix();
	renderer.setSize(ww, wh);

	let size = renderer.getDrawingBufferSize( new THREE.Vector2() );
	finalComposer.setSize(size.width, size.height);
};

renderer.setAnimationLoop(() => {
	renderPattern();
	manageClock();
	render();
})
