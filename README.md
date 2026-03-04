# 🏛️ Asesoría Previsional IA

Sistema inteligente de asesoría previsional para Chile, potenciado por **Google Gemini AI**.

## ✨ Características

- 📄 **Análisis de Documentos PDF** - Extrae automáticamente datos de SCOMP, Certificados de Saldo, Cartolas
- 🤖 **Google Gemini Vision** - OCR avanzado para PDFs de cualquier tamaño, incluyendo documentos escaneados
- 📝 **Generación de Informes** - Crea informes de asesoría previsional estructurados (Secciones 1-6)
- ✏️ **Modificación Inteligente** - Modifica informes con instrucciones en lenguaje natural
- 📋 **Contratos DOCX** - Genera contratos profesionales en formato Word
- 🌓 **Dark/Light Mode** - Interfaz moderna con soporte para tema claro/oscuro

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- **API Key de Google Gemini** (gratuita)

### Obtener API Key de Google Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la clave generada

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/lbarria2004/Generador-de-informes.git
cd Generador-de-informes

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

### Deploy en Vercel

1. Conecta tu repositorio en [vercel.com](https://vercel.com)
2. La aplicación se desplegará automáticamente
3. No se requieren variables de entorno (la API Key la ingresa el usuario)

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx              # Página principal
│   ├── layout.tsx            # Layout con providers
│   ├── globals.css           # Estilos globales
│   └── api/
│       ├── analyze/          # Análisis de PDFs con Gemini Vision
│       ├── generate-report/  # Generación de informes
│       ├── modify-report/    # Modificación de informes
│       └── generate-contract/# Generación de contratos DOCX
├── components/
│   └── ui/                   # Componentes shadcn/ui
├── lib/
│   └── gemini-service.ts     # Servicio de Google Gemini
└── types/
    └── index.ts              # Tipos TypeScript
```

## 🔧 Flujo de Trabajo

1. **Ingresar API Key** - Ingresa tu API Key de Google Gemini
2. **Cargar Documentos** - Sube los PDFs del cliente (SCOMP, Certificados, Cartolas)
3. **Analizar** - Gemini Vision extrae automáticamente los datos (OCR incluido)
4. **Generar Informe** - Crea el informe estructurado (Secciones 1-5)
5. **Modificar** - Aplica cambios con instrucciones en lenguaje natural
6. **Exportar** - Descarga el informe o genera el contrato DOCX

## 📋 Tipos de Pensión Soportados

- **Vejez Edad** - Pensión por edad legal de jubilación
- **Invalidez** - Pensión por incapacidad permanente
- **Sobrevivencia** - Pensión por fallecimiento del causante

## 📊 Modalidades de Pensión

- Retiro Programado
- Renta Vitalicia Inmediata Simple
- Renta Vitalicia Inmediata Garantizada (120, 240 meses)
- Renta Vitalicia Aumentada
- Pensión de Referencia Garantizada

## 🛡️ Seguridad

- ✅ La API Key se procesa localmente y no se almacena en el servidor
- ✅ Los documentos se procesan en memoria y no se guardan
- ✅ Conexión segura con Google Gemini API

## 📄 Licencia

MIT License

---

Desarrollado con ❤️ para asesores previsionales de Chile
