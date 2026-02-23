import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import apiClient from '@/services/api-client'; // Added this line
import { BiometricService } from '@/services/biometric-service';
import { useAuthStore } from '@/store/auth-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const LOGO_IMAGE = require('@/assets/images/logo-freshroot.png');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const { setUser, setToken } = useAuthStore();

    useEffect(() => {
        checkBiometrics();
    }, []);

    const checkBiometrics = async () => {
        const credentials = await BiometricService.getCredentials();
        if (credentials) {
            setIsBiometricEnrolled(true);
        }
    };

    const handleBiometricLogin = async () => {
        const credentials = await BiometricService.getCredentials();
        if (!credentials) return;

        const authenticated = await BiometricService.authenticate('Đăng nhập bằng Face ID');
        if (authenticated) {
            performLogin(credentials.email, credentials.password);
        }
    };

    const performLogin = async (loginEmail: string, loginPassword: string) => {
        setLoading(true);
        try {
            const response = await apiClient.post('/auth/login', { email: loginEmail, password: loginPassword });
            const { token, user } = response.data;
            console.log('Login successful:', { email: user.email, role: user.role });

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);

            // Force redirect if RootLayout is slow
            if (user.role === 'admin') {
                router.replace('/(admin)/cms');
            } else {
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Đăng nhập thất bại';
            Alert.alert('Lỗi', message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        performLogin(email, password);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                entering={FadeInDown.duration(800).delay(200)}
            >
                <Animated.View style={styles.header} entering={FadeInUp.duration(1000).delay(400)}>
                    <Image
                        source={LOGO_IMAGE}
                        style={styles.logo}
                    />
                    <Text style={[styles.title, { color: theme.text }]}>FreshRoot</Text>
                    <Text style={styles.subtitle}>Ăn Khỏe - Sống Thông Minh</Text>
                </Animated.View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.text }]}>Email / Username</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.icon, backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}
                            placeholder="example@gmail.com"
                            placeholderTextColor="#8e8e93"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.text }]}>Mật khẩu</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.icon, backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}
                            placeholder="••••••••"
                            placeholderTextColor="#8e8e93"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.loginActions}>
                        <TouchableOpacity
                            style={[styles.loginButton, { backgroundColor: theme.tint, flex: 1 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.loginButtonText}>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</Text>
                        </TouchableOpacity>

                        {isBiometricEnrolled && (
                            <TouchableOpacity
                                style={[styles.biometricButton, { borderColor: theme.tint }]}
                                onPress={handleBiometricLogin}
                                disabled={loading}
                            >
                                <IconSymbol name="faceid" size={28} color={theme.tint} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.text }]}>Chưa có tài khoản? </Text>
                        <Link href="/auth/register" asChild>
                            <TouchableOpacity>
                                <Text style={[styles.link, { color: theme.tint }]}>Đăng ký ngay</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </Animated.ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#8e8e93',
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    loginActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    loginButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    biometricButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
    },
    link: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
