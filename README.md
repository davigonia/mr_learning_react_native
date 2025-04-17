# Mr. Learning - React Native Web Version

A cross-platform version of the Mr. Learning voice learning app for kids, built with React Native Web. This version allows the app to work on both web browsers and native mobile platforms, including iOS where browser-based voice input is restricted.

## Features

- **Voice Input in Cantonese**: Kids can ask questions by speaking Cantonese
- **Voice Output in Cantonese**: Answers are provided in spoken Cantonese
- **Child-Friendly UI**: Simple, colorful, and toy-like design
- **Parental Controls**: PIN-protected dashboard with banned words, history, and settings
- **Cross-Platform**: Works on web browsers and can be compiled to native iOS/Android apps

## Project Structure

This project uses:
- React Native for the component structure
- React Native Web for web compatibility
- Web Speech API for voice input/output on web browsers
- React Native Voice and TTS libraries for native platforms

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd mr-learning-react-native-web
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Replace the API key in `src/screens/HomeScreen.js`:
   ```javascript
   const apiKey = '[YOUR_GROK_API_KEY]';
   ```

### Running the Web Version

To run the web version locally:

```
npm start
```

This will start a development server at http://localhost:3000

### Building for Production (Web)

To build the web version for production:

```
npm run build
```

This will create a production-ready build in the `dist` directory.

### Deploying to Netlify

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

## Converting to Native Apps

To convert this project to native iOS/Android apps:

1. Create a new React Native project
2. Copy the `src` directory to the new project
3. Install the required native dependencies
4. Update the imports to use the native versions of components

## Browser Compatibility

- **Best experience**: Chrome (desktop and mobile)
- **Good support**: Edge, Safari (iOS)
- **Limited support**: Firefox (voice recognition may require permissions)

## Security Considerations

- API key should not be hardcoded in production
- Consider implementing rate limiting for API calls
- All user data is stored locally in the browser/device

## License

This project is provided as-is for educational purposes.
