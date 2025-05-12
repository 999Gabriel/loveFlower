/**
 * Flower.js
 * Implementierung einer realistischen 3D-Rose mit Three.js
 */

class Flower {
    constructor(container) {
        // Grundlegende Three.js-Einrichtung
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);
        
        // Kamera-Position
        this.camera.position.z = 5;
        this.camera.position.y = 2;
        this.camera.lookAt(0, 0, 0);
        
        // Beleuchtung
        this.setupLighting();
        
        // Erstelle die Rose
        this.rose = this.createRose();
        this.scene.add(this.rose);
        
        // Hintergrund mit Partikeln
        this.particles = this.createParticles();
        this.scene.add(this.particles);
        
        // Orbit-Kontrollen für interaktive Kamerabewegung
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        
        // Animation starten
        this.animate();
        
        // Event-Listener für Fenstergrößenänderungen
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    
    /**
     * Richtet die Beleuchtung für die Szene ein
     */
    setupLighting() {
        // Hauptlicht (weiches Licht von oben)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(0, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        
        // Fülllichter für bessere Ausleuchtung
        const fillLight1 = new THREE.DirectionalLight(0xffd1d1, 0.5);
        fillLight1.position.set(-5, 3, 5);
        this.scene.add(fillLight1);
        
        const fillLight2 = new THREE.DirectionalLight(0xd1e8ff, 0.5);
        fillLight2.position.set(5, 3, 5);
        this.scene.add(fillLight2);
        
        // Ambientes Licht für grundlegende Ausleuchtung
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
    }
    
    /**
     * Erstellt eine realistische 3D-Rose
     */
    createRose() {
        const roseGroup = new THREE.Group();
        
        // Materialien mit PBR-Eigenschaften für Realismus
        const petalMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff0a47,
            roughness: 0.3,
            metalness: 0.1,
            clearcoat: 0.4,
            clearcoatRoughness: 0.2,
            emissive: 0xff0a47,
            emissiveIntensity: 0.05, // Grundleuchtkraft
        });
        
        const stemMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x0a5f2c,
            roughness: 0.7,
            metalness: 0.0,
        });
        
        // Stiel
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.07, 3, 12);
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = -1.5;
        stem.castShadow = true;
        stem.receiveShadow = true;
        roseGroup.add(stem);
        
        // Blätter am Stiel
        this.addLeavesToStem(stem, stemMaterial);
        
        // Blütenmitte
        const centerGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const centerMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffcc00,
            roughness: 0.5,
            metalness: 0.2,
            emissive: 0xffcc00,
            emissiveIntensity: 0.1,
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.castShadow = true;
        center.receiveShadow = true;
        roseGroup.add(center);
        
        // Blütenblätter
        this.createRealisticPetals(roseGroup, petalMaterial);
        
        // Speichere die Materialien für spätere Aktualisierungen
        this.petalMaterial = petalMaterial;
        this.centerMaterial = centerMaterial;
        
        return roseGroup;
    }
    
    /**
     * Fügt Blätter zum Stiel hinzu
     */
    addLeavesToStem(stem, material) {
        const leafShape = new THREE.Shape();
        leafShape.moveTo(0, 0);
        leafShape.bezierCurveTo(0.5, 0.5, 1, 0.5, 1.5, 0);
        leafShape.bezierCurveTo(1, -0.5, 0.5, -0.5, 0, 0);
        
        const extrudeSettings = {
            steps: 1,
            depth: 0.05,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelSegments: 3
        };
        
        const leafGeometry = new THREE.ExtrudeGeometry(leafShape, extrudeSettings);
        
        // Erstelle mehrere Blätter entlang des Stiels
        for (let i = 0; i < 3; i++) {
            const leaf = new THREE.Mesh(leafGeometry, material);
            leaf.scale.set(0.3, 0.3, 0.3);
            leaf.position.y = -1.5 + i * 0.8;
            leaf.position.x = 0.2;
            leaf.rotation.z = -Math.PI / 4;
            leaf.rotation.y = Math.PI / 2 * i;
            leaf.castShadow = true;
            leaf.receiveShadow = true;
            this.scene.add(leaf);
            
            // Gegenüberliegendes Blatt
            if (i < 2) {
                const leafOpposite = new THREE.Mesh(leafGeometry, material);
                leafOpposite.scale.set(0.3, 0.3, 0.3);
                leafOpposite.position.y = -1.1 + i * 0.8;
                leafOpposite.position.x = -0.2;
                leafOpposite.rotation.z = Math.PI / 4;
                leafOpposite.rotation.y = -Math.PI / 2 * i;
                leafOpposite.castShadow = true;
                leafOpposite.receiveShadow = true;
                this.scene.add(leafOpposite);
            }
        }
    }
    
    /**
     * Erstellt realistische Blütenblätter für die Rose
     */
    createRealisticPetals(roseGroup, material) {
        // Verwende eine benutzerdefinierte Kurve für die Blütenblattform
        const petalShape = new THREE.Shape();
        petalShape.moveTo(0, 0);
        petalShape.bezierCurveTo(0.1, 0.2, 0.3, 0.4, 0.5, 0.5);
        petalShape.bezierCurveTo(0.7, 0.4, 0.9, 0.2, 1, 0);
        petalShape.bezierCurveTo(0.9, -0.05, 0.7, -0.1, 0.5, -0.1);
        petalShape.bezierCurveTo(0.3, -0.1, 0.1, -0.05, 0, 0);
        
        const extrudeSettings = {
            steps: 1,
            depth: 0.05,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelSegments: 3
        };
        
        const petalGeometry = new THREE.ExtrudeGeometry(petalShape, extrudeSettings);
        
        // Erstelle mehrere Schichten von Blütenblättern
        const layers = 4;
        const petalsPerLayer = [6, 9, 12, 15];
        let radiusOffset = 0.2;
        
        for (let layer = 0; layer < layers; layer++) {
            const numPetals = petalsPerLayer[layer];
            const radius = 0.2 + radiusOffset;
            const angleStep = (Math.PI * 2) / numPetals;
            const layerHeight = 0.05 * layer;
            
            for (let i = 0; i < numPetals; i++) {
                const angle = i * angleStep;
                const petal = new THREE.Mesh(petalGeometry, material);
                
                // Skaliere und positioniere das Blütenblatt
                const scale = 0.2 + layer * 0.1;
                petal.scale.set(scale, scale, scale);
                
                petal.position.x = Math.cos(angle) * radius;
                petal.position.z = Math.sin(angle) * radius;
                petal.position.y = layerHeight;
                
                // Rotiere das Blütenblatt, um es nach außen zu richten
                petal.rotation.y = angle + Math.PI;
                petal.rotation.x = Math.PI / 2 - (0.3 + layer * 0.1);
                
                petal.castShadow = true;
                petal.receiveShadow = true;
                
                roseGroup.add(petal);
            }
            
            radiusOffset += 0.15;
        }
    }
    
    /**
     * Erstellt Partikel für den Hintergrund
     */
    createParticles() {
        const particleCount = 1000;
        const particles = new THREE.Group();
        
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const sizes = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Zufällige Position im Raum
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;
            
            vertices.push(x, y, z);
            sizes.push(Math.random() * 2);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            map: this.createParticleTexture(),
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const particleSystem = new THREE.Points(geometry, particleMaterial);
        particles.add(particleSystem);
        
        return particles;
    }
    
    /**
     * Erstellt eine Textur für die Partikel
     */
    createParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    /**
     * Aktualisiert die Leuchtkraft der Blume basierend auf der Anzahl der Tage
     */
    updateEmissiveIntensity(days) {
        // Berechne die Leuchtkraft (maximal 1.0)
        const intensity = Math.min(days * 0.01, 1.0);
        
        // Aktualisiere die Materialien
        this.petalMaterial.emissiveIntensity = 0.05 + intensity * 0.3;
        this.centerMaterial.emissiveIntensity = 0.1 + intensity * 0.4;
        
        // Füge Funkeln hinzu, wenn die Intensität höher ist
        this.updateSparkleEffect(intensity);
    }
    
    /**
     * Fügt einen Funkeleffekt basierend auf der Intensität hinzu
     */
    updateSparkleEffect(intensity) {
        // Entferne vorhandene Funkeleffekte
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.isSparkle) {
                this.scene.remove(child);
            }
        });
        
        // Füge neue Funkeleffekte hinzu, wenn die Intensität hoch genug ist
        if (intensity > 0.2) {
            const sparkleCount = Math.floor(intensity * 20);
            
            for (let i = 0; i < sparkleCount; i++) {
                const sparkle = this.createSparkle();
                sparkle.userData = { isSparkle: true };
                this.scene.add(sparkle);
            }
        }
    }
    
    /**
     * Erstellt einen einzelnen Funkeleffekt
     */
    createSparkle() {
        const geometry = new THREE.SphereGeometry(0.03, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: Math.random() * 0.5 + 0.5
        });
        
        const sparkle = new THREE.Mesh(geometry, material);
        
        // Positioniere das Funkeln zufällig um die Rose herum
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 0.5 + Math.random() * 0.5;
        
        sparkle.position.x = radius * Math.sin(phi) * Math.cos(theta);
        sparkle.position.y = radius * Math.cos(phi);
        sparkle.position.z = radius * Math.sin(phi) * Math.sin(theta);
        
        // Füge Animation hinzu
        sparkle.userData = {
            animation: {
                speed: Math.random() * 0.02 + 0.01,
                opacity: Math.random() * 0.5 + 0.5
            }
        };
        
        return sparkle;
    }
    
    /**
     * Animationsschleife
     */
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Rotiere die Rose langsam
        if (this.rose) {
            this.rose.rotation.y += 0.005;
        }
        
        // Animiere Partikel
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
        }
        
        // Animiere Funkeleffekte
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.isSparkle) {
                child.rotation.y += 0.05;
                child.rotation.x += 0.03;
                
                // Pulsierender Effekt
                if (child.userData.animation) {
                    child.material.opacity = 0.5 + Math.sin(Date.now() * child.userData.animation.speed) * 0.5;
                }
            }
        });
        
        // Aktualisiere Orbit-Kontrollen
        this.controls.update();
        
        // Rendere die Szene
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Passt die Größe des Renderers an, wenn sich die Fenstergröße ändert
     */
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
}