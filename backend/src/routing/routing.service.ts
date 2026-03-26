import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutingTableEntity } from './entities/routing-table.entity';
import { ConnectionMetricsEntity } from './entities/connection-metrics.entity';

interface Route {
  hops: string[];
  totalLatency: number;
  totalBandwidth: number;
  reliability: number;
}

@Injectable()
export class RoutingService {
  constructor(
    @InjectRepository(RoutingTableEntity)
    private routingRepository: Repository<RoutingTableEntity>,
    @InjectRepository(ConnectionMetricsEntity)
    private metricsRepository: Repository<ConnectionMetricsEntity>,
  ) {}

  async findRoute(sourcePeerId: string, destinationPeerId: string): Promise<Route> {
    // Проверяем кэш
    const cached = await this.routingRepository.findOne({
      where: { sourcePeerId, destinationPeerId }
    });

    if (cached && this.isCacheValid(cached.updatedAt)) {
      return this.reconstructRoute(cached);
    }

    // Строим граф и применяем Дейкстру
    const graph = await this.buildGraph();
    const route = this.dijkstra(graph, sourcePeerId, destinationPeerId);

    // Кэшируем результат
    await this.cacheRoute(sourcePeerId, destinationPeerId, route);

    return route;
  }

  private async buildGraph(): Promise<Map<string, Map<string, number>>> {
    const metrics = await this.metricsRepository.find();
    const graph = new Map<string, Map<string, number>>();

    for (const metric of metrics) {
      if (!graph.has(metric.peerAId)) {
        graph.set(metric.peerAId, new Map());
      }
      if (!graph.has(metric.peerBId)) {
        graph.set(metric.peerBId, new Map());
      }

      // Вес = комбинация latency, bandwidth, packet loss
      const weight = this.calculateWeight(metric);
      
      graph.get(metric.peerAId).set(metric.peerBId, weight);
      graph.get(metric.peerBId).set(metric.peerAId, weight);
    }

    return graph;
  }

  private calculateWeight(metric: ConnectionMetricsEntity): number {
    return (
      metric.avgLatencyMs * 0.4 +
      (1000 / (metric.avgBandwidthMbps || 1)) * 0.3 +
      metric.packetLossRate * 100 * 0.3
    );
  }

  private dijkstra(
    graph: Map<string, Map<string, number>>,
    start: string,
    end: string
  ): Route {
    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    const unvisited = new Set<string>(graph.keys());

    distances.set(start, 0);

    while (unvisited.size > 0) {
      const current = this.getMinDistanceNode(distances, unvisited);
      if (!current || current === end) break;

      unvisited.delete(current);

      const neighbors = graph.get(current) || new Map();
      for (const [neighbor, weight] of neighbors.entries()) {
        if (!unvisited.has(neighbor)) continue;

        const distance = (distances.get(current) || Infinity) + weight;
        if (distance < (distances.get(neighbor) || Infinity)) {
          distances.set(neighbor, distance);
          previous.set(neighbor, current);
        }
      }
    }

    return this.buildRoute(previous, start, end, distances.get(end) || 0);
  }

  private getMinDistanceNode(
    distances: Map<string, number>,
    unvisited: Set<string>
  ): string | null {
    let minDistance = Infinity;
    let minNode: string | null = null;

    for (const node of unvisited) {
      const distance = distances.get(node) || Infinity;
      if (distance < minDistance) {
        minDistance = distance;
        minNode = node;
      }
    }

    return minNode;
  }

  private buildRoute(
    previous: Map<string, string>,
    start: string,
    end: string,
    totalCost: number
  ): Route {
    const hops: string[] = [];
    let current = end;

    while (current !== start) {
      hops.unshift(current);
      current = previous.get(current);
      if (!current) break;
    }
    hops.unshift(start);

    return {
      hops,
      totalLatency: Math.round(totalCost * 0.4),
      totalBandwidth: Math.round(1000 / (totalCost * 0.3 || 1)),
      reliability: Math.max(0, 1 - totalCost / 1000)
    };
  }

  private isCacheValid(updatedAt: Date): boolean {
    const cacheLifetime = 60000; // 1 минута
    return Date.now() - updatedAt.getTime() < cacheLifetime;
  }

  private async cacheRoute(
    sourcePeerId: string,
    destinationPeerId: string,
    route: Route
  ): Promise<void> {
    const nextHop = route.hops.length > 1 ? route.hops[1] : destinationPeerId;
    
    await this.routingRepository.upsert(
      {
        sourcePeerId,
        destinationPeerId,
        nextHopPeerId: nextHop,
        hopCount: route.hops.length - 1,
        costMetric: route.totalLatency
      },
      ['sourcePeerId', 'destinationPeerId']
    );
  }

  private reconstructRoute(cached: RoutingTableEntity): Route {
    return {
      hops: [cached.sourcePeerId, cached.nextHopPeerId],
      totalLatency: cached.costMetric,
      totalBandwidth: 100,
      reliability: 0.95
    };
  }

  async updateMetrics(
    peerAId: string,
    peerBId: string,
    latency: number,
    bandwidth: number,
    packetLoss: number = 0
  ): Promise<void> {
    await this.metricsRepository.upsert(
      {
        peerAId,
        peerBId,
        avgLatencyMs: latency,
        avgBandwidthMbps: bandwidth,
        packetLossRate: packetLoss
      },
      ['peerAId', 'peerBId']
    );

    // Инвалидируем кэш маршрутов
    await this.routingRepository.delete({ sourcePeerId: peerAId });
    await this.routingRepository.delete({ sourcePeerId: peerBId });
  }
}
