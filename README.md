# Calculadora Científica

Aplicación de calculadora científica con graficador de funciones, construida con **React Native** y **Expo**. Funciona en Android, iOS y Web.

## Características

### Calculadora

- **Operaciones básicas**: suma, resta, multiplicación, división
- **Funciones trigonométricas**: sin, cos, tan (en grados)
- **Funciones avanzadas**:
  - Logaritmos: `ln` (natural), `log` (base 10)
  - Raíz cuadrada `√`
  - Potencias: `x²`, `x³`, `xʸ` (potencia arbitraria)
  - Recíproco `1/x`
  - Exponenciales: `eˣ`, `10ˣ`
  - Factorial `n!`
  - Valor absoluto `|x|`
- **Constantes**: π (Pi), e (número de Euler)
- **Paréntesis** para agrupar expresiones
- **Operaciones de edición**: borrar carácter (DEL), limpiar todo (C), cambio de signo (±), porcentaje (%)
- **Historial de expresión** visible sobre el resultado
- **Tamaño de fuente adaptativo** según la longitud del número

### Fracciones

- Operaciones entre fracciones: suma, resta, multiplicación, división
- **Simplificación automática** usando el máximo común divisor
- Resultado mostrado como fracción irreducible y valor decimal

### Matrices

- Matrices **2×2 y 3×3** configurables
- Operaciones binarias: **A+B**, **A−B**, **A×B** (multiplicación matricial)
- Operaciones unitarias: **Transpuesta**, **Determinante**, **Inversa**
- Detección de matrices singulares (sin inversa)
- Resultados redondeados a 6 cifras significativas

### Límites y Derivadas

- Entrada de funciones en notación estándar (igual que el graficador)
- **Límites numéricos**: calcula lim(x→a) con aproximación bilateral
  - Detecta si el límite existe comparando límites laterales
  - Muestra límite izquierdo y derecho por separado cuando no existe
  - Soporta resultados ±∞
- **Derivadas numéricas** en un punto dado:
  - Primera derivada f′(x) por diferencias centrales
  - Segunda derivada f″(x)
  - Ecuación de la recta tangente

### Graficador de Funciones

- Grafica hasta **6 funciones simultáneas** en colores distintos
- Ingreso de funciones en notación matemática estándar:
  - `sin(x)`, `cos(x)`, `tan(x)`, `asin(x)`, `acos(x)`, `atan(x)`
  - `ln(x)`, `log(x)`, `sqrt(x)`, `abs(x)`, `exp(x)`
  - `x^2` para potencias
  - Constantes `pi` y `e`
- **Navegación interactiva**: arrastra el gráfico para mover la vista
- **Zoom**: acercar y alejar con botones
- **Resetear vista** al rango inicial (x: −10 a 10, y: −6 a 6)
- **Cuadrícula y ejes** con etiquetas de escala automática
- Agregar y eliminar funciones dinámicamente

### Interfaz

- **Tema oscuro** (fondo azul marino, acentos rojos) y **tema claro** (fondo gris, acentos azules)
- Cambio de tema con un botón en la barra de navegación
- Navegación por pestañas: **Calculadora** y **Gráficas**
- Diseño responsivo adaptado a móvil y web

## Tecnologías

| Paquete | Versión |
|---|---|
| Expo | ~52.0.0 |
| React Native | 0.76.3 |
| React | 18.3.1 |
| react-native-web | ~0.19.13 |
| react-native-svg | ^15.8.0 |

## Ejecución

```bash
# Instalar dependencias
npm install

# Web
npx expo start --web

# Android
npx expo start --android

# iOS
npx expo start --ios
```

La app web queda disponible en `http://localhost:8081`.
