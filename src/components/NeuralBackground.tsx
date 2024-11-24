import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export const NeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useStore(state => state.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set initial size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    // Create points
    const points: Point[] = [];
    const colors = {
      pink: 'rgba(255, 20, 147, 0.5)',  // 50% transparent deep pink
      blue: 'rgba(0, 191, 255, 0.5)'    // 50% transparent deep sky blue
    };

    for (let i = 0; i < 50; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5, // Slightly slower movement
        vy: (Math.random() - 0.5) * 1.5,
        color: Math.random() > 0.5 ? colors.pink : colors.blue
      });
    }

    function animate() {
      // Clear canvas with theme background
      ctx.fillStyle = theme === 'dark' ? '#111827' : '#F9FAFB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections first
      ctx.lineWidth = 1.5; // Slightly thinner lines

      points.forEach((point, i) => {
        points.slice(i + 1).forEach(other => {
          const dx = other.x - point.x;
          const dy = other.y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(other.x, other.y);
            const opacity = (1 - distance / 200) * 0.3; // Reduced opacity for connections
            
            // Create smooth gradient for line
            const gradient = ctx.createLinearGradient(
              point.x, point.y,
              other.x, other.y
            );
            
            // Extract base colors and create more transparent versions
            const color1 = point.color.replace('0.5)', `${opacity})`);
            const color2 = other.color.replace('0.5)', `${opacity})`);
            
            gradient.addColorStop(0, color1);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.1})`); // Soft middle point
            gradient.addColorStop(1, color2);
            
            ctx.strokeStyle = gradient;
            ctx.stroke();
          }
        });
      });

      // Update and draw points
      points.forEach(point => {
        // Move point with smoother motion
        point.x += point.vx;
        point.y += point.vy;

        // Smooth bounce off edges
        if (point.x < 0 || point.x > canvas.width) {
          point.vx *= -0.95; // Slight damping
          point.x = point.x < 0 ? 0 : canvas.width;
        }
        if (point.y < 0 || point.y > canvas.height) {
          point.vy *= -0.95; // Slight damping
          point.y = point.y < 0 ? 0 : canvas.height;
        }

        // Draw point with soft glow
        const radius = 3; // Slightly smaller points
        const glowSize = 12; // Larger glow

        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, glowSize
        );
        glowGradient.addColorStop(0, point.color.replace('0.5)', '0.3)')); // Softer center
        glowGradient.addColorStop(0.5, point.color.replace('0.5)', '0.1)')); // Very soft middle
        glowGradient.addColorStop(1, point.color.replace('0.5)', '0)')); // Fade to transparent

        ctx.beginPath();
        ctx.arc(point.x, point.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Core point
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    // Handle resize
    window.addEventListener('resize', resize);
    
    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}
    />
  );
};
