
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// Audio Contexts for Recording and Playback
let nextStartTime = 0;
let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let audioSource: MediaStreamAudioSourceNode | null = null;
const activeSources = new Set<AudioBufferSourceNode>();

// Manual Base64 Implementation as per rules
function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createAudioBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encodeBase64(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const liveVoiceService = {
  sessionPromise: null as Promise<any> | null,

  async connect(config: { 
    systemInstruction: string, 
    voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoife' | 'Zephyr',
    onMessage?: (text: string) => void,
    onVolumeUpdate?: (volume: number) => void
  }) {
    this.stop(); // Clear any previous session

    // Create a new instance right before the call to ensure fresh key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    this.sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          console.log("🎙️ Live Session Opened");
          if (!inputAudioContext || !this.sessionPromise) return;
          
          audioSource = inputAudioContext.createMediaStreamSource(stream);
          scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Volume visualizer calculation
            let sum = 0;
            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
            config.onVolumeUpdate?.(Math.sqrt(sum / inputData.length));

            const pcmBlob = createAudioBlob(inputData);
            // Ensure data is sent only after session promise resolves
            this.sessionPromise?.then(session => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };

          audioSource.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          // 1. Handle Transcriptions
          if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
             config.onMessage?.(message.serverContent.modelTurn.parts[0].text);
          }

          // 2. Handle Interruption
          if (message.serverContent?.interrupted) {
            activeSources.forEach(s => { try { s.stop(); } catch(e){} });
            activeSources.clear();
            nextStartTime = 0;
          }

          // 3. Handle Audio Output
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio && outputAudioContext) {
            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
            const audioBuffer = await decodeAudioData(
              decodeBase64(base64Audio),
              outputAudioContext,
              24000,
              1
            );
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.onended = () => activeSources.delete(source);
            
            // Schedule smooth gapless playback
            source.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
            activeSources.add(source);
          }
        },
        onerror: (e) => console.error("Live Error:", e),
        onclose: () => console.log("Live Session Closed"),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName } },
        },
        systemInstruction: config.systemInstruction,
      },
    });
  },

  stop() {
    if (scriptProcessor) {
        scriptProcessor.disconnect();
        scriptProcessor = null;
    }
    if (audioSource) {
        audioSource.disconnect();
        audioSource = null;
    }
    activeSources.forEach(s => { try { s.stop(); } catch(e){} });
    activeSources.clear();
    nextStartTime = 0;
    
    this.sessionPromise?.then(session => session.close());
    this.sessionPromise = null;
  }
};
