
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

let nextStartTime = 0;
let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let audioSource: MediaStreamAudioSourceNode | null = null;
const activeSources = new Set<AudioBufferSourceNode>();

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
    userGender?: 'male' | 'female',
    voiceName?: string,
    onTranscript?: (text: string) => void,
    onVolumeUpdate?: (volume: number) => void,
    onStateChange?: (state: 'listening' | 'speaking' | 'thinking') => void,
    onError?: (error: any) => void
  }) {
    this.stop(); 

    // GENDER-ADAPTIVE VOICE SELECTION OR EXPLICIT OVERRIDE
    // User Female -> Male AI (Charon)
    // User Male -> Female AI (Kore)
    const selectedVoice = config.voiceName || (config.userGender === 'female' ? 'Charon' : 'Kore');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    let stream: MediaStream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
        config.onError?.(e);
        return;
    }
    
    this.sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          console.log(`🎙️ Voice Session Started with voice: ${selectedVoice}`);
          if (!inputAudioContext || !this.sessionPromise) return;
          
          audioSource = inputAudioContext.createMediaStreamSource(stream);
          scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Calc volume for UI
            let sum = 0;
            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
            const vol = Math.sqrt(sum / inputData.length);
            config.onVolumeUpdate?.(vol);

            const pcmBlob = createAudioBlob(inputData);
            this.sessionPromise?.then(session => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };

          audioSource.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.destination);
          config.onStateChange?.('speaking'); // AI starts first usually
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Model Transcription
          if (message.serverContent?.outputTranscription) {
             config.onTranscript?.(message.serverContent.outputTranscription.text);
          }

          // Handle Interruption (CRITICAL OVERRIDE: AI MUST stop speaking immediately)
          if (message.serverContent?.interrupted) {
            activeSources.forEach(s => { try { s.stop(); } catch(e){} });
            activeSources.clear();
            nextStartTime = 0;
            config.onStateChange?.('listening');
          }

          if (message.serverContent?.modelTurn) {
              config.onStateChange?.('speaking');
          }

          if (message.serverContent?.turnComplete) {
              config.onStateChange?.('listening');
          }

          // Handle Audio Output
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
            source.onended = () => {
                activeSources.delete(source);
                if (activeSources.size === 0) {
                    // All AI speech segments finished
                    // Mic is already active via ScriptProcessor
                }
            };
            source.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
            activeSources.add(source);
          }
        },
        onerror: (e) => {
            console.error("Live Error:", e);
            config.onError?.(e);
        },
        onclose: () => console.log("Live Session Closed"),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
        },
        systemInstruction: config.systemInstruction + "\nSTRICT TURN-TAKING: Only speak after the user finishes. Stop immediately if interrupted. Be brief and warm.",
        outputAudioTranscription: {},
        inputAudioTranscription: {},
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
