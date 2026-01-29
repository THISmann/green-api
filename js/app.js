/**
 * GREEN-API Test Page - Main Application
 * @author Senior Developer
 * @version 2.0.0
 */

class GreenApiClient {
    constructor() {
        // Get GREEN_API_URL from environment (injected by server from .env or default)
        this.GREEN_API_URL = window.ENV_GREEN_API_URL || 'https://api.green-api.com';
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadSavedCredentials();
        this.setupEventListeners();
    }

    /**
     * Get instance ID from input field
     * @returns {string} The instance ID value
     */
    getInstanceId() {
        return document.getElementById('idInstance').value.trim();
    }

    /**
     * Get API token from input field
     * @returns {string} The API token value
     */
    getApiToken() {
        return document.getElementById('apiToken').value.trim();
    }

    /**
     * Validate that credentials are provided
     * @returns {boolean} True if credentials are valid, false otherwise
     */
    validateCredentials() {
        const idInstance = this.getInstanceId();
        const apiToken = this.getApiToken();

        if (!idInstance) {
            this.showError('Please enter idInstance');
            return false;
        }

        if (!apiToken) {
            this.showError('Please enter ApiTokenInstance');
            return false;
        }

        return true;
    }

    /**
     * Build the complete API URL for a given method
     * @param {string} method - API method name (e.g., 'getSettings', 'sendMessage')
     * @returns {string} Complete API URL
     * @throws {Error} If credentials are missing
     */
    getApiUrl(method) {
        const idInstance = this.getInstanceId();
        const apiToken = this.getApiToken();
        
        if (!idInstance || !apiToken) {
            throw new Error('idInstance and ApiTokenInstance are required');
        }
        
        return `${this.GREEN_API_URL}/waInstance${idInstance}/${method}/${apiToken}`;
    }

    /**
     * Normalize chat ID to the required format
     * Automatically adds @c.us suffix if missing
     * @param {string} chatId - Chat ID input (can be phone number or full ID)
     * @returns {string} Normalized chat ID in format: 79991234567@c.us
     * @throws {Error} If phone number format is invalid
     */
    normalizeChatId(chatId) {
        chatId = chatId.trim();
        
        if (!chatId.includes('@')) {
            const phoneNumber = chatId.replace(/\D/g, '');
            if (phoneNumber.length < 10) {
                throw new Error('Invalid phone number format');
            }
            return `${phoneNumber}@c.us`;
        }
        
        return chatId;
    }

    /**
     * Display an error message to the user
     * @param {string} message - Error message to display
     */
    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        errorText.textContent = message;
        errorDiv.classList.remove('hidden');
        
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }

    /**
     * Display a success message to the user
     * @param {string} message - Success message to display
     */
    showSuccess(message) {
        const successDiv = document.getElementById('successMessage');
        const successText = document.getElementById('successText');
        successText.textContent = message;
        successDiv.classList.remove('hidden');
        
        setTimeout(() => {
            successDiv.classList.add('hidden');
        }, 3000);
    }

    /**
     * Set the loading indicator state
     * @param {boolean} loading - Whether to show or hide the loading indicator
     */
    setLoading(loading) {
        const loadingDiv = document.getElementById('loading');
        if (loading) {
            loadingDiv.classList.remove('hidden');
        } else {
            loadingDiv.classList.add('hidden');
        }
    }

    /**
     * Display API response in the response textarea
     * @param {Object} data - Response data to display
     */
    setResponse(data) {
        const responseTextarea = document.getElementById('response');
        responseTextarea.value = JSON.stringify(data, null, 2);
    }

    /**
     * Handle API response and parse it appropriately
     * @param {Response} response - Fetch API response object
     * @returns {Promise<Object>} Parsed response data
     */
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        const text = await response.text();
        return { error: text, status: response.status };
    }

    /**
     * Make an API request to GREEN-API
     * @param {string} method - API method name
     * @param {Object} [options={}] - Request options
     * @param {string} [options.method='GET'] - HTTP method
     * @param {Object} [options.body] - Request body for POST requests
     * @param {Object} [options.headers] - Additional headers
     * @returns {Promise<Object>} API response data
     * @throws {Error} If request fails
     */
    async makeRequest(method, options = {}) {
        if (!this.validateCredentials()) {
            return;
        }

        this.setLoading(true);
        
        try {
            const url = this.getApiUrl(method);
            const requestOptions = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...(options.body && { body: JSON.stringify(options.body) })
            };

            // Log request for debugging
            if (options.body) {
                console.log(`[${method}] Request:`, { url, body: options.body });
            } else {
                console.log(`[${method}] Request:`, { url });
            }

            const response = await fetch(url, requestOptions);
            const data = await this.handleResponse(response);
            
            if (response.ok) {
                this.setResponse(data);
                this.showSuccess(`${method} completed successfully`);
                return data;
            }
            
            // Handle error response
            this.setResponse(data);
            const errorMsg = data.errorText || data.error || data.message || 
                           `HTTP ${response.status}: ${response.statusText}`;
            this.showError(`Error: ${errorMsg}`);
            console.error(`[${method}] Error:`, data);
            throw new Error(errorMsg);
            
        } catch (error) {
            const errorData = { 
                error: error.message,
                name: error.name
            };
            this.setResponse(errorData);
            this.showError(`Request error: ${error.message}`);
            console.error(`[${method}] Request error:`, error);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Call the getSettings API method
     * @returns {Promise<Object>} Instance settings
     */
    async callGetSettings() {
        return await this.makeRequest('getSettings');
    }

    /**
     * Call the getStateInstance API method
     * @returns {Promise<Object>} Instance state information
     */
    async callGetStateInstance() {
        return await this.makeRequest('getStateInstance');
    }

    /**
     * Send a text message via GREEN-API
     * @returns {Promise<Object>} Send message response
     */
    async callSendMessage() {
        const chatIdInput = document.getElementById('messageChatId');
        const messageInput = document.getElementById('messageText');
        
        let chatId = chatIdInput.value.trim();
        if (!chatId) {
            this.showError('Phone number not entered');
            chatIdInput.focus();
            return;
        }

        try {
            chatId = this.normalizeChatId(chatId);
        } catch (error) {
            this.showError(error.message);
            chatIdInput.focus();
            return;
        }

        const message = messageInput.value.trim();
        if (!message) {
            this.showError('Message text not entered');
            messageInput.focus();
            return;
        }

        try {
            return await this.makeRequest('sendMessage', {
                method: 'POST',
                body: {
                    chatId: chatId,
                    message: message
                }
            });
        } catch (error) {
            // Error already handled in makeRequest
            throw error;
        }
    }

    /**
     * Send a file via URL using GREEN-API
     * @returns {Promise<Object>} Send file response
     */
    async callSendFileByUrl() {
        const chatIdInput = document.getElementById('fileChatId');
        const fileUrlInput = document.getElementById('fileUrl');
        
        let chatId = chatIdInput.value.trim();
        if (!chatId) {
            this.showError('Phone number not entered');
            chatIdInput.focus();
            return;
        }

        try {
            chatId = this.normalizeChatId(chatId);
        } catch (error) {
            this.showError(error.message);
            chatIdInput.focus();
            return;
        }

        const fileUrl = fileUrlInput.value.trim();
        if (!fileUrl) {
            this.showError('File URL not entered');
            fileUrlInput.focus();
            return;
        }

        try {
            return await this.makeRequest('sendFileByUrl', {
                method: 'POST',
                body: {
                    chatId: chatId,
                    urlFile: fileUrl,
                    fileName: 'file',
                    caption: ''
                }
            });
        } catch (error) {
            // Error already handled in makeRequest
            throw error;
        }
    }

    /**
     * Save credentials to browser localStorage
     */
    saveCredentials() {
        const idInstance = this.getInstanceId();
        const apiToken = this.getApiToken();
        
        if (idInstance) {
            localStorage.setItem('greenApi_idInstance', idInstance);
        }
        if (apiToken) {
            localStorage.setItem('greenApi_apiToken', apiToken);
        }
    }

    /**
     * Load saved credentials from browser localStorage
     */
    loadSavedCredentials() {
        const savedIdInstance = localStorage.getItem('greenApi_idInstance');
        const savedApiToken = localStorage.getItem('greenApi_apiToken');
        
        if (savedIdInstance) {
            document.getElementById('idInstance').value = savedIdInstance;
        }
        if (savedApiToken) {
            document.getElementById('apiToken').value = savedApiToken;
        }
    }

    /**
     * Setup all event listeners for user interactions
     */
    setupEventListeners() {
        // Save credentials when inputs change
        document.getElementById('idInstance').addEventListener('change', () => {
            this.saveCredentials();
        });

        document.getElementById('apiToken').addEventListener('change', () => {
            this.saveCredentials();
        });

        // API method button listeners
        document.getElementById('btnGetSettings').addEventListener('click', () => {
            this.callGetSettings();
        });

        document.getElementById('btnGetStateInstance').addEventListener('click', () => {
            this.callGetStateInstance();
        });

        document.getElementById('btnSendMessage').addEventListener('click', () => {
            this.callSendMessage();
        });

        document.getElementById('btnSendFileByUrl').addEventListener('click', () => {
            this.callSendFileByUrl();
        });
    }
}

// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.greenApiClient = new GreenApiClient();
});

// Expose methods globally for backward compatibility
window.callGetSettings = () => window.greenApiClient.callGetSettings();
window.callGetStateInstance = () => window.greenApiClient.callGetStateInstance();
window.callSendMessage = () => window.greenApiClient.callSendMessage();
window.callSendFileByUrl = () => window.greenApiClient.callSendFileByUrl();
