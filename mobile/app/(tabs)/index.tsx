import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import api from '@/lib/api';
import { FileDownloader, UploadProgress } from '@/lib/fileTransfer';
import { webrtcClient } from '@/lib/p2p/webrtcClient';
import { initDatabase } from '@/lib/storage/database';

interface File {
  id: string;
  fileName: string;
  size: number;
  mimeType: string;
  ownerId: string;
  createdAt: string;
}

export default function FilesScreen() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<UploadProgress | null>(null);
  const [p2pInitialized, setP2pInitialized] = useState(false);

  useEffect(() => {
    initializeP2P();
    initDatabase();
    fetchFiles();
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

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // Get all files
      const filesResponse = await api.get('/files');
      let allFiles = filesResponse.data;

      // Get online peers
      const peersResponse = await api.get('/peers');
      const onlinePeers = peersResponse.data.filter((p: any) => p.isOnline);
      const onlinePeerUserIds = new Set(onlinePeers.map((p: any) => p.userId));

      // Filter files from online peers only
      allFiles = allFiles.filter((file: File) => onlinePeerUserIds.has(file.ownerId));

      setFiles(allFiles);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      Alert.alert('Error', 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleDownload = (file: File) => {
    if (!p2pInitialized) {
      Alert.alert('Error', 'P2P network not initialized');
      return;
    }

    Alert.alert('Download', `Download ${file.fileName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Download', onPress: () => downloadFile(file) },
    ]);
  };

  const downloadFile = async (file: File) => {
    setDownloading(true);
    setDownloadProgress({
      loaded: 0,
      total: file.size,
      percentage: 0,
      currentChunk: 0,
      totalChunks: Math.ceil(file.size / (1024 * 1024)),
    });

    try {
      const downloader = new FileDownloader(file.id, (prog) => setDownloadProgress(prog));
      const filePath = await downloader.download();

      setDownloading(false);
      setDownloadProgress(null);

      Alert.alert('Success', 'File downloaded successfully!', [
        {
          text: 'Share',
          onPress: async () => {
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
              await Sharing.shareAsync(filePath);
            }
          },
        },
        { text: 'OK' },
      ]);
    } catch (error: any) {
      console.error('Download error:', error);
      setDownloading(false);
      setDownloadProgress(null);
      Alert.alert('Error', `Download failed: ${error.message}`);
    }
  };

  const renderFile = ({ item }: { item: File }) => (
    <TouchableOpacity style={styles.fileCard} onPress={() => handleDownload(item)}>
      <View style={styles.fileIcon}>
        <Ionicons name="document-outline" size={32} color={Colors.text} />
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.fileName}
        </Text>
        <Text style={styles.fileSize}>{formatSize(item.size)}</Text>
      </View>
      <Ionicons name="download-outline" size={24} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {!p2pInitialized && (
        <View style={styles.banner}>
          <ActivityIndicator size="small" color={Colors.darkText} />
          <Text style={styles.bannerText}>Initializing P2P network...</Text>
        </View>
      )}

      <FlatList
        data={files}
        renderItem={renderFile}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchFiles} tintColor={Colors.text} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No files available</Text>
            <Text style={styles.emptySubtext}>Files from online peers will appear here</Text>
          </View>
        }
      />

      <Modal visible={downloading} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={Colors.text} />
            <Text style={styles.modalTitle}>Downloading...</Text>
            {downloadProgress && (
              <>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${downloadProgress.percentage}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {downloadProgress.percentage}% - Chunk {downloadProgress.currentChunk} of{' '}
                  {downloadProgress.totalChunks}
                </Text>
                <Text style={styles.progressSubtext}>
                  {formatSize(downloadProgress.loaded)} / {formatSize(downloadProgress.total)}
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.darkBackground,
  },
  bannerText: {
    fontSize: 14,
    color: Colors.darkText,
  },
  list: {
    padding: 16,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fileIcon: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  progressBar: {
    width: 240,
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
    textAlign: 'center',
  },
  progressSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
