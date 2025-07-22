import React, { useEffect } from 'react';

const AnimatedBackground = () => {
  useEffect(() => {
    const particlesContainer = document.getElementById('particles-container');
    if (!particlesContainer) return;
    
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) createParticle();

    function createParticle() {
      const particle = document.createElement('div');
      particle.className = 'particle absolute bg-white rounded-full opacity-0 pointer-events-none';
      const size = Math.random() * 3 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      resetParticle(particle);
      particlesContainer.appendChild(particle);
      animateParticle(particle);
    }

    function resetParticle(particle) {
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.opacity = '0';
      return { x: posX, y: posY };
    }

    function animateParticle(particle) {
      const pos = resetParticle(particle);
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * 5;
      setTimeout(() => {
        particle.style.transition = `all ${duration}s linear`;
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        const moveX = pos.x + (Math.random() * 20 - 10);
        const moveY = pos.y - Math.random() * 30;
        particle.style.left = `${moveX}%`;
        particle.style.top = `${moveY}%`;
        setTimeout(() => {
          animateParticle(particle);
        }, duration * 1000);
      }, delay * 1000);
    }

    const handleMouseMove = (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 100;
      const mouseY = (e.clientY / window.innerHeight) * 100;
      const particle = document.createElement('div');
      particle.className = 'particle absolute bg-white rounded-full pointer-events-none';
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${mouseX}%`;
      particle.style.top = `${mouseY}%`;
      particle.style.opacity = '0.6';
      particlesContainer.appendChild(particle);
      setTimeout(() => {
        particle.style.transition = 'all 2s ease-out';
        particle.style.left = `${mouseX + (Math.random() * 10 - 5)}%`;
        particle.style.top = `${mouseY + (Math.random() * 10 - 5)}%`;
        particle.style.opacity = '0';
        setTimeout(() => {
          particle.remove();
        }, 2000);
      }, 10);
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (particlesContainer) {
        particlesContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Green-themed blurred gradient spheres */}
        <div className="absolute rounded-full blur-[60px] w-[40vw] h-[40vw] top-[-10%] left-[-10%] bg-gradient-to-br from-green-500/80 to-lime-400/40 animate-float1"></div>
        <div className="absolute rounded-full blur-[60px] w-[45vw] h-[45vw] bottom-[-20%] right-[-10%] bg-gradient-to-bl from-emerald-500/80 to-green-300/40 animate-float2"></div>
        <div className="absolute rounded-full blur-[60px] w-[30vw] h-[30vw] top-[60%] left-[20%] bg-gradient-to-tr from-teal-300/50 to-green-200/30 animate-float3"></div>

        {/* Glow center */}
        <div className="absolute w-[40vw] h-[40vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(72,255,0,0.15),transparent_70%)] blur-[30px] animate-pulseGlow z-10"></div>

        {/* Grid overlay */}
        <div className="absolute inset-0 z-10 bg-[length:40px_40px] bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]"></div>

        {/* Noise overlay */}
        <div className="absolute inset-0 z-10 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

        {/* Particle container */}
        <div id="particles-container" className="absolute inset-0 z-20 pointer-events-none"></div>
      </div>
    </>
  );
};

export default AnimatedBackground;
