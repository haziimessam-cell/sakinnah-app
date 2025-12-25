
/**
 * Local Audio Generator
 * Generates White/Pink noise and meditative drones without any internet download.
 */
export const audioGenerator = {
    createRainNode: (ctx: AudioContext) => {
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11; 
            b6 = white * 0.115926;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        noise.connect(filter);
        return { source: noise, filter: filter };
    },

    createMeditativeDrone: (ctx: AudioContext) => {
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.15;

        // Base Drone Osc
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.value = 60 + Math.random() * 10; // Random low freq
        gain1.gain.value = 0.5;
        
        // Harmonic Osc
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = osc1.frequency.value * 1.5; // Perfect fifth
        gain2.gain.value = 0.2;

        // LFO for modulation
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.1; // Very slow
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);

        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(masterGain);
        gain2.connect(masterGain);

        return {
            start: () => {
                osc1.start();
                osc2.start();
                lfo.start();
            },
            stop: () => {
                osc1.stop();
                osc2.stop();
                lfo.stop();
            },
            masterGain
        };
    }
};
