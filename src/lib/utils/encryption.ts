// Shared encryption key - should match backend
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'weatherapp2024secure';

/**
 * Generates a CryptoKey for AES-256-CBC encryption/decryption
 * Uses SHA-256 to create a consistent key from the shared secret
 * @returns Promise<CryptoKey> The generated crypto key
 */
async function getEncryptionKey(): Promise<CryptoKey> {
    // Convert encryption key to bytes
    const encoder = new TextEncoder();
    const keyData = encoder.encode(ENCRYPTION_KEY);
    
    // Generate 256-bit hash of the key
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    
    // Import the hash as a CryptoKey
    return crypto.subtle.importKey(
        'raw',                    // Format of the key data
        hashBuffer,               // The key data
        { name: 'AES-CBC', length: 256 }, // Algorithm and key size
        false,                    // Not extractable
        ['encrypt', 'decrypt']    // Allowed operations
    );
}

/**
 * Encrypts data using AES-256-CBC
 * @param data Any data that can be JSON stringified
 * @returns Promise<string> Base64 encoded encrypted data
 */
export const encrypt = async (data: any): Promise<string> => {
    // Convert data to JSON string then to bytes
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonString);
    
    // Get encryption key and create IV
    const key = await getEncryptionKey();
    const iv = new Uint8Array(16); // 16 bytes of zeros
    
    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv },
        key,
        dataBuffer
    );
    
    // Convert to base64 string for transmission
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
};

/**
 * Decrypts AES-256-CBC encrypted data
 * @param encryptedData Base64 encoded encrypted data
 * @returns Promise<any> Decrypted data
 */
export const decrypt = async (encryptedData: string): Promise<any> => {
    try {
        // Convert base64 string back to bytes
        const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        
        // Get decryption key and create IV
        const key = await getEncryptionKey();
        const iv = new Uint8Array(16); // 16 bytes of zeros
        
        // Decrypt the data
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-CBC', iv },
            key,
            encryptedBytes
        );
        
        // Convert decrypted bytes back to original data
        const decoder = new TextDecoder();
        const jsonString = decoder.decode(decrypted);
        return JSON.parse(jsonString);
    } catch (error) {
        throw new Error('Failed to decrypt data');
    }
}; 