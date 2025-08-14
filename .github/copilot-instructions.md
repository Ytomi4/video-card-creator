# VideoCardCreator - AI Coding Instructions

## Architecture Overview

This is a **Figma plugin** that creates video composites by layering mask images over background videos. The plugin exports the composite as a recorded WebM video.

**Core Data Flow:**

1. User selects Figma frame → `code.ts` exports as PNG → `ui.html` receives mask image
2. User uploads video file → Canvas composites mask (top layer) + video (bottom layer)
3. User records → MediaRecorder captures canvas stream + video audio → Downloads WebM

## Key Files & Responsibilities

- **`code.ts`**: Figma plugin backend - handles frame selection and PNG export via `node.exportAsync()`
- **`ui.html`**: Complete frontend - UI, canvas rendering, video processing, recording (1000+ lines)
- **`manifest.json`**: Plugin config - name "VideoCardCreator", no network access, dynamic page access

## Development Workflow

**Build & Watch:**

```bash
npm run watch  # Compiles TS to JS automatically
npm run build  # Single compilation
```

**Plugin Testing:** Load in Figma Desktop → Plugins → Development → Load from manifest.json

## Critical Implementation Patterns

### Step-Based UI Flow

The UI enforces sequential workflow using progressive disclosure:

```javascript
// Step 1 must complete before Step 2 activates
function updateStepStatus(stepNumber, completed) {
  if (stepNumber === 1) {
    step2.classList.remove("disabled");
    videoButton.removeAttribute("disabled");
  }
}
```

### Canvas Composite Rendering

Resolution priority: Mask image dimensions > Video dimensions

```javascript
function updateCanvasSize() {
  if (maskImage) {
    canvas.width = maskImage.width;
    canvas.height = maskImage.height;
  } else if (videoElement) {
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
  }
}
```

### Video Recording with Audio

60fps capture with synchronized audio track:

```javascript
const canvasStream = canvas.captureStream(60); // 60fps
const audioTrack = videoElement.captureStream().getAudioTracks()[0];
canvasStream.addTrack(audioTrack);
```

### Figma Communication Pattern

Uses `parent.postMessage` for UI→Plugin and `figma.ui.postMessage` for Plugin→UI:

```javascript
// UI sends request
parent.postMessage({ pluginMessage: { type: "get-mask-image" } }, "*");

// Plugin responds
figma.ui.postMessage({ type: "mask-image", data: bytes });
```

## Design System

Follows Figma's design tokens in CSS custom properties:

- Colors: `--figma-color-bg`, `--figma-color-brand`
- Spacing: `--figma-space-small/med/large`
- Consistent 44px control buttons with 24px SVG icons

## Video Processing Specifics

- **Supported formats**: WebM, MP4 input → WebM output
- **Audio**: Enabled by default (`video.muted = false`)
- **Frame rate**: Fixed 60fps recording
- **Position control**: Drag video on canvas, scale via 0.01-precision slider

## Error Handling Patterns

- Frame selection validation in `code.ts`
- File format validation before video processing
- Graceful MediaRecorder error handling with timeouts

## State Management

- Global variables for `maskImage`, `videoElement`, canvas context
- Step completion tracking with visual feedback (checkmarks)
- Preview section visibility controlled by `.visible` class
