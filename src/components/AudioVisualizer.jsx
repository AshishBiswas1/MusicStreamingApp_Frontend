import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const WaveAnimation = ({
  width,
  height,
  particles = 5000,
  pointSize = 1.5,
  waveSpeed = 2.0,
  waveIntensity = 8.0,
  particleColor = '#00d9ff',
  gridDistance = 5,
  audioRef,
  audioSrc,
  isPlaying = false,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const sourceCreatedRef = useRef(false);

  // Initialize audio analyzer
  useEffect(() => {
    if (!audioSrc || !audioRef?.current || sourceCreatedRef.current) return;

    console.log('Initializing audio visualizer for:', audioSrc);

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      console.log('Audio context created, state:', audioContext.state);

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.7;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      console.log('Creating media element source...');
      const source = audioContext.createMediaElementSource(audioRef.current);
      sourceRef.current = source;
      sourceCreatedRef.current = true;

      console.log('Connecting audio graph: source -> analyser -> destination');
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      console.log('Audio graph connected successfully');

      // Resume audio context if suspended (required for audio to play)
      if (audioContext.state === 'suspended') {
        console.log('Audio context is suspended, attempting to resume...');
        audioContext.resume().then(() => {
          console.log('Audio context resumed on init');
        });
      }
    } catch (error) {
      console.error('Error initializing audio context:', error);
      // If source already exists, just continue without audio analysis
      if (error.name === 'InvalidStateError') {
        console.log(
          'Audio source already connected, visualization will not be available'
        );
      }
    }

    return () => {
      // Don't disconnect or close on cleanup to keep audio playing
      console.log('AudioVisualizer cleanup (keeping audio connected)');
    };
  }, [audioRef, audioSrc]);

  // Resume audio context when playing
  useEffect(() => {
    const resumeContext = () => {
      if (audioContextRef.current?.state === 'suspended') {
        console.log('Resuming audio context...');
        audioContextRef.current
          .resume()
          .then(() => {
            console.log('Audio context resumed successfully');
          })
          .catch((err) => {
            console.error('Failed to resume audio context:', err);
          });
      }
    };

    if (isPlaying) {
      resumeContext();
      // Also add click listener to document as fallback
      document.addEventListener('click', resumeContext, { once: true });
    }

    return () => {
      document.removeEventListener('click', resumeContext);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const container = canvasRef.current;
    const w = width || container.clientWidth;
    const h = height || container.clientHeight;
    const dpr = window.devicePixelRatio;

    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);
    const dist = h / 2 / Math.tan(fovRad);

    const clock = new THREE.Clock();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(dpr);
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(fov, w / h, 1, dist * 2);
    camera.position.set(0, 0, 10);

    const scene = new THREE.Scene();

    const geo = new THREE.BufferGeometry();
    const positions = [];

    const gridWidth = 400 * (w / h);
    const depth = 400;

    for (let x = 0; x < gridWidth; x += gridDistance) {
      for (let z = 0; z < depth; z += gridDistance) {
        positions.push(-gridWidth / 2 + x, -30, -depth / 2 + z);
      }
    }

    const positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
    geo.setAttribute('position', positionAttribute);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_point_size: { value: pointSize },
        u_color: { value: new THREE.Color(particleColor) },
        u_bass: { value: 0.0 },
        u_intensity: { value: waveIntensity }
      },
      vertexShader: `
        #define M_PI 3.1415926535897932384626433832795
        precision mediump float;
        uniform float u_time;
        uniform float u_point_size;
        uniform float u_bass;
        uniform float u_intensity;
        
        void main() {
          vec3 p = position;
          float bassAmplitude = 1.0 + u_bass * 3.0;
          p.y += (
            cos(p.x / M_PI * u_intensity + u_time * ${waveSpeed.toFixed(1)}) +
            sin(p.z / M_PI * u_intensity + u_time * ${waveSpeed.toFixed(1)})
          ) * bassAmplitude;
          gl_PointSize = u_point_size * (1.0 + u_bass * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 u_color;
        
        void main() {
          gl_FragColor = vec4(u_color, 1.0);
        }
      `
    });

    const mesh = new THREE.Points(geo, mat);
    scene.add(mesh);

    function render() {
      const time = clock.getElapsedTime();
      mesh.material.uniforms.u_time.value = time;

      // Analyze audio for beat detection
      let bassLevel = 0;
      if (analyserRef.current && dataArrayRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        // Focus on bass frequencies (0-100 Hz range, roughly first 10-15 bins)
        let bassSum = 0;
        const bassRange = 12;
        for (let i = 0; i < bassRange; i++) {
          bassSum += dataArrayRef.current[i];
        }
        bassLevel = bassSum / (bassRange * 255);

        // Apply smoothing and amplification
        const currentBass = mesh.material.uniforms.u_bass.value;
        const smoothedBass = currentBass + (bassLevel - currentBass) * 0.3;
        mesh.material.uniforms.u_bass.value = smoothedBass;

        // Dynamic intensity based on overall energy
        let totalEnergy = 0;
        for (let i = 0; i < 30; i++) {
          totalEnergy += dataArrayRef.current[i];
        }
        const energyLevel = totalEnergy / (30 * 255);
        mesh.material.uniforms.u_intensity.value =
          waveIntensity * (0.5 + energyLevel * 1.5);
      } else {
        // Fade out when not playing
        mesh.material.uniforms.u_bass.value *= 0.95;
        mesh.material.uniforms.u_intensity.value = waveIntensity;
      }

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(render);
    }

    render();

    const handleResize = () => {
      if (!width && !height) {
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (
        rendererRef.current &&
        container.contains(rendererRef.current.domElement)
      ) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      geo.dispose();
      mat.dispose();
    };
  }, [
    width,
    height,
    particles,
    pointSize,
    waveSpeed,
    waveIntensity,
    particleColor,
    gridDistance,
    isPlaying
  ]);

  return (
    <div
      ref={canvasRef}
      className={className}
      style={{
        width: width || '100%',
        height: height || '100%',
        overflow: 'hidden'
      }}
    />
  );
};

export default WaveAnimation;
