
import React, { useEffect, useState, useRef } from 'react';
import { CognitiveNode, Language } from '../types';
import { ArrowLeft, ArrowRight, Brain, Share2, Sparkles, X, Info } from 'lucide-react';

interface Props {
    nodes: CognitiveNode[];
    language: Language;
    onBack: () => void;
}

const CBTCanvas: React.FC<Props> = ({ nodes, language, onBack }) => {
    const isRTL = language === 'ar';
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedNode, setSelectedNode] = useState<CognitiveNode | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrame: number;
        const width = canvas.width = window.innerWidth;
        const height = canvas.height = window.innerHeight;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Draw background grid
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.05)';
            ctx.lineWidth = 1;
            for (let i = 0; i < width; i += 50) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
            }
            for (let i = 0; i < height; i += 50) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
            }

            // Draw connections
            ctx.strokeStyle = 'rgba(14, 165, 233, 0.2)';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            nodes.forEach((node, i) => {
                if (i > 0) {
                    ctx.moveTo(nodes[i-1].x, nodes[i-1].y);
                    ctx.lineTo(node.x, node.y);
                }
            });
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw Nodes
            nodes.forEach(node => {
                const isSelected = selectedNode?.id === node.id;
                
                // Outer glow
                const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 40);
                const color = node.type === 'thought' ? '56, 189, 248' : node.type === 'distortion' ? '244, 114, 182' : '168, 85, 247';
                grad.addColorStop(0, `rgba(${color}, 0.3)`);
                grad.addColorStop(1, `rgba(${color}, 0)`);
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(node.x, node.y, 40, 0, Math.PI * 2); ctx.fill();

                // Node Body
                ctx.fillStyle = isSelected ? `rgb(${color})` : '#fff';
                ctx.strokeStyle = `rgb(${color})`;
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(node.x, node.y, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

                // Text Label
                ctx.fillStyle = '#1e293b';
                ctx.font = 'bold 12px Tajawal, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(node.label, node.x, node.y + 30);
            });

            animationFrame = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationFrame);
    }, [nodes, selectedNode]);

    const handleCanvasClick = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedNode = nodes.find(n => Math.hypot(n.x - x, n.y - y) < 30);
        setSelectedNode(clickedNode || null);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col animate-fadeIn">
            <header className="px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                        {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
                    </button>
                    <div>
                        <h1 className="font-bold text-slate-800 flex items-center gap-2">
                            <Brain size={20} className="text-primary-500" />
                            {isRTL ? 'لوحة الإدراك الحي' : 'Live Cognitive Canvas'}
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isRTL ? 'خريطة تفكيرك' : 'Your Thought Map'}</p>
                    </div>
                </div>
                <button className="p-2.5 text-slate-400 hover:text-primary-600 transition-colors">
                    <Share2 size={20} />
                </button>
            </header>

            <div className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                <canvas 
                    ref={canvasRef} 
                    onClick={handleCanvasClick}
                    className="block w-full h-full cursor-crosshair" 
                />
                
                {nodes.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 opacity-30">
                        <Sparkles size={64} className="mb-4 text-primary-300" />
                        <p className="text-slate-500 font-bold">{isRTL ? 'تحدث مع سكينة لتبدأ الخريطة في الظهور...' : 'Chat with Sakinnah to start the map...'}</p>
                    </div>
                )}

                {selectedNode && (
                    <div className="absolute bottom-10 left-6 right-6 bg-white/90 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-2xl border border-white animate-slideUp">
                        <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 p-1.5 bg-slate-100 rounded-full"><X size={14}/></button>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-3 h-3 rounded-full ${selectedNode.type === 'thought' ? 'bg-sky-400' : selectedNode.type === 'distortion' ? 'bg-pink-400' : 'bg-purple-400'}`}></div>
                            <h3 className="font-bold text-slate-800">{selectedNode.label}</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {selectedNode.description}
                        </p>
                        <div className="mt-4 flex gap-2">
                             <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                 <Info size={10} /> {selectedNode.type.toUpperCase()}
                             </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="px-6 py-4 bg-white/40 backdrop-blur-md border-t border-slate-100 flex gap-4 overflow-x-auto no-scrollbar">
                 <div className="flex items-center gap-2 whitespace-nowrap">
                     <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase">{isRTL ? 'فكرة' : 'Thought'}</span>
                 </div>
                 <div className="flex items-center gap-2 whitespace-nowrap">
                     <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase">{isRTL ? 'تشويه معرفي' : 'Distortion'}</span>
                 </div>
                 <div className="flex items-center gap-2 whitespace-nowrap">
                     <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase">{isRTL ? 'معتقد جوهري' : 'Core Belief'}</span>
                 </div>
            </div>
        </div>
    );
};

export default CBTCanvas;
