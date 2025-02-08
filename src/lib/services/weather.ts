import { encrypt, decrypt } from '../utils/encryption';

export class WeatherService {
    private static readonly API_URL = 'http://localhost/weather_app';

    private static async makeRequest(endpoint: string, data: any, method: 'GET' | 'POST' = 'POST') {
        try {
            const encryptedData = await encrypt(data);
            
            const url = new URL(`${this.API_URL}/${endpoint}`);
            
            if (method === 'GET') {
                url.searchParams.append('data', encryptedData);
            }

            const response = await fetch(url.toString(), {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: method === 'POST' ? JSON.stringify({ data: encryptedData }) : undefined,
            });

            const result = await response.json();
            
            if (!result.success && result.error) {
                throw new Error(result.message || 'Request failed');
            }

            return result.data ? await decrypt(result.data) : result;
        } catch (error: any) {
            throw new Error(error.message || 'Request failed');
        }
    }

    static async getWeather(city: string, userId?: number) {
        return this.makeRequest('index.php', { city, user_id: userId });
    }

    static async getSearchHistory() {
        // Simplified to get all history without user_id
        return this.makeRequest('history.php', {}, 'GET');
    }
} 