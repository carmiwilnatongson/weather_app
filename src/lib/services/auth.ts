import { encrypt, decrypt } from '../utils/encryption';

export class AuthService {
    // Base URL for authentication endpoints
    private static readonly API_URL = 'http://localhost/weather_app/auth';

    /**
     * Makes an encrypted request to the authentication API
     * @param endpoint API endpoint (e.g., 'login.php')
     * @param data Data to be encrypted and sent
     * @returns Promise<any> Decrypted response data
     */
    private static async makeRequest(endpoint: string, data: any) {
        try {
            // Encrypt request data
            const encryptedData = await encrypt(data);
            
            // Make POST request with encrypted data
            const response = await fetch(`${this.API_URL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: encryptedData }),
            });

            const result = await response.json();
            
            // Check for error response
            if (!result.success && result.message) {
                throw new Error(result.message);
            }

            // Decrypt response data if present
            return result.data ? await decrypt(result.data) : result;
        } catch (error: any) {
            throw new Error(error.message || `${endpoint} failed`);
        }
    }

    /**
     * Authenticates user credentials
     * @param username User's username
     * @param password User's password
     */
    static async login(username: string, password: string) {
        return this.makeRequest('login.php', { username, password });
    }

    /**
     * Registers a new user
     * @param username Desired username
     * @param password Desired password
     */
    static async register(username: string, password: string) {
        return this.makeRequest('register.php', { username, password });
    }
} 