import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const stub = (name) => path.resolve(__dirname, `src/web-stubs/${name}.js`)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-svg': 'react-native-svg/src/ReactNativeSVG.web',
      'expo-font': stub('expo-font'),
      '@react-native/assets-registry/registry': stub('assets-registry'),
    },
    extensions: ['.web.jsx', '.web.js', '.web.ts', '.web.tsx', '.jsx', '.js', '.ts', '.tsx'],
  },
})
