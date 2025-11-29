import React, { useEffect, useRef } from 'react';

const InteractiveBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000 }; // Start mouse off-screen

    // Particle settings
    const particleCount = 150; // Increased from 100 for more density
    const connectionDistance = 140; // Slightly increased
    const mouseDistance = 250; // Increased radius of influence
    const particleSpeed = 1.5; // Base movement speed
    
    // Resize handling
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    
    // Initial resize
    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    // Particle Class
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * particleSpeed;
        this.vy = (Math.random() - 0.5) * particleSpeed;
        this.size = Math.random() * 2.5 + 1; // Slightly larger particles
      }

      update() {
        // Normal movement
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse Interaction (Repulsion Effect)
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < mouseDistance) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouseDistance - distance) / mouseDistance;
            
            // Push away from mouse
            const repulsionStrength = 4;
            this.x -= forceDirectionX * force * repulsionStrength;
            this.y -= forceDirectionY * force * repulsionStrength;
        }
      }

      draw() {
        // Calculate distance to mouse for opacity
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Base opacity (faint) + active opacity (near mouse)
        let opacity = 0.15; 
        if (dist < mouseDistance) {
            opacity += (1 - (dist / mouseDistance)) * 0.85;
        }
        
        if (opacity > 1) opacity = 1;

        ctx.beginPath();
        // Add glow
        ctx.shadowBlur = 10; 
        ctx.shadowColor = "rgba(99, 102, 241, 0.5)";
        
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${opacity})`; // Indigo color
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Draw connections
      connectParticles();

      requestAnimationFrame(animate);
    };

    const connectParticles = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const p1 = particles[a];
          const p2 = particles[b];
          
          // Distance between particles
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            // Calculate opacity based on mouse proximity to the connection center
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const distMouse = Math.sqrt((midX - mouse.x)**2 + (midY - mouse.y)**2);
            
            // Base faint connection
            let opacity = 0.08;
            
            // Brighten if near mouse
            if (distMouse < mouseDistance) {
                opacity += (1 - (distMouse / mouseDistance)) * 0.7;
            }
            
            // Fade out as particles get further apart
            opacity *= (1 - dist/connectionDistance);
            
            if (opacity > 0.05) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
          }
        }
      }
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none' // Allow clicks to pass through to form
      }}
    />
  );
};

export default InteractiveBackground;
