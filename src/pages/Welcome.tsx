
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { ArrowRight } from "lucide-react";
import * as THREE from "three";
import { useEffect, useRef } from "react";

const Welcome = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 3D animation setup
  useEffect(() => {
    if (!containerRef.current) return;
    
    try {
      // Basic Three.js setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      containerRef.current.appendChild(renderer.domElement);
      
      // Create ambient light
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);
      
      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0x22c55e, 1);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      
      // Create particles
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 300;
      
      const posArray = new Float32Array(particlesCount * 3);
      
      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 5;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.015,
        color: 0x22c55e,
        transparent: true,
        opacity: 0.8,
      });
      
      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);
      
      // Create money spheres
      const sphereGroup = new THREE.Group();
      
      const createSphere = (color: number, radius: number, position: [number, number, number]) => {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.2,
          transparent: true,
          opacity: 0.7,
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(...position);
        return sphere;
      };
      
      sphereGroup.add(createSphere(0x22c55e, 0.2, [1, -0.5, -1]));
      sphereGroup.add(createSphere(0x86efac, 0.15, [-1, 0.5, -2]));
      sphereGroup.add(createSphere(0xbbf7d0, 0.1, [0, 1, -3]));
      
      scene.add(sphereGroup);
      
      // Position camera
      camera.position.z = 3;
      
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        
        particlesMesh.rotation.y += 0.001;
        sphereGroup.rotation.y += 0.003;
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
      };
    } catch (error) {
      console.error("Error initializing Three.js:", error);
    }
  }, []);

  // Animation variants for content
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
      {/* 3D animation container */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 z-0 opacity-70"
        style={{ pointerEvents: "none" }}
      />
      
      {/* Content */}
      <motion.div 
        className="relative z-10 px-6 max-w-md w-full text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          variants={itemVariants}
          className="mb-8"
        >
          <Logo withText size="lg" className="mx-auto" />
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-4xl font-bold mb-2"
        >
          Manage your finances
          <span className="text-primary block mt-1">simply</span>
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-muted-foreground mb-12"
        >
          Smart budget tracking with insights
        </motion.p>
        
        <motion.div 
          variants={itemVariants}
          className="flex justify-center"
        >
          <Button 
            asChild 
            size="lg" 
            className="px-8 py-6 text-lg font-medium rounded-full shadow-lg"
          >
            <Link to="/dashboard">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Welcome;
