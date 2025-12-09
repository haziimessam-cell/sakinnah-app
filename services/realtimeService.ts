
/**
 * Real-Time Service using BroadcastChannel API.
 * This simulates WebSockets for a Serverless/Local-First architecture.
 * It allows multiple tabs (e.g., Partner A and Partner B profiles open) 
 * to communicate instantly.
 */

type EventType = 'PARTNER_LINKED' | 'SESSION_BOOKED' | 'MOOD_UPDATED';

interface RealtimeMessage {
    type: EventType;
    payload: any;
}

const CHANNEL_NAME = 'sakinnah_realtime_mesh';
let channel: BroadcastChannel | null = null;

const listeners: ((msg: RealtimeMessage) => void)[] = [];

export const realtimeService = {
    connect: () => {
        if (!channel) {
            channel = new BroadcastChannel(CHANNEL_NAME);
            channel.onmessage = (event) => {
                const msg = event.data as RealtimeMessage;
                listeners.forEach(cb => cb(msg));
            };
            console.log("🔌 Realtime Mesh Network Connected");
        }
    },

    disconnect: () => {
        if (channel) {
            channel.close();
            channel = null;
        }
    },

    emit: (type: EventType, payload: any) => {
        if (!channel) realtimeService.connect();
        channel?.postMessage({ type, payload });
    },

    onMessage: (callback: (msg: RealtimeMessage) => void) => {
        listeners.push(callback);
        // Return unsubscribe function
        return () => {
            const index = listeners.indexOf(callback);
            if (index > -1) listeners.splice(index, 1);
        };
    }
};
