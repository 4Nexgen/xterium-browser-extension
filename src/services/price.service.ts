export class PriceService {
    private socket: WebSocket | null = null;
    private readonly url = "wss://api.paydon.io/ws/prices";
    private listeners: ((data: any) => void)[] = [];
  
    constructor() {
      this.connect();
    }
  
    private connect() {
      this.socket = new WebSocket(this.url);
  
      this.socket.onopen = () => {
        console.log("Connected to WebSocket prices");
      };
  
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach((callback) => callback(data));
        } catch (err) {
          console.error("WebSocket message error:", err);
        }
      };
  
      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
  
      this.socket.onclose = () => {
        console.warn("WebSocket closed. Attempting to reconnect...");
        setTimeout(() => this.connect(), 3000);
      };
    }
  
    public onPriceUpdate(callback: (data: any) => void) {
      this.listeners.push(callback);
    }
  
    public close() {
      this.socket?.close();
    }
  }
  