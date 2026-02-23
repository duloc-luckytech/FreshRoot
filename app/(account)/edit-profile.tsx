import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { updateProfile } from '@/services/profile-service';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { user, updateUser } = useAuthStore();

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên.');
            return;
        }

        setLoading(true);
        try {
            const response = await updateProfile({ name, phone, bio, avatar });
            if (response.data.success) {
                await updateUser({ name, phone, bio, avatar });
                Alert.alert('Thành công', 'Hồ sơ của bạn đã được cập nhật.');
                router.back();
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle">Sửa hồ sơ</ThemedText>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.tint} />
                    ) : (
                        <ThemedText style={{ color: colors.tint, fontWeight: 'bold' }}>Lưu</ThemedText>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.avatarSection}>
                    <Image source={{ uri: avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
                    <TouchableOpacity style={[styles.editAvatar, { backgroundColor: colors.tint }]}>
                        <IconSymbol name="lock.fill" size={16} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputSection}>
                    <ThemedText style={styles.inputLabel}>Họ và tên</ThemedText>
                    <TextInput
                        style={[styles.input, { backgroundColor: 'rgba(142, 142, 147, 0.1)', color: colors.text }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Nhập tên của bạn"
                        placeholderTextColor="#8e8e93"
                    />

                    <ThemedText style={styles.inputLabel}>Số điện thoại</ThemedText>
                    <TextInput
                        style={[styles.input, { backgroundColor: 'rgba(142, 142, 147, 0.1)', color: colors.text }]}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Nhập số điện thoại"
                        placeholderTextColor="#8e8e93"
                        keyboardType="phone-pad"
                    />

                    <ThemedText style={styles.inputLabel}>Giới thiệu (Bio)</ThemedText>
                    <TextInput
                        style={[styles.input, styles.bioInput, { backgroundColor: 'rgba(142, 142, 147, 0.1)', color: colors.text }]}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Một chút về bạn..."
                        placeholderTextColor="#8e8e93"
                        multiline
                        numberOfLines={4}
                    />

                    <ThemedText style={styles.inputLabel}>URL Ảnh đại diện</ThemedText>
                    <TextInput
                        style={[styles.input, { backgroundColor: 'rgba(142, 142, 147, 0.1)', color: colors.text }]}
                        value={avatar}
                        onChangeText={setAvatar}
                        placeholder="Dán link ảnh tại đây"
                        placeholderTextColor="#8e8e93"
                    />
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    content: {
        paddingHorizontal: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    editAvatar: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    inputSection: {
        gap: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
        opacity: 0.7,
    },
    input: {
        height: 55,
        borderRadius: 15,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    bioInput: {
        height: 120,
        paddingTop: 15,
        textAlignVertical: 'top',
    },
});
