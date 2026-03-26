import { EventBus } from "../../application/interfaces/EventBus";

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Array<(event: any) => void>>();

  publish(event: any): void {
    const name = event.constructor.name;
    const handlers = this.handlers.get(name) || [];

    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${name}:`, error);
      }
    }
  }

  subscribe(eventName: string, handler: (event: any) => void): void {
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(handler);
    this.handlers.set(eventName, handlers);
  }

  unsubscribe(eventName: string, handler: (event: any) => void): void {
    const handlers = this.handlers.get(eventName) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.handlers.set(eventName, handlers);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}