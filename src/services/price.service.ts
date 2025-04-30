import axios from "axios";

export class PriceService {
  private baseUrl = "https://api.paydon.io";

  async getPrices(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/price/with-symbols`, {
        headers: {
          Accept: "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      } else {
        console.error("Error fetching prices:", error.message);
      }
      throw error;
    }
  }
}