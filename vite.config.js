import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-svg': 'react-native-svg/src/ReactNativeSVG.web',
      'expo-font': '/src/web-stubs/expo-font.js',
    },
    extensions: ['.web.jsx', '.web.js', '.web.ts', '.web.tsx', '.jsx', '.js', '.ts', '.tsx'],
  },
})
