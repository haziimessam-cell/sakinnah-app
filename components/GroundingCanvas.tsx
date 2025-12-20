
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Waves, Stars, Brush, Wind } from 'lucide-react';
import { translations } from '../translations';

interface Props {
  onClose: () => void;
}

type GroundingTheme = 'sea' | 'stars' | 'zen';

const GroundingCanvas: React.FC<Props> = ({ onClose }) => {
  const lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
  const t = (translations as any)[lang];
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [theme, setTheme] = useState<GroundingTheme>('sea');
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');

  // Neural Sound Engine
  const playTouchSound = useCallback((x: number, y: number, pressure: number) => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Theme-based sound design
    if (theme === 'sea') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100 + (y / window.innerHeight) * 200, ctx.currentTime);
    } else if (theme === 'stars') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400 + (x / window.innerWidth) * 800, ctx.currentTime);
    } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(50 + (y / window.innerHeight) * 100, ctx.currentTime);
    }

    gain.gain.setValueAtTime(0.05 * pressure, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const createParticle = (x: number, y: number) => {
        let hue, size, vx, vy, life;
        
        if (theme === 'sea') {
            hue = Math.random() * 40 + 180; // Blue
            size = Math.random() * 30 + 10;
            vx = (Math.random() - 0.5) * 2;
            vy = -Math.random() * 3;
            life = 150;
        } else if (theme === 'stars') {
            hue = Math.random() * 60 + 260; // Purple/Gold
            size = Math.random() * 5 + 1;
            vx = (Math.random() - 0.5) * 10;
            vy = (Math.random() - 0.5) * 10;
            life = 100;
        } else {
            hue = 40; // Sand/Zen
            size = Math.random() * 15 + 5;
            vx = (Math.random() - 0.5) * 0.5;
            vy = (Math.random() - 0.5) * 0.5;
            life = 200;
        }

        particles.push({ x, y, vx, vy, size, hue, life, maxLife: life });
    };

    const handleInput = (e: any) => {
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        
        if (navigator.vibrate) navigator.vibrate(2);
        playTouchSound(x, y, 1);

        for(let i=0; i < (theme === 'stars' ? 10 : 3); i++) {
            createParticle(x, y);
        }
    };

    canvas.addEventListener('mousemove', handleInput);
    canvas.addEventListener('touchmove', handleInput, { passive: false });
    canvas.addEventListener('mousedown', handleInput);

    const animate = () => {
        // Clearing logic depends on theme
        if (theme === 'zen') {
            ctx.fillStyle = 'rgba(245, 245, 230, 0.02)'; // Slow fade for sand
        } else {
            ctx.fillStyle = theme === 'sea' ? 'rgba(5, 15, 30, 0.15)' : 'rgba(10, 5, 20, 0.2)';
        }
        ctx.fillRect(0, 0, w, h);

        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            if (theme === 'sea') {
                p.size *= 0.99;
                p.vy -= 0.02; // Buoyancy
            } else if (theme === 'stars') {
                p.size *= 0.96;
            }

            ctx.beginPath();
            if (theme === 'zen') {
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(100, 80, 60, ${p.life / p.maxLife})`;
            } else {
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                const alpha = p.life / p.maxLife;
                ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha})`;
                if (theme === 'stars') {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, ${alpha})`;
                }
            }
            ctx.fill();
            ctx.shadowBlur = 0;

            if (p.life <= 0 || p.size < 0.1) particles.splice(i, 1);
        });

        requestAnimationFrame(animate);
    };

    const animReq = requestAnimationFrame(animate);

    const handleResize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
        canvas.removeEventListener('mousemove', handleInput);
        canvas.removeEventListener('touchmove', handleInput);
        canvas.removeEventListener('mousedown', handleInput);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animReq);
    };
  }, [theme, playTouchSound]);

  // Breathing Pacer Logic
  useEffect(() => {
    const interval = setInterval(() => {
        setBreathPhase(prev => prev === 'in' ? 'out' : 'in');
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900 cursor-crosshair animate-fadeIn touch-none overflow-hidden select-none">
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        {/* Breathing Ring Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
                className={`w-64 h-64 border-2 border-white/10 rounded-full transition-all duration-[4000ms] ease-in-out flex items-center justify-center
                ${breathPhase === 'in' ? 'scale-[1.8] opacity-20' : 'scale-[0.8] opacity-5'}`}
            >
                <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                    {breathPhase === 'in' ? (lang === 'ar' ? 'شهيق' : 'Inhale') : (lang === 'ar' ? 'زفير' : 'Exhale')}
                </div>
            </div>
        </div>

        {/* Top UI */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
            <div className="flex flex-col gap-1">
                <h2 className="text-white font-black text-sm uppercase tracking-wider">{t.cat_grounding_title}</h2>
                <p className="text-white/40 text-[9px] max-w-[200px] leading-relaxed">{t.grounding_instruction}</p>
            </div>
            <button 
                onClick={onClose} 
                className="pointer-events-auto p-4 bg-white/10 text-white rounded-full backdrop-blur-md hover:bg-white/20 transition-all border border-white/10 shadow-lg active:scale-90"
            >
                <X size={20} />
            </button>
        </div>

        {/* Bottom Theme Selector */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 bg-black/40 backdrop-blur-xl p-2 rounded-[2rem] border border-white/5 shadow-2xl pointer-events-auto">
            <button 
                onClick={() => setTheme('sea')}
                className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all ${theme === 'sea' ? 'bg-blue-500 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
            >
                <Waves size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{t.grounding_theme_sea}</span>
            </button>
            <button 
                onClick={() => setTheme('stars')}
                className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all ${theme === 'stars' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
            >
                <Stars size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{t.grounding_theme_stars}</span>
            </button>
            <button 
                onClick={() => setTheme('zen')}
                className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all ${theme === 'zen' ? 'bg-amber-700 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
            >
                <Brush size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{t.grounding_theme_zen}</span>
            </button>
        </div>

        {/* Breath Label */}
        <div className="absolute bottom-28 left-0 w-full text-center pointer-events-none">
            <p className="text-white/20 text-[8px] font-black tracking-[0.5em] uppercase">
                {t.grounding_breath_guide}
            </p>
        </div>
    </div>
  );
};

export default GroundingCanvas;
