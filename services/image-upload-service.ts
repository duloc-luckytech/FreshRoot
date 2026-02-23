import * as ImagePicker from 'expo-image-picker';
import apiClient from './api-client';

export const uploadImage = async (uri: string): Promise<string | null> => {
    try {
        const formData = new FormData();

        // Extract filename and type
        const filename = uri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        // @ts-ignore - FormData expects an object with specific shape in React Native
        formData.append('image', {
            uri,
            name: filename,
            type
        });

        const response = await apiClient.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data.success) {
            return response.data.data.url;
        }
        return null;
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
};

export const pickImage = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
        alert('Cần quyền truy cập thư viện ảnh để thực hiện chức năng này!');
        return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
    }

    return null;
};
