
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
    try {
        await Haptics.impact({ style });
    } catch (e) {
        // Fallback للويب في حال فشل الاتصال بالـ Native
        if (navigator.vibrate) {
            const ms = style === ImpactStyle.Heavy ? 30 : style === ImpactStyle.Medium ? 15 : 5;
            navigator.vibrate(ms);
        }
    }
};

export const triggerSuccessHaptic = async () => {
    try {
        await Haptics.notification({ type: 'SUCCESS' as any });
    } catch (e) {
        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    }
};
