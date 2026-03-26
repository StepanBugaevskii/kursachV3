export interface EventBus {
  publish(event: any): void;
  subscribe(eventName: string, handler: (event: any) => void): void;
}