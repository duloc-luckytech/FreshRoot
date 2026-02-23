import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { askAI, IAIResponse } from '@/services/ai-service';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function AIChatScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Xin chào! Tôi là trợ lý nấu ăn FreshRoot AI. Bạn cần tôi giúp gì về cách nấu, chất lượng nguyên liệu hay rủi ro thực phẩm không?',
            sender: 'ai',
            timestamp: new Date(),
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = async () => {
        if (!inputText.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            const response = await askAI(userMsg.text);
            const aiReply: IAIResponse = response.data.data;

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiReply.reply,
                sender: 'ai',
                timestamp: new Date(aiReply.timestamp),
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Xin lỗi, tôi gặp sự cố khi kết nối. Vui lòng thử lại sau!',
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageWrapper,
            item.sender === 'user' ? styles.userWrapper : styles.aiWrapper
        ]}>
            <View style={[
                styles.messageBubble,
                item.sender === 'user' ? { backgroundColor: colors.tint } : { backgroundColor: 'rgba(142, 142, 147, 0.1)' }
            ]}>
                <ThemedText style={[
                    styles.messageText,
                    item.sender === 'user' ? { color: '#FFF' } : { color: colors.text }
                ]}>
                    {item.text}
                </ThemedText>
            </View>
            <ThemedText style={styles.timestamp}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <ThemedText type="subtitle" style={styles.headerTitle}>FreshRoot AI</ThemedText>
                    <View style={styles.statusRow}>
                        <View style={styles.statusDot} />
                        <ThemedText style={styles.statusText}>Trực tuyến</ThemedText>
                    </View>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? '#FFF' : '#1C1C1E' }]}>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Hỏi AI về nấu ăn, nguyên liệu..."
                        placeholderTextColor="#8e8e93"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, { backgroundColor: colors.tint }]}
                        onPress={handleSend}
                        disabled={loading || !inputText.trim()}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <IconSymbol name="paperplane.fill" size={20} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(142, 142, 147, 0.1)',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2ECC71',
    },
    statusText: {
        fontSize: 12,
        color: '#8e8e93',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    messageWrapper: {
        marginBottom: 20,
        maxWidth: '80%',
    },
    userWrapper: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    aiWrapper: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    messageBubble: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 20,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    timestamp: {
        fontSize: 10,
        color: '#8e8e93',
        marginTop: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(142, 142, 147, 0.1)',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(142, 142, 147, 0.1)',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 16,
    },
    sendBtn: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
