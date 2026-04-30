// --- AUDIO MENDEL & SYSTEM ---
let audioCtx;

// [ PENGATURAN SUARA MENDEL (SEMUA TEXT) ] =======================
// Ganti teks di dalam tanda kutip dengan nama file .mp3 mu!
// Biarkan kosong ('') kalau belum ada file suaranya.
const MENDEL_VOICES = {
    START: 'voice_start.mp3',               // "Tahun 1854. Uskup mendesakku..."
    TO_GARDEN: 'voice_to_garden.mp3',       // "Aku akan melepaskan tikus ini..."
    GARDEN_INIT: 'voice_garden_init.mp3',   // "Tahun 1855. Kebun biara..."
    EXPERIMENT_F1: 'voice_exp_f1.mp3',      // "Tahun 1856. Panen F1..."
    EXPERIMENT_F2: 'voice_exp_f2.mp3',      // "Eureka! Di F2, sifat Putih..."
    TO_PRESENTATION: 'voice_to_presentation.mp3', // "Aku merumuskan Hukum..."
    PRESENTATION: 'voice_presentation.mp3', // "Tahun 1865. Mereka semua diam..."
    HOSPITAL: 'voice_hospital.mp3',         // "Tahun 1884. Ginjal dan jantungku..."
    ENDING_LIGHT: 'suara_mendel.mp3'        // "Meine Zeit wird schon kommen..."
};

let currentVoiceObj = null;
let lastSpokenState = null;

function playMendelVoice(stateKey) {
    // Kalau ada suara yang masih jalan, STOP paksa (cut)
    if (currentVoiceObj) {
        currentVoiceObj.pause();
        currentVoiceObj.currentTime = 0;
    }
    
    // Ambil file suara sesuai state sekarang
    const voiceFile = MENDEL_VOICES[stateKey];
    if (voiceFile && voiceFile !== '') {
        currentVoiceObj = new Audio(voiceFile);
        // Play suara, kalau error (misal file ga ada), di-skip otomatis
        currentVoiceObj.play().catch(err => console.log("File audio belum ada:", err)); 
    }
}
// ================================================================

function playTone(freq, type, duration) {
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
}

// --- SETUP THREE.JS ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.7, 2); 

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// AKTIFKAN BAYANGAN
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

// --- PENCAHAYAAN DASAR ---
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3); 
scene.add(hemiLight);

const sun = new THREE.DirectionalLight(0xfff5e6, 0); 
sun.position.set(20, 50, 30); 
scene.add(sun);

// SISTEM CAHAYA INTERIOR
const roomLamp = new THREE.SpotLight(0xffaa00, 2, 10, Math.PI / 3, 0.5);
roomLamp.position.set(0, 3.5, -2);
roomLamp.target.position.set(0, 0, -3);
roomLamp.castShadow = true;
roomLamp.shadow.mapSize.width = 1024;
roomLamp.shadow.mapSize.height = 1024;
roomLamp.shadow.bias = -0.002;
scene.add(roomLamp);
scene.add(roomLamp.target);

const pointLamp = new THREE.PointLight(0xffaa00, 0, 15);
pointLamp.castShadow = true;
pointLamp.shadow.mapSize.width = 1024;
pointLamp.shadow.mapSize.height = 1024;
pointLamp.shadow.bias = -0.002;
scene.add(pointLamp);

const roomGroup = new THREE.Group();
const gardenGroup = new THREE.Group();
const hallGroup = new THREE.Group();
const hospGroup = new THREE.Group(); 
scene.add(roomGroup, gardenGroup, hallGroup, hospGroup);

// 1. RUANGAN MENDEL
const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({color: 0x3d2b1f, roughness: 0.9}));
floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01; 
floor.receiveShadow = true; 
roomGroup.add(floor);

const walls = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), new THREE.MeshStandardMaterial({color: 0x808080, side: THREE.BackSide, roughness: 1}));
walls.position.y = 2.5; 
roomGroup.add(walls);

const desk = new THREE.Mesh(new THREE.BoxGeometry(2, 0.75, 1), new THREE.MeshStandardMaterial({color: 0x2b1d0e, roughness: 0.7}));
desk.position.set(0, 0.375, -3); 
desk.castShadow = true; desk.receiveShadow = true; 
roomGroup.add(desk);

const cage = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.5), new THREE.MeshStandardMaterial({color: 0xaaaaaa, wireframe: true}));
cage.position.set(0, 1.0, -3); 
cage.castShadow = true; 
roomGroup.add(cage);

const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), new THREE.MeshStandardMaterial({color: 0xdddddd, roughness: 0.5}));
mouse.position.set(0, 0.85, -3); 
mouse.castShadow = true; 
roomGroup.add(mouse);

const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2, 0.4, 4), new THREE.MeshStandardMaterial({color: 0x3e2723, roughness: 0.8}));
bedFrame.position.set(3.5, 0.2, 0); roomGroup.add(bedFrame);
const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 3.8), new THREE.MeshStandardMaterial({color: 0xdddddd, roughness: 0.9}));
mattress.position.set(3.5, 0.5, 0); roomGroup.add(mattress);

const lampHanger = new THREE.Group();
const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.5), new THREE.MeshStandardMaterial({color: 0x111111})); cord.position.y = 4.25; lampHanger.add(cord);
const shade = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.4, 8), new THREE.MeshStandardMaterial({color: 0x333333, side: THREE.DoubleSide})); shade.position.y = 3.6; shade.rotation.x = Math.PI; lampHanger.add(shade);
const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xffaa00, emissiveIntensity: 2})); bulb.position.y = 3.5; lampHanger.add(bulb);
roomGroup.add(lampHanger);

// 2. KEBUN & GEDUNG BIARA
const soilGround = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({color: 0x223311, roughness: 1}));
soilGround.rotation.x = -Math.PI/2; 
soilGround.receiveShadow = true; 
gardenGroup.add(soilGround);

const abbeyGroup = new THREE.Group(); gardenGroup.add(abbeyGroup);
const mainHall = new THREE.Mesh(new THREE.BoxGeometry(40, 15, 12), new THREE.MeshStandardMaterial({color: 0xd3c2b0, roughness: 0.9}));
mainHall.position.set(0, 7.5, 0); abbeyGroup.add(mainHall);

const winMat = new THREE.MeshStandardMaterial({color: 0x050505, roughness: 0.1, metalness: 0.8}); 
for(let i = -3; i <= 3; i++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 3.5), winMat);win.position.set(i * 5, 8, 6.01); abbeyGroup.add(win);
}

function createScienceTower(x) {
    const tower = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 25, 32), new THREE.MeshStandardMaterial({color: 0xc3b2a0, roughness: 0.9})); base.position.y = 12.5; tower.add(base);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(4.2, 10, 32), new THREE.MeshStandardMaterial({color: 0x5c4033, roughness: 0.8})); spire.position.y = 30; tower.add(spire);
    tower.position.set(x, 0, 4); abbeyGroup.add(tower);
}
createScienceTower(-18); createScienceTower(18);

const door = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), new THREE.MeshStandardMaterial({color: 0x3e2723, roughness: 0.6})); door.position.set(0, 3, 6.01); abbeyGroup.add(door);
const path = new THREE.Mesh(new THREE.PlaneGeometry(4, 70), new THREE.MeshStandardMaterial({color: 0x5a5040, roughness: 0.8})); path.rotation.x = -Math.PI / 2; path.position.set(0, 0.02, 40); gardenGroup.add(path);

const wallMat = new THREE.MeshStandardMaterial({color: 0x8b5a2b, roughness: 0.9});
const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 80), wallMat); wallLeft.position.set(-20, 2, 40); gardenGroup.add(wallLeft);
const wallRight = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 80), wallMat); wallRight.position.set(20, 2, 40); gardenGroup.add(wallRight);
const wallBack = new THREE.Mesh(new THREE.BoxGeometry(40, 4, 1), wallMat); wallBack.position.set(0, 2, 80); gardenGroup.add(wallBack);

const ghGroup = new THREE.Group();
const glassMat = new THREE.MeshPhysicalMaterial({color: 0xffffff, metalness: 0.1, roughness: 0.1, transmission: 0.8, transparent: true, opacity: 1}); 
const ghFrame = new THREE.Mesh(new THREE.BoxGeometry(16, 5, 12), glassMat); ghFrame.position.set(0, 2.5, 45); 
const ghWire = new THREE.Mesh(new THREE.BoxGeometry(16, 5, 12), new THREE.MeshStandardMaterial({color: 0x222222, wireframe: true})); 
ghWire.position.copy(ghFrame.position); ghGroup.add(ghFrame, ghWire); gardenGroup.add(ghGroup);

const tilledMat = new THREE.MeshStandardMaterial({color: 0x3e2723, roughness: 1}); 
const bedLeftSoil = new THREE.Mesh(new THREE.BoxGeometry(5, 0.25, 10), tilledMat); bedLeftSoil.position.set(-4.5, 0.125, 45); bedLeftSoil.receiveShadow = true; gardenGroup.add(bedLeftSoil);
const bedRightSoil = new THREE.Mesh(new THREE.BoxGeometry(5, 0.25, 10), tilledMat); bedRightSoil.position.set(4.5, 0.125, 45); bedRightSoil.receiveShadow = true; gardenGroup.add(bedRightSoil);

function createTree(x, z) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 4, 12), new THREE.MeshStandardMaterial({color: 0x4b3621, roughness: 0.9})); trunk.position.y = 2; tree.add(trunk);
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 16), new THREE.MeshStandardMaterial({color: 0x1e5631, roughness: 0.8})); leaves.position.y = 5; tree.add(leaves);
    tree.position.set(x, 0, z); trunk.castShadow = true; leaves.castShadow = true; gardenGroup.add(tree);
}
createTree(-12, 20); createTree(12, 30); createTree(-15, 55); createTree(15, 65); createTree(0, 70); createTree(-5, 75);

const grassBladeMat = new THREE.MeshStandardMaterial({color: 0x2e7d32, side: THREE.DoubleSide, roughness: 1});
for (let i = 0; i < 500; i++) {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3 + Math.random() * 0.3, 3), grassBladeMat);
    const gx = (Math.random() - 0.5) * 40; 
    const gz = Math.random() * 80;
    if(Math.abs(gx) > 2.5 && gz < 78 && Math.abs(gz - 45) > 6) { blade.position.set(gx, 0.1, gz); blade.rotation.y = Math.random() * Math.PI; gardenGroup.add(blade); }
}
gardenGroup.visible = false;

// 3. RUANG SIDANG & ALAT SCIENCE
const hallFloor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({color: 0x111111, roughness: 0.5})); hallFloor.rotation.x = -Math.PI/2; hallGroup.add(hallFloor);
hallGroup.visible = false;

const scienceTable = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 2.5), new THREE.MeshStandardMaterial({color: 0x2b1d0e, roughness: 0.6})); scienceTable.position.set(0, 0.6, -4); scienceTable.castShadow = true; hallGroup.add(scienceTable);
const podium = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshStandardMaterial({color: 0x442200, roughness: 0.7})); podium.position.set(-2, 0.75, -4); podium.castShadow = true; hallGroup.add(podium);

const microscope = new THREE.Group(); microscope.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16), new THREE.MeshStandardMaterial({color: 0x7f8c8d, metalness: 0.8, roughness: 0.2}))); microscope.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.2), new THREE.MeshStandardMaterial({color: 0x111111, roughness: 0.5}))); microscope.position.set(0, 1.45, -4); microscope.castShadow = true; hallGroup.add(microscope);
const flask = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.05, 0.4, 16), new THREE.MeshPhysicalMaterial({color: 0x8b0000, transmission: 0.9, transparent: true, roughness: 0.1})); flask.position.set(1, 1.4, -4); hallGroup.add(flask);

const chairMat = new THREE.MeshStandardMaterial({color: 0x221100, roughness: 1});
const juryGroup = new THREE.Group(); 
const juryTable = new THREE.Mesh(new THREE.BoxGeometry(10, 1.1, 1.5), new THREE.MeshStandardMaterial({color: 0x1d1d1d, roughness: 0.8})); juryTable.position.set(8.5, 0.55, -4); juryTable.rotation.y = Math.PI/2; juryTable.castShadow = true; juryGroup.add(juryTable);
for(let i=0; i<4; i++){
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), chairMat); chair.position.set(9.5, 0.3, -8 + i*2.5); chair.castShadow = true; juryGroup.add(chair);
    if(Math.random()>0.3){ const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), new THREE.MeshStandardMaterial({color: 0xeeeeee, side: THREE.DoubleSide})); paper.rotation.x = -Math.PI/2; paper.rotation.z = Math.random(); paper.position.set(8.5 + (Math.random()-0.5)*0.5, 1.11, -8 + i*2.5); juryGroup.add(paper); }
    if(Math.random()>0.5){ const ink = new THREE.Group(); ink.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1),winMat)); ink.add(new THREE.Mesh(new THREE.PlaneGeometry(0.01,0.5), chairMat)); ink.position.set(8.3, 1.1, -8.5 + i*2.5); juryGroup.add(ink); }
}
hallGroup.add(juryGroup);

// 4. RUMAH SAKIT
const hospFloor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({color: 0xbdc3c7, roughness: 0.8})); 
hospFloor.rotation.x = -Math.PI/2; hospFloor.position.y = 0.01; 
hospFloor.receiveShadow = true; 
hospGroup.add(hospFloor);

const hospWalls = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), new THREE.MeshStandardMaterial({color: 0xecf0f1, side: THREE.BackSide, roughness: 0.9})); 
hospWalls.position.y = 2.5; 
hospWalls.receiveShadow = true; 
hospGroup.add(hospWalls);

const hospBed = new THREE.Group();
for(let i=0; i<4; i++){
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 16), new THREE.MeshStandardMaterial({color: 0x34495e, metalness: 0.6, roughness: 0.4})); leg.position.set((i<2?-1:1)*0.9, 0.4, (i%2==0?-2:2)*1.2); 
    leg.castShadow = true; 
    hospBed.add(leg);
}
const hospMatMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 4.5), new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.9})); hospMatMesh.position.set(0, 0.9, 0); 
hospMatMesh.castShadow = true; hospMatMesh.receiveShadow = true;
hospBed.add(hospMatMesh);
hospGroup.add(hospBed);

const medicineTable = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), new THREE.MeshStandardMaterial({color: 0x5c4033, roughness: 0.7})); medicineTable.position.set(-2, 0.6, 1); 
medicineTable.castShadow = true; medicineTable.receiveShadow = true; 
hospGroup.add(medicineTable);
const bottleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 16), new THREE.MeshPhysicalMaterial({color: 0x27ae60, transmission: 0.8, transparent: true, roughness: 0.1})); bottleMesh.position.set(-2, 1.35, 1); 
bottleMesh.castShadow = true; 
hospGroup.add(bottleMesh);

const crossVert = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.05), new THREE.MeshStandardMaterial({color: 0x3e2723, roughness: 1})); crossVert.position.set(0, 3, -4.9); 
crossVert.castShadow = true; 
hospGroup.add(crossVert);
const crossHorizMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.05), crossVert.material); crossHorizMesh.position.set(0, 3.25, -4.9); 
crossHorizMesh.castShadow = true;
hospGroup.add(crossHorizMesh);

const visitorChairMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), chairMat); visitorChairMesh.position.set(-2, 0.25, 0); 
visitorChairMesh.castShadow = true;
hospGroup.add(visitorChairMesh);
const rug = new THREE.Mesh(new THREE.PlaneGeometry(3, 5), new THREE.MeshStandardMaterial({color: 0x6e2a16, roughness: 1})); rug.rotation.x = -Math.PI/2; rug.position.set(0, 0.015, -1); rug.receiveShadow = true; hospGroup.add(rug);

hospGroup.visible = false;

// --- GAME LOGIC ---
let plants = [];
function addPlant(x, z, h, fCol, group) {
    const p = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, h, 8), new THREE.MeshStandardMaterial({color: 0x2e7d32})); stem.position.y = h/2; p.add(stem);
    if(fCol) { const flower = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshStandardMaterial({color: fCol})); flower.position.y = h; p.add(flower); }
    p.position.set(x, 0, z); group.add(p); plants.push(p);
}
function clearPlants() { plants.forEach(p => p.parent.remove(p)); plants = []; }

let gameStarted = false;
const pauseMenu = document.getElementById('pause-menu'); const menuTitle = document.getElementById('menu-title'); const menuDesc = document.getElementById('menu-desc'); const hudDisp = document.getElementById('hud'); const uiContainer = document.getElementById('ui-container'); const fadeOverlay = document.getElementById('fade-overlay'); const timeSkipText = document.getElementById('timeskip-text'); const mathOverlay = document.getElementById('math-overlay'); const mathContent = document.getElementById('math-content'); let count = 0; let timer;

pauseMenu.addEventListener('click', () => { 
    if(state === "ENDING_LIGHT") return; 
    gameStarted = true; 
    pauseMenu.style.display = 'none'; 
    uiContainer.style.display = 'block'; 
    hudDisp.style.display = 'block'; 
    if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); 
    const requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
    if(requestPointerLock) { try { requestPointerLock.call(document.body); } catch(e) {} }

    // Trigger audio START saat pertama kali diklik (karena browser blokir autoplay kalau belum ada klik user)
    if (lastSpokenState === null) {
        lastSpokenState = "START";
        playMendelVoice("START");
    }
});

document.addEventListener('pointerlockchange', () => { 
    const isLocked = document.pointerLockElement === document.body || document.mozPointerLockElement === document.body;
    if (!isLocked && gameStarted && state !== "ENDING_LIGHT") { 
        gameStarted = false; pauseMenu.style.display = 'flex'; 
        menuTitle.innerText = "PAUSED"; menuTitle.style.color = "#e74c3c"; menuDesc.innerText = "Eksperimen sedang dihentikan sementara."; 
        uiContainer.style.display = 'none'; hudDisp.style.display = 'none'; 
    } 
});

const euler = new THREE.Euler(0, 0, 0, 'YXZ');
document.addEventListener('mousemove', (e) => { if (gameStarted && state !== "ENDING_LIGHT") { euler.setFromQuaternion(camera.quaternion); euler.y -= e.movementX * 0.002; euler.x -= e.movementY * 0.002; euler.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, euler.x)); camera.quaternion.setFromEuler(euler); } });

let moveF = false, moveB = false, moveL = false, moveR = false;
document.addEventListener('keydown', (e) => { if(e.code === 'KeyW') moveF = true; if(e.code === 'KeyS') moveB = true; if(e.code === 'KeyA') moveL = true; if(e.code === 'KeyD') moveR = true; if(e.code === 'KeyE') handleE(); });
document.addEventListener('keyup', (e) => { if(e.code === 'KeyW') moveF = false; if(e.code === 'KeyS') moveB = false; if(e.code === 'KeyA') moveL = false; if(e.code === 'KeyD') moveR = false; });

let state = "START";
const JOURNALS = { START: { txt: "Tahun 1854. Uskup mendesakku berhenti meneliti tikus. Tidak pantas, katanya.", act: "[E] Tatap Tikus Terakhir", hud: "Kamar Mendel | 1854" }, TO_GARDEN: { txt: "Aku akan melepaskan tikus ini dan pindah ke kebun. Bunga Pisum sativum akan jadi subjek baruku.", act: "[E] Masuk Kebun Biara", hud: "Kamar Mendel | 1854" }, GARDEN_INIT: { txt: "Tahun 1855. Kebun biara St. Thomas rimbun. Aku menanam kacang polong galur murni.", act: "[E] Silangkan Kacang (Ungu x Putih)", hud: "Kebun Biara | 1855" }, EXPERIMENT_F1: { txt: "Tahun 1856. Panen F1. Aneh, kenapa semua bunganya Ungu? Putih lenyap.", act: "[E] Biarkan F1 Menyerbuk Sendiri", hud: "Kebun Biara | 1856" }, EXPERIMENT_F2: { txt: "Eureka! Di F2, sifat Putih muncul kembali! Sifat resesif tidak hilang, hanya tertutup.", act: "[E] Hitung Rasio di Jurnal", hud: "Kebun Biara | 1858" }, TO_PRESENTATION: { txt: "Aku merumuskan Hukum Pewarisan Sifat. Waktunya berbagi dengan dunia.", act: "[E] Pergi Presentasi (1865)", hud: "Kebun Biara | 1865" }, PRESENTATION: { txt: "Tahun 1865. Mereka semua diam di Ruang Sidang. Tidak ada pertanyaan, tidak mengerti matematika di balik biologi.", act: "[E] Waktu Berlalu...", hud: "Ruang Sidang | 1865" }, HOSPITAL: { txt: "Tahun 1884. Ginjal dan jantungku lelah. Terlupakan di kamar perawatan.", act: "[E] Tatap Cahaya Terakhir", hud: "POV Berbaring | 1884" } };

function handleE() { 
    if (!gameStarted) return; 
    playTone(440, 'sine', 0.1); 
    
    if(state === "START") state = "TO_GARDEN"; 
    else if(state === "TO_GARDEN") { 
        fadeOverlay.style.opacity = 1; 
        setTimeout(() => { 
            state = "GARDEN_INIT"; roomGroup.visible = false; gardenGroup.visible = true; 
            roomLamp.intensity = 0; pointLamp.intensity = 0; sun.intensity = 1.3; 
            scene.background.setHex(0x87ceeb); camera.position.set(0, 1.7, 12); fadeOverlay.style.opacity = 0; updateUI(); 
        }, 1500); 
    } 
    else if(state === "GARDEN_INIT") { 
        state = "EXPERIMENT_F1"; clearPlants(); 
        for(let i=0; i<6; i++) addPlant(-4.5, 42 + i, 2, 0x8e44ad, gardenGroup); 
        for(let i=0; i<6; i++) addPlant(4.5, 42 + i, 0.6, 0xffffff, gardenGroup); 
    } 
    else if(state === "EXPERIMENT_F1") { 
        fadeOverlay.style.backgroundColor = "white"; fadeOverlay.style.opacity = 1; playTone(660, 'sine', 0.5); 
        setTimeout(() => { 
            timeSkipText.style.opacity = 1; 
            setTimeout(() => { 
                state = "EXPERIMENT_F2"; clearPlants(); 
                for(let i=0; i<6; i++) addPlant(-4.5, 42 + i, 2, 0x8e44ad, gardenGroup); 
                for(let i=0; i<6; i++) addPlant(4.5, 42 + i, 2, 0x8e44ad, gardenGroup); 
                mathOverlay.style.display = 'block'; count = 0; 
                timer = setInterval(() => { 
                    if(gameStarted) count += 15; 
                    mathContent.innerHTML = `Dominan (Ungu): ${Math.floor(count*0.75)}<br>Resesif (Putih): ${Math.floor(count*0.25)}<br>Rasio: 3 : 1`; 
                    if(count > 800) clearInterval(timer); 
                }, 50); 
                updateUI(); 
                setTimeout(() => { 
                    timeSkipText.style.opacity = 0; fadeOverlay.style.opacity = 0; 
                    setTimeout(() => { fadeOverlay.style.backgroundColor = "black"; }, 1000); 
                }, 2000); 
            }, 1000); 
        }, 500); 
    } 
    else if(state === "EXPERIMENT_F2") { state = "TO_PRESENTATION"; mathOverlay.style.display = 'none'; } 
    else if(state === "TO_PRESENTATION") { 
        fadeOverlay.style.opacity = 1; 
        setTimeout(() => { 
            state = "PRESENTATION"; gardenGroup.visible = false; hallGroup.visible = true; 
            scene.background.setHex(0x050505); sun.intensity = 0; roomLamp.intensity = 0; pointLamp.intensity = 1; pointLamp.position.set(0, 3, -4); 
            camera.position.set(0, 1.7, -2); fadeOverlay.style.opacity = 0; updateUI(); 
        }, 1500); 
    } 
    else if(state === "PRESENTATION") { 
        fadeOverlay.style.opacity = 1; 
        setTimeout(() => { 
            state = "HOSPITAL"; hallGroup.visible = false; hospGroup.visible = true; 
            pointLamp.intensity = 0.5; pointLamp.position.set(-2, 2, 1); 
            camera.position.set(0, 1.45, 1.8); camera.rotation.set(-0.15, 0, 0); fadeOverlay.style.opacity = 0; updateUI(); 
        }, 1500); 
    } 
    else if(state === "HOSPITAL") { 
        fadeOverlay.style.backgroundColor = "white"; fadeOverlay.style.opacity = 1; playTone(880, 'sine', 4.0); 
        
        setTimeout(() => { 
            state = "ENDING_LIGHT"; 
            try { document.exitPointerLock(); } catch(e){} 
            
            pauseMenu.style.display = 'flex'; 
            pauseMenu.style.background = 'white'; 
            
            menuTitle.innerText = "BAPAK GENETIKA MODERN"; 
            menuTitle.style.color = "#2c3e50"; 
            menuTitle.style.textShadow = "none"; 
            
            menuDesc.innerHTML = `<span style='font-size: 1.5em; font-weight: bold;'>GREGOR JOHANN MENDEL</span><br>(1822 - 1884)<br><br><i>"Meine Zeit wird schon kommen."<br>(Waktuku pasti akan tiba).</i><br><br><b>Mengenang 142 Tahun Kematian Gregor Johann Mendel</b><br><br><span style='font-size: 0.85em; font-style: italic; color: #555;'>"Karena Tuhanlah yang memberikan hikmat, dari mulut-Nya datang pengetahuan dan kepandaian."<br>- Amsal 2:6</span>`; 
            menuDesc.style.color = "#34495e"; 
            
            document.getElementById('menu-prompt').style.display = "none"; 
            document.getElementById('menu-controls').style.display = "none"; 
            uiContainer.style.display = "none"; 
            hudDisp.style.display = "none"; 
            
            // Panggil ini biar audio Mendel pas ending jalan
            updateUI();
        }, 3000); 
        
    } updateUI(); 
}

function updateUI() { 
    if(state === "ENDING_LIGHT") {
        if (lastSpokenState !== state) {
            lastSpokenState = state;
            playMendelVoice(state);
        }
        return; 
    } 
    const d = JOURNALS[state]; 
    document.getElementById('story-text').innerText = d.txt; 
    document.getElementById('action-area').innerText = d.act; 
    hudDisp.innerText = d.hud; 
    
    // Putar suara baru jika state berganti, potong yang sebelumnya
    if (lastSpokenState !== state && lastSpokenState !== null) {
        lastSpokenState = state;
        playMendelVoice(state);
    }
}

const velocity = new THREE.Vector3(); const clock = new THREE.Clock(); let totalTime = 0; 

roomGroup.visible = true; gardenGroup.visible = false; hallGroup.visible = false; hospGroup.visible = false; roomLamp.intensity = 2; pointLamp.intensity = 0; updateUI();

function animate() {
    requestAnimationFrame(animate); const delta = clock.getDelta();
    totalTime += delta;
    if (roomGroup.visible) { mouse.position.x = Math.sin(totalTime * 6) * 0.2; mouse.position.z = -3 + Math.cos(totalTime * 6) * 0.2; mouse.rotation.y = -(totalTime * 6); }
    if (gameStarted && state !== "ENDING_LIGHT" && state !== "HOSPITAL") {
        velocity.x -= velocity.x * 10 * delta; velocity.z -= velocity.z * 10 * delta;
        let dirZ = Number(moveF) - Number(moveB); let dirX = Number(moveR) - Number(moveL);
        if (moveF || moveB) velocity.z -= dirZ * 40 * delta; if (moveL || moveR) velocity.x -= dirX * 40 * delta;
        const forward = new THREE.Vector3(); camera.getWorldDirection(forward); forward.y = 0; forward.normalize();
        camera.position.addScaledVector(forward, -velocity.z * delta);
        const right = new THREE.Vector3(); right.setFromMatrixColumn(camera.matrix, 0);
        camera.position.addScaledVector(right, -velocity.x * delta);
    }
    renderer.render(scene, camera);
}
animate();
window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });