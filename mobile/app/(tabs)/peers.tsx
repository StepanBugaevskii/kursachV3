import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import api from '@/lib/api';

interface Peer {
  id: string;
  peerId: string;
  userId: string;
  isOnline: boolean;
  clientType: string;
  lastSeenAt: string;
}

export default function PeersScreen() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPeers();
  }, []);

  const fetchPeers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/peers');
      setPeers(response.data);
    } catch (error) {
      console.error('Failed to fetch peers:', error);
      Alert.alert('Error', 'Failed to load peers');
    } finally {
      setLoading(false);
    }
  };

  const renderPeer = ({ item }: { item: Peer }) => (
    <View style={styles.peerCard}>
      <View style={[styles.statusDot, item.isOnline && styles.statusOnline]} />
      <View style={styles.peerInfo}>
        <Text style={styles.peerId} numberOfLines={1}>
          {item.peerId}
        </Text>
        <Text style={styles.peerStatus}>
          {item.isOnline ? 'Online' : 'Offline'} • {item.clientType}
        </Text>
      </View>
      <Ionicons
        name={item.isOnline ? 'checkmark-circle' : 'close-circle'}
        size={24}
        color={item.isOnline ? Colors.success : Colors.textSecondary}
      />
    </View>
  );

  const onlinePeers = peers.filter((p) => p.isOnline);
  const offlinePeers = peers.filter((p) => !p.isOnline);

  return (
    <View style={styles.container}>
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{peers.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.success }]}>{onlinePeers.length}</Text>
          <Text style={styles.statLabel}>Online</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{offlinePeers.length}</Text>
          <Text style={styles.statLabel}>Offline</Text>
        </View>
      </View>

      <FlatList
        data={peers}
        renderItem={renderPeer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPeers} tintColor={Colors.text} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No peers found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stats: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  peerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.textSecondary,
    marginRight: 12,
  },
  statusOnline: {
    backgroundColor: Colors.success,
  },
  peerInfo: {
    flex: 1,
  },
  peerId: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  peerStatus: {
    fontSize: 12,
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
});
