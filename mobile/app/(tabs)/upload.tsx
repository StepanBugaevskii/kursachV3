import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { FileUploader, UploadProgress } from '@/lib/fileTransfer';
import { webrtcClient } from '@/lib/p2p/webrtcClient';
import { initDatabase } from '@/lib/storage/database';

export default function UploadScreen() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [p2pInitialized, setP2pInitialized] = useState(false);

  useEffect(() => {
    initializeP2P();
    initDatabase();
  }, []);

  const initializeP2P = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      if (!webrtcClient.getPeerId()) {
        await webrtcClient.initialize(userId);
        setP2pInitialized(true);
        console.log('✅ P2P initialized');
      } else {
        setP2pInitialized(true);
      }
    } catch (error) {
      console.error('P2P initialization error:', error);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        console.log('Selected file:', file.name, file.size);
      }
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    if (!p2pInitialized) {
      Alert.alert('Error', 'P2P network not initialized');
      return;
    }

    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setUploading(true);
    try {
      const uploader = new FileUploader(
        selectedFile.uri,
        selectedFile.name,
        selectedFile.size,
        (prog) => setProgress(prog)
      );

      const fileId = await uploader.upload(userId);
      
      Alert.alert('Success', 'File uploaded successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setSelectedFile(null);
            setProgress(null);
          },
        },
      ]);
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', `Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {!uploading ? (
          <>
            <Ionicons name="cloud-upload-outline" size={96} color={Colors.textSecondary} />
            <Text style={styles.title}>Upload File</Text>
            <Text style={styles.subtitle}>
              {p2pInitialized
                ? 'Select a file to share with the network'
                : 'Initializing P2P network...'}
            </Text>

            {selectedFile && (
              <View style={styles.filePreview}>
                <Ionicons name="document-outline" size={32} color={Colors.text} />
                <View style={styles.filePreviewInfo}>
                  <Text style={styles.filePreviewName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.filePreviewSize}>{formatSize(selectedFile.size)}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedFile(null)}>
                  <Ionicons name="close-circle" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, !p2pInitialized && styles.buttonDisabled]}
              onPress={pickFile}
              disabled={!p2pInitialized}
            >
              <Ionicons name="document-outline" size={24} color={Colors.darkText} />
              <Text style={styles.buttonText}>Choose File</Text>
            </TouchableOpacity>

            {selectedFile && (
              <TouchableOpacity style={[styles.button, styles.uploadButton]} onPress={uploadFile}>
                <Ionicons name="cloud-upload-outline" size={24} color={Colors.darkText} />
                <Text style={styles.buttonText}>Upload</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={Colors.text} />
            <Text style={styles.uploadingTitle}>Uploading...</Text>
            {progress && (
              <>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {progress.percentage}% - Chunk {progress.currentChunk} of {progress.totalChunks}
                </Text>
                <Text style={styles.progressSubtext}>
                  {formatSize(progress.loaded)} / {formatSize(progress.total)}
                </Text>
              </>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    width: '100%',
  },
  filePreviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  filePreviewName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  filePreviewSize: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: Colors.darkBackground,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  uploadButton: {
    backgroundColor: Colors.text,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkText,
  },
  uploadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.text,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  progressSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
