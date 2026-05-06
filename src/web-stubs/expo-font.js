export function useFonts(fontMap) {
  if (typeof document !== 'undefined') {
    Object.entries(fontMap).forEach(([name, src]) => {
      const id = `font-${name}`
      if (!document.getElementById(id)) {
        const style = document.createElement('style')
        style.id = id
        const url = typeof src === 'string' ? src : src
        style.textContent = `@font-face { font-family: '${name}'; src: url('${url}'); }`
        document.head.appendChild(style)
      }
    })
  }
  return [true, null]
}
