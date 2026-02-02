# Static Asset Handling

Vite provides built-in support for importing static assets such as images, fonts, media files, and other file types. These assets are automatically processed and their URLs are resolved at build time.

## Capabilities

### Image Imports

Import image files to get their resolved URL. Supports multiple image formats including modern formats like AVIF, WebP, and JXLL.

```typescript { .api }
// Importing any of these extensions returns the asset URL as a string
import logo from './logo.png';
import banner from './banner.jpg';
import icon from './icon.svg';
import photo from './photo.webp';
import image from './image.avif';

// Type definition for image imports
declare module '*.png' {
  const src: string;
  export default src;
}
```

**Supported Image Formats:**
- PNG: `.png`, `.apng`
- JPEG: `.jpg`, `.jpeg`, `.jfif`, `.pjpeg`, `.pjp`
- GIF: `.gif`
- SVG: `.svg`
- WebP: `.webp`
- AVIF: `.avif`
- BMP: `.bmp`
- ICO: `.ico`, `.cur`
- JXL: `.jxl`

**Usage Example:**

```typescript
import logo from './assets/logo.png';

// Use in HTML
document.getElementById('logo').src = logo;

// Use in framework components
function Logo() {
  return <img src={logo} alt="Logo" />;
}
```

### Media File Imports

Import audio and video files to get their resolved URL. Supports common media formats and subtitle files.

```typescript { .api }
// Importing media files returns the asset URL as a string
import video from './intro.mp4';
import audio from './theme.mp3';
import subtitles from './captions.vtt';

// Type definition for video imports
declare module '*.mp4' {
  const src: string;
  export default src;
}

// Type definition for audio imports
declare module '*.mp3' {
  const src: string;
  export default src;
}
```

**Supported Media Formats:**

Video:
- `.mp4`, `.webm`, `.ogg`, `.mov`

Audio:
- `.mp3`, `.wav`, `.flac`, `.aac`, `.opus`, `.m4a`

Subtitles/Captions:
- `.vtt`

**Usage Example:**

```typescript
import videoSrc from './assets/intro.mp4';
import audioSrc from './assets/background.mp3';

// Use in HTML5 video/audio elements
const video = document.createElement('video');
video.src = videoSrc;

const audio = new Audio(audioSrc);
audio.play();
```

### Font File Imports

Import font files to get their resolved URL. Supports all common web font formats.

```typescript { .api }
// Importing font files returns the asset URL as a string
import customFont from './fonts/CustomFont.woff2';
import iconFont from './fonts/icons.ttf';

// Type definition for font imports
declare module '*.woff2' {
  const src: string;
  export default src;
}

declare module '*.ttf' {
  const src: string;
  export default src;
}
```

**Supported Font Formats:**
- `.woff`, `.woff2`
- `.eot`
- `.ttf`, `.otf`

**Usage Example:**

```typescript
import customFont from './fonts/CustomFont.woff2';

// Use in CSS @font-face
const style = document.createElement('style');
style.textContent = `
  @font-face {
    font-family: 'CustomFont';
    src: url('${customFont}') format('woff2');
  }
`;
document.head.appendChild(style);
```

### Other Static Assets

Import other common static file types like PDFs, text files, and web manifests.

```typescript { .api }
// Importing these file types returns the asset URL as a string
import manifest from './manifest.webmanifest';
import terms from './terms.pdf';
import readme from './README.txt';

// Type definitions
declare module '*.webmanifest' {
  const src: string;
  export default src;
}

declare module '*.pdf' {
  const src: string;
  export default src;
}

declare module '*.txt' {
  const src: string;
  export default src;
}
```

**Supported File Types:**
- `.webmanifest` - Web app manifest files
- `.pdf` - PDF documents
- `.txt` - Text files

**Usage Example:**

```typescript
import manifest from './manifest.webmanifest';
import userGuide from './guide.pdf';

// Link manifest in HTML
const link = document.createElement('link');
link.rel = 'manifest';
link.href = manifest;
document.head.appendChild(link);

// Open PDF in new tab
window.open(userGuide, '_blank');
```

### Asset URL Resolution

In production builds, imported assets get hashed filenames and are copied to the output directory. The import returns the final public URL.

**Development Mode:**
- Assets are served from their original location
- URLs are resolved relative to the project root
- No file copying or hashing occurs

**Production Build:**
- Assets are copied to `dist/assets/` by default
- Filenames include content hash (e.g., `logo.a3b4c5d6.png`)
- Small assets may be inlined as base64 data URLs (configurable via `build.assetsInlineLimit`)
- URLs are resolved relative to `base` configuration option

**Configuration:**

Assets can be configured via `vite.config.ts`:

```typescript
export default {
  build: {
    assetsDir: 'static', // Output directory for assets
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  base: '/my-app/' // Base public path
}
```

### Public Directory Assets

Assets placed in the `public` directory are served and copied as-is without processing.

**Key Differences:**

Static Asset Import (processed):
- Gets content hash in filename
- May be inlined if small enough
- Import required to get URL
- TypeScript types available

Public Directory (raw):
- URL is stable (no hash)
- Never inlined
- Referenced by absolute path
- Always copied as-is

**Usage Example:**

```typescript
// Processed asset import
import logo from './assets/logo.png'; // Returns: /assets/logo.a3b4c5d6.png

// Public directory asset (no import needed)
const favicon = '/favicon.ico'; // File in public/favicon.ico
```

## Types

All asset types return a string containing the resolved URL:

```typescript { .api }
// CSS Modules return an object mapping class names to strings
type CSSModuleClasses = { readonly [key: string]: string };

// All asset imports return the resolved URL as a string
type AssetURL = string;
```
