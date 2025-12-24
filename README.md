# Vidioo - Video Streaming Platform

Vidioo is a modern, open-source video streaming platform built with Vue.js. It serves as a frontend for video content, providing a clean and responsive interface for watching and managing videos.

## 🚀 Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Video Playback**: Integrated with Shaka Player for high-quality video streaming
- **Persian Localization**: Fully localized in Persian with Vazirmatn font support
- **Content Management**: Browse, search, and manage video content
- **Subscription System**: Local subscription management for channels
- **Watch History**: Track your viewing history with local storage
- **Like/Dislike System**: Rate videos with persistent local storage
- **PWA Support**: Installable as a Progressive Web App
- **RTL Support**: Right-to-left layout support for Persian language
- **Custom Instance Support**: Ability to connect to different backend instances

## 🛠️ Tech Stack

- **Vue.js 3**: Progressive JavaScript framework with Composition API
- **Vue Router**: Client-side routing
- **Vue I18n**: Internationalization support
- **UnoCSS**: Instant on-demand atomic CSS engine
- **Vite**: Next-generation frontend tooling
- **Shaka Player**: JavaScript library for adaptive media playback
- **PWA**: Progressive Web App capabilities
- **Jalali Calendar**: Persian calendar support

## 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm/yarn

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd vidioo
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Set up environment variables by creating a `.env` file:
   ```env
   VITE_PIPED_API=https://your-backend-api.com
   VITE_SITE_NAME=Vidioo
   VITE_DISABLE_LIVESTREAMS=false
   ```

4. Start the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production build:

```bash
pnpm build
```

To preview the production build locally:

```bash
pnpm preview
```

## 📁 Project Structure

```
src/
├── components/     # Vue components
├── router/         # Vue Router configuration
├── locales/        # Internationalization files
├── utils/          # Utility functions
├── assets/         # Static assets
├── App.vue         # Main application component
└── main.js         # Application entry point
```

## 🧰 Development Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Lint source files
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm format` - Format code with Prettier

## 🔧 Configuration

The application uses several environment variables that can be configured in a `.env` file:

- `VITE_PIPED_API`: Backend API endpoint
- `VITE_SITE_NAME`: Name of the site
- `VITE_DISABLE_LIVESTREAMS`: Whether to disable livestreams
- `VITE_COUNTRY_REGION`: Country/region for localization

## 📱 Progressive Web App (PWA)

This application is built as a PWA with the following features:
- Installable on devices
- Works offline (with cached content)
- Fast loading with service worker
- Responsive design for all screen sizes

## 🌐 Localization

The application currently supports Persian (Farsi) localization. The i18n system is set up to support additional languages in the future.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please make sure to run `pnpm lint` and `pnpm format` before submitting your PR.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please open an issue in the repository.

## 🙏 Acknowledgments

- Built with [Vue.js](https://vuejs.org/)
- Styled with [UnoCSS](https://github.com/unocss/unocss)
- Video playback powered by [Shaka Player](https://github.com/shaka-project/shaka-player)
- Icons from [Iconify](https://iconify.design/)
- Persian font support with [Vazirmatn](https://github.com/rastikerdar/vazirmatn)
