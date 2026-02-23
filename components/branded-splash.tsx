import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';
import { ThemedText } from './themed-text';

const LOGO_IMAGE = require('@/assets/images/logo-freshroot.png');

const { width, height } = Dimensions.get('window');

const FloatingLeaf = ({ size = 20, delay = 0, initialX = 0, duration = 4000 }) => {
    const x = useSharedValue(initialX);
    const y = useSharedValue(height + 100);
    const rotation = useSharedValue(0);

    useEffect(() => {
        y.value = withDelay(
            delay,
            withTiming(-100, { duration, easing: Easing.linear }, (finished) => {
                if (finished) {
                    y.value = height + 100;
                    // Restart loop logic could be here, but withTiming doesn't easily loop with randoms.
                    // For short splash, one pass is fine.
                }
            })
        );

        x.value = withDelay(
            delay,
            withTiming(initialX + (Math.random() - 0.5) * 100, { duration, easing: Easing.inOut(Easing.sin) })
        );

        rotation.value = withDelay(
            delay,
            withTiming(360, { duration, easing: Easing.linear })
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        position: 'absolute',
        left: x.value,
        top: y.value,
        transform: [{ rotate: `${rotation.value}deg` }],
        opacity: 0.2,
    }));

    return (
        <Animated.View style={style}>
            <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png' }}
                style={{ width: size, height: size, tintColor: '#2ECC71' }}
            />
        </Animated.View>
    );
};

export function BrandedSplash() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);

    useEffect(() => {
        // Logo animation
        scale.value = withTiming(1, {
            duration: 1000,
            easing: Easing.out(Easing.back(1.5)),
        });
        opacity.value = withTiming(1, {
            duration: 800,
        });

        // Slogan animation
        textOpacity.value = withDelay(
            600,
            withTiming(1, {
                duration: 800,
            })
        );
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
    }));

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Background Decorations */}
            <FloatingLeaf size={40} delay={0} initialX={width * 0.1} duration={5000} />
            <FloatingLeaf size={30} delay={1000} initialX={width * 0.8} duration={6000} />
            <FloatingLeaf size={25} delay={2000} initialX={width * 0.4} duration={4500} />
            <FloatingLeaf size={35} delay={500} initialX={width * 0.6} duration={5500} />

            <Animated.View style={[styles.logoContainer, logoStyle]}>
                <Image
                    source={LOGO_IMAGE}
                    style={styles.logo}
                />
            </Animated.View>
            <Animated.View style={[styles.footer, textStyle]}>
                <ThemedText style={styles.brandName}>FreshRoot</ThemedText>
                <ThemedText style={styles.slogan}>Ăn Khỏe - Sống Thông Minh</ThemedText>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 40,
    },
    logo: {
        width: 120,
        height: 120,
    },
    footer: {
        position: 'absolute',
        bottom: 80,
        alignItems: 'center',
    },
    brandName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    slogan: {
        fontSize: 16,
        color: '#8e8e93',
        textAlign: 'center',
    },
});
