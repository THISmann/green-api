# GREEN-API Test Page

A clean, professional HTML page for testing GREEN-API methods with a modern Tailwind CSS interface.

## Features

- ✅ **Four API Methods**: getSettings, getStateInstance, sendMessage, sendFileByUrl
- ✅ **Two-Column Layout**: Inputs on the left, responses on the right
- ✅ **Modern UI**: Built with Tailwind CSS
- ✅ **No Dependencies**: Pure HTML, CSS, and JavaScript
- ✅ **Responsive Design**: Works on all devices
- ✅ **Auto-save Credentials**: LocalStorage integration

## Quick Start

1. Create a `.env` file with your API configuration:
   ```env
   GREEN_API_URL=https://api.green-api.com
   ```
   
   **Note:** Only `GREEN_API_URL` is used (not `API_BASE_URL`).

2. Start the server:
   ```bash
   npm start
   # or
   node server.js
   ```

3. Open http://localhost:8080 in your browser

4. Enter your GREEN-API credentials:
   - `idInstance` - From https://console.green-api.com/
   - `ApiTokenInstance` - From https://console.green-api.com/

5. Test the API methods by clicking the buttons

## Project Structure

```
green-api/
├── index.html          # Main HTML page
├── server.js           # HTTP server with .env injection
├── js/
│   └── app.js         # Application JavaScript (ES6 class)
├── .env               # Environment variables (create this)
├── package.json       # npm configuration
└── README.md          # This file
```

## API Methods

### getSettings
Retrieves instance settings from GREEN-API.

### getStateInstance
Checks the current state of the instance (authorized, notAuthorized, etc.).

### sendMessage
Sends a text message to a WhatsApp number.
- **Phone Number**: Format `77771234567` or `77771234567@c.us`
- **Message**: Text content to send

### sendFileByUrl
Sends a file via URL to a WhatsApp number.
- **Phone Number**: Format `77771234567` or `77771234567@c.us`
- **File URL**: Public URL of the file to send

## Configuration

The application reads `GREEN_API_URL` from the `.env` file:

```env
GREEN_API_URL=https://api.green-api.com
```

The server automatically injects this value into the HTML page. If not set, it defaults to `https://api.green-api.com`.

**Important:** The code uses `GREEN_API_URL` everywhere (not `API_BASE_URL`).

## Technologies

- **Node.js** - HTTP server with .env support
- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla JavaScript** - ES6+ classes, no frameworks
- **GREEN-API** - WhatsApp API integration

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

---

**GREEN API © 2025**
