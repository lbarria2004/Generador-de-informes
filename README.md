# 🏛️ Asesoría Previsional IA

Sistema inteligente de asesoría previsional para Chile, potenciado por Inteligencia Artificial.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Características

- 📄 **Análisis de Documentos PDF** - Extrae automáticamente datos de SCOMP, Certificados de Saldo, Cartolas
- 🤖 **IA Avanzada** - Utiliza VLM (Vision Language Model) para análisis preciso de documentos
- 📝 **Generación de Informes** - Crea informes de asesoría previsional estructurados (Secciones 1-6)
- ✏️ **Modificación Inteligente** - Modifica informes con instrucciones en lenguaje natural
- 📋 **Contratos DOCX** - Genera contratos profesionales en formato Word
- 🌓 **Dark/Light Mode** - Interfaz moderna con soporte para tema claro/oscuro

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ o Bun
- Cuenta de GitHub (para deploy en Vercel)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/lbarria2004/Generador-de-informes.git
cd Generador-de-informes

# Instalar dependencias
bun install
# o
npm install

# Ejecutar en desarrollo
bun run dev
# o
npm run dev
```

### Deploy en Vercel

1. Conecta tu repositorio en [vercel.com](https://vercel.com)
2. La aplicación se desplegará automáticamente

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx              # Página principal
│   ├── layout.tsx            # Layout con providers
│   ├── globals.css           # Estilos globales
│   └── api/
│       ├── analyze/          # Análisis de PDFs
│       ├── generate-report/  # Generación de informes
│       ├── modify-report/    # Modificación de informes
│       └── generate-contract/# Generación de contratos
├── components/
│   ├── app/                  # Componentes de la aplicación
│   └── ui/                   # Componentes shadcn/ui
├── lib/
│   └── ai-service.ts         # Servicios de IA
├── hooks/
│   └── useAppState.ts        # Estado global
└── types/
    └── index.ts              # Tipos TypeScript
```

## 🔧 Flujo de Trabajo

1. **Cargar Documentos** - Sube los PDFs del cliente (SCOMP, Certificados, Cartolas)
2. **Analizar** - La IA extrae automáticamente los datos
3. **Generar Informe** - Crea el informe estructurado (Secciones 1-5)
4. **Modificar** - Aplica cambios con instrucciones en lenguaje natural
5. **Agregar Recomendación** - Genera la Sección 6 personalizada
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

- ✅ Sin credenciales hardcodeadas
- ✅ Variables de entorno para configuración sensible
- ✅ Autenticación mediante SDK seguro

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

Desarrollado con ❤️ para asesores previsionales de Chile
