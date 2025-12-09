
import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const GroundingCanvas: React.FC<Props> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const createParticle = (x: number, y: number) => {
        const hue = Math.random() * 60 + 180; // Blue/Cyan range
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 20 + 5,
            hue,
            life: 100
        });
    };

    const handleTouch = (e: any) => {
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        
        // Haptic Feedback for physical sensation
        if (navigator.vibrate) {
            // Short, sharp vibration to simulate popping bubbles or water resistance
            navigator.vibrate(5);
        }

        for(let i=0; i<5; i++) createParticle(x, y);
    };

    canvas.addEventListener('mousemove', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);

    const animate = () => {
        ctx.fillStyle = 'rgba(10, 20, 40, 0.2)'; // Trail effect
        ctx.fillRect(0, 0, w, h);

        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.size *= 0.95;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${p.life / 100})`;
            ctx.fill();

            if (p.life <= 0 || p.size < 0.5) particles.splice(i, 1);
        });

        requestAnimationFrame(animate);
    };

    animate();

    return () => {
        canvas.removeEventListener('mousemove', handleTouch);
        canvas.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900 cursor-crosshair animate-fadeIn touch-none">
        <canvas ref={canvasRef} className="block w-full h-full" />
        <button onClick={onClose} className="absolute top-6 right-6 p-4 bg-white/10 text-white rounded-full backdrop-blur-md hover:bg-white/20 transition-all border border-white/10 shadow-lg">
            <X size={24} />
        </button>
        <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none">
            <p className="text-white/50 text-sm tracking-[0.5em] uppercase font-light animate-pulse">Touch to Ground Yourself</p>
        </div>
    </div>
  );
};

export default GroundingCanvas;
