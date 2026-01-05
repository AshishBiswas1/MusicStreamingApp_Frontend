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
  const sourceElementRef = useRef(null);

  // Initialize audio analyzer — extracted to re-run when audio element attaches or playback starts
  const setupAnalyser = () => {
    const audioEl = audioRef?.current;
    if (!audioSrc || !audioEl) return;

    console.log('Initializing audio visualizer for:', audioSrc);

    try {
      if (!audioContextRef.current) {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;
        console.log('Audio context created, state:', audioContext.state);
      }

      const audioContext = audioContextRef.current;

      // Create a fresh analyser for each song
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      // If the media element attached to the source changed, recreate the source
      if (!sourceRef.current || sourceElementRef.current !== audioEl) {
        try {
          if (sourceRef.current) {
            try {
              sourceRef.current.disconnect();
            } catch (e) {}
            sourceRef.current = null;
            sourceElementRef.current = null;
          }
          console.log('Creating media element source...');
          const source = audioContext.createMediaElementSource(audioEl);
          sourceRef.current = source;
          sourceElementRef.current = audioEl;
        } catch (err) {
          console.warn('Failed to create MediaElementSource:', err);
          // Can't create source (maybe already created on this context). Continue.
        }
      }

      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (e) {
          // ignore
        }
        sourceRef.current.connect(analyser);
        analyser.connect(audioContext.destination);

        console.log('Audio graph connected successfully');
      }

      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        console.log('Audio context is suspended, attempting to resume...');
        audioContext.resume().then(() => {
          console.log('Audio context resumed on init');
        });
      }
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  };

  // Run setup when audioRef or audioSrc change (covers initial attach)
  useEffect(() => {
    setupAnalyser();
    // keep cleanup minimal to avoid stopping audio when component unmounts
    return () => {
      console.log('AudioVisualizer cleanup (keeping audio connected)');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc]);

  // Attach handlers to the audio element so visualizer re-attaches when playback starts
  useEffect(() => {
    const audioEl = audioRef?.current;
    if (!audioEl) return;

    const handlePlay = () => {
      try {
        setupAnalyser();
      } catch (e) {
        console.error('Error in play handler setupAnalyser:', e);
      }
    };

    // Also trigger when metadata loads (element src changed)
    const handleLoaded = () => setupAnalyser();

    audioEl.addEventListener('play', handlePlay);
    audioEl.addEventListener('loadedmetadata', handleLoaded);

    // If audio is already playing, ensure analyser is set up
    if (!audioEl.paused) {
      setupAnalyser();
    }

    return () => {
      audioEl.removeEventListener('play', handlePlay);
      audioEl.removeEventListener('loadedmetadata', handleLoaded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRef]);

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

        // Focus on bass frequencies (0-100 Hz range, roughly first 8-12 bins)
        let bassSum = 0;
        const bassRange = 10;
        for (let i = 0; i < bassRange; i++) {
          bassSum += dataArrayRef.current[i];
        }
        bassLevel = (bassSum / (bassRange * 255)) * 2.5; // Amplify bass response

        // Apply less smoothing for more responsive beat detection
        const currentBass = mesh.material.uniforms.u_bass.value;
        const smoothedBass = currentBass + (bassLevel - currentBass) * 0.6;
        mesh.material.uniforms.u_bass.value = smoothedBass;

        // Dynamic intensity based on overall energy
        let totalEnergy = 0;
        for (let i = 0; i < 20; i++) {
          totalEnergy += dataArrayRef.current[i];
        }
        const energyLevel = (totalEnergy / (20 * 255)) * 1.5;
        mesh.material.uniforms.u_intensity.value =
          waveIntensity * (0.7 + energyLevel * 2.0);
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
