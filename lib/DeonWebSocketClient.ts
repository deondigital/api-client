import { ContractUpdate } from './DeonApi';
import { ExternalObject } from './ExternalObject';

/**
 * Constructs a Deon WebSocket client, and returns object wrapping the connection,
 * which exposes a "reconnect" method that can be used to attempt to reestablish
 * a connection, and a "close" method for closing the connection.
 *
 * @param host - current hostname, e.g., `window.location.host`.
 * @param protocol - protocol string (`"ws"` or `"wss"`)
 * @param wsCtor - a constructor for an object that implements the `WebSocket` interface
 * @param messageHandler - function to call when message is received through the WebSocket.
 * @param offlineHook - function to call when connection fails.
 */
class DeonWebSocketClient {
  constructor(
    host: string,
    protocol : string,
    private wsCtor: (url : string) => WebSocket,
    private messageHandler: (msg: ContractUpdate) => void,
    private offlineHook: () => void,
    private identity: ExternalObject,
  ) {
    this.url = `${protocol}://${host}/contractUpdates`;
    this.start();
  }

  private url: string;
  private ws: WebSocket | undefined;

  close(): void {
    if (this.ws !== undefined) {
      this.ws.close();
    }
  }

  start(): void {
    this.close();
    this.ws = this.wsCtor(this.url);
    this.ws.onmessage = e => this.messageHandler(JSON.parse(e.data));
    this.ws.onerror = _ => this.offlineHook();
    this.ws.onclose = _ => this.offlineHook();
    this.ws.onopen = (e) => {
      if (e.type === 'close') {
        this.offlineHook();
      }
      this.ws!.send(`Deon-Digital-Identity: ${JSON.stringify(this.identity)}`);
    };
  }

  reconnect(): void {
    if (this.ws === undefined || this.ws.readyState === this.ws.CLOSED) {
      this.start();
    }
  }
}

interface WebSocket {
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null;
  onerror: ((this: WebSocket, ev: Event) => any) | null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null;
  onopen: ((this: WebSocket, ev: Event) => any) | null;
  readonly readyState: number;
  close(code?: number, reason?: string): void;
  send(data: string): void;
  readonly CLOSED: number;
}

interface CloseEvent {}
interface MessageEvent {
  readonly data: any;
}
interface Event {
  readonly type: string;
}

export { DeonWebSocketClient };
