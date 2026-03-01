// src/services/RealtimeService.ts
//import Pusher, { Channel } from 'pusher-js';
// @ts-ignore
global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
import Pusher, {Channel} from 'pusher-js/react-native';
class RealtimeServiceClass {
    private pusher: Pusher | null = null;
    private channels: Record<string, Channel> = {};
    private authToken: string | null = null;

    connect(token: string): void {
        this.authToken = token;

        if (this.pusher) {
            this.disconnect();
        }

        // For iOS Simulator on Mac — use localhost
        // wsHost: 'localhost',
        //     authEndpoint: 'http://localhost:8000/api/broadcasting/auth',

        //         // For Android Emulator — use 10.0.2.2
        //         wsHost: '10.0.2.2',
        //             authEndpoint: 'http://10.0.2.2:8000/api/broadcasting/auth',

        //                 // For real device — use your Mac's IP
        //                 // Run: ipconfig getifaddr en0  →  e.g. 192.168.1.5
        //                 wsHost: '192.168.1.5',
        //                     authEndpoint: 'http://192.168.1.5:8000/api/broadcasting/auth',
        this.pusher = new Pusher('zgbdaxaz7j1w4il0iict', {
            wsHost: 'localhost',   // Android emulator: 10.0.2.2, real device: your Mac IP
            wsPort: 8080,
            //wssPort: 8080,
            forceTLS: false,
            enableStats: false,
            enabledTransports: ['ws'],
            cluster: 'mt1',
            authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            },
        });

        this.pusher.connection.bind('connected', () => {
            console.log('✅ Reverb connected');
        });

        this.pusher.connection.bind('error', (err: any) => {
            console.error('❌ Reverb error:', err);
        });

        this.pusher.connection.bind('disconnected', () => {
            console.log('🔌 Reverb disconnected');
        });
    }

    // ✅ Seller — listen to their store channel
    listenToStoreOrders(
        storeId: number,
        onNewOrder: (data: any) => void,
        onCancelled: (data: any) => void,
    ): void {
        if (!this.pusher) {
            console.warn('Pusher not connected. Call connect() first.');
            return;
        }

        const channelName = `private-store.${storeId}`;

        // Unsubscribe first if already subscribed
        if (this.channels[channelName]) {
            this.pusher.unsubscribe(channelName);
        }

        const channel = this.pusher.subscribe(channelName);
        this.channels[channelName] = channel;

        channel.bind('pusher:subscription_succeeded', () => {
            console.log(`✅ Subscribed to ${channelName}`);
        });

        channel.bind('pusher:subscription_error', (err: any) => {
            console.error(`❌ Subscription error on ${channelName}:`, err);
        });

        channel.bind('order.placed', onNewOrder);
        channel.bind('order.cancelled', onCancelled);
    }

    // ✅ Customer — listen to their personal channel (use in Flutter, but also here for testing)
    listenToOrderUpdates(
        customerId: number,
        onStatusUpdate: (data: any) => void,
    ): void {
        if (!this.pusher) {
            console.warn('Pusher not connected. Call connect() first.');
            return;
        }

        const channelName = `private-customer.${customerId}`;

        if (this.channels[channelName]) {
            this.pusher.unsubscribe(channelName);
        }

        const channel = this.pusher.subscribe(channelName);
        this.channels[channelName] = channel;

        channel.bind('pusher:subscription_succeeded', () => {
            console.log(`✅ Subscribed to ${channelName}`);
        });

        channel.bind('order.status.updated', onStatusUpdate);
    }

    // ✅ Delivery — listen to assigned orders
    listenToDeliveryOrders(
        deliveryId: number,
        onAssigned: (data: any) => void,
    ): void {
        if (!this.pusher) return;

        const channelName = `private-delivery.${deliveryId}`;

        if (this.channels[channelName]) {
            this.pusher.unsubscribe(channelName);
        }

        const channel = this.pusher.subscribe(channelName);
        this.channels[channelName] = channel;
        channel.bind('order.assigned', onAssigned);
    }

    unsubscribeFromStore(storeId: number): void {
        const channelName = `private-store.${storeId}`;
        if (this.pusher && this.channels[channelName]) {
            this.pusher.unsubscribe(channelName);
            delete this.channels[channelName];
        }
    }

    disconnect(): void {
        if (this.pusher) {
            this.pusher.disconnect();
            this.pusher = null;
            this.channels = {};
        }
    }

    isConnected(): boolean {
        return this.pusher?.connection.state === 'connected';
    }
}

// Export singleton
export const RealtimeService = new RealtimeServiceClass();