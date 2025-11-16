# edit0r: Technical Implementation Plan

**Architecture Philosophy**: Speed-first, progressive enhancement, client-side by default.

---

## Core Technical Principles

1. **Performance Budget**: Initial load <800ms, TTI <1s
2. **Client-First Architecture**: No backend until absolutely necessary
3. **Progressive Enhancement**: Works offline, sync when online
4. **Privacy by Design**: Data stays in browser unless explicitly synced
5. **Zero-Lock-In**: Export to any format, open data models

---

## Technology Stack

### **Current Stack (Keep)**
- **Framework**: Next.js 14 (App Router)
- **Editor**: Ace Editor (lightweight, proven)
- **UI**: Radix UI + Tailwind CSS
- **Hosting**: Vercel (edge functions for future needs)

### **Additions for AI Features**

| Layer | Technology | Why | Alternatives Considered |
|-------|-----------|-----|------------------------|
| **Schema Validation** | Ajv (Another JSON Schema Validator) | Fastest JSON Schema validator, 100% spec compliant | joi (slower), zod (TypeScript-first, heavier) |
| **Token Counting** | js-tiktoken | Official OpenAI tokenizer in JS | gpt-3-encoder (outdated), tiktoken-node (native deps) |
| **Anthropic Tokens** | @anthropic-ai/tokenizer | Official Anthropic tokenizer | Custom regex (inaccurate) |
| **Diff Viewer** | react-diff-viewer-continued | Lightweight, maintained fork | Monaco Editor (too heavy), diff2html (lower-level) |
| **Command Palette** | cmdk | Used by Linear, Vercel - proven fast | kbar (older), custom (too much work) |
| **Storage** | IndexedDB (via idb-keyval) | Simple KV store, 50MB+ quota | localStorage (5MB limit), Dexie (overkill) |
| **Cloud Sync (Pro)** | Supabase | Auth + DB + Storage, generous free tier | Firebase (pricier), custom (maintenance) |
| **Compression** | pako | gzip in browser for URL encoding | lz-string (less compression), fflate (larger) |
| **Analytics** | PostHog | Privacy-friendly, self-hostable | Mixpanel (expensive), Plausible (limited features) |
| **Payments** | Stripe | Standard, trusted | Paddle (higher fees), LemonSqueeky (newer) |
| **Testing** | Vitest + Playwright | Fast, Vite-native, modern | Jest (slower), Cypress (heavy) |

---

## Architecture Diagrams

### **Phase 1: Client-Only Architecture** (MVP)

```
┌─────────────────────────────────────────────────────┐
│                   Browser (User)                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │         Next.js App (Static Site)         │    │
│  │  - Pages: Landing, Editor, Settings       │    │
│  │  - Components: Editor, Tabs, Validator    │    │
│  │  - State: React Context + localStorage    │    │
│  └───────────────────────────────────────────┘    │
│                       ↓                            │
│  ┌───────────────────────────────────────────┐    │
│  │          Client-Side Services             │    │
│  │  - SchemaValidator (Ajv)                  │    │
│  │  - TokenCounter (tiktoken)                │    │
│  │  - VersionManager (IndexedDB)             │    │
│  │  - FormatConverter (custom)               │    │
│  └───────────────────────────────────────────┘    │
│                       ↓                            │
│  ┌───────────────────────────────────────────┐    │
│  │            Browser Storage                │    │
│  │  - localStorage: Settings, recent tabs    │    │
│  │  - IndexedDB: Configs, versions, history  │    │
│  │  - sessionStorage: Current editor state   │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
                         ↓
                    (Optional)
         ┌───────────────────────────┐
         │   LLM Provider APIs       │
         │   (Direct from browser)   │
         │   - OpenAI API            │
         │   - Anthropic API         │
         │   - User's API key        │
         └───────────────────────────┘
```

**Why Client-Only for MVP?**
- ✅ Fastest to ship (no backend code)
- ✅ Zero infrastructure costs
- ✅ Privacy by default (data never leaves browser)
- ✅ Works offline
- ❌ Can't sync across devices (Pro feature)
- ❌ Can't share large configs (URL limit)

---

### **Phase 2: Hybrid Architecture** (Pro Features)

```
┌─────────────────────────────────────────────────────┐
│                   Browser (User)                    │
│  [Same as Phase 1, plus:]                          │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │        Cloud Sync Service (Pro)           │    │
│  │  - Detect: Changes to configs             │    │
│  │  - Upload: Encrypted diffs to Supabase    │    │
│  │  - Download: On login from other device   │    │
│  └───────────────────────────────────────────┘    │
│                       ↓                            │
└─────────────────────────────────────────────────────┘
                         ↓
         ┌───────────────────────────┐
         │   Supabase (Backend)      │
         │   - Auth: User accounts   │
         │   - DB: Postgres          │
         │   - Storage: S3-compat    │
         │   - Functions: Edge       │
         └───────────────────────────┘
                         ↓
                  (For large shares)
         ┌───────────────────────────┐
         │   Temporary Storage       │
         │   - Short links (24hr)    │
         │   - Encrypted configs     │
         │   - No logs, no analytics │
         └───────────────────────────┘
```

**What Changes in Phase 2?**
- ✅ Optional cloud backup (encrypted)
- ✅ Sync across devices (same account)
- ✅ Share large configs (server stores temporarily)
- ✅ Team workspaces (multi-user access)
- ⚠️ Infrastructure costs (~$5-10/user/year)

---

## Data Models

### **Config Object** (Core entity)

```typescript
interface Config {
  id: string;                    // UUID
  content: string;               // Raw JSON/text
  mode: 'json' | 'text' | 'yaml'; // Format
  provider?: AIProvider;         // Detected or manual
  metadata: {
    created: Date;
    modified: Date;
    title?: string;              // Auto or manual
    tags?: string[];             // Searchable
  };
  validation?: {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
  };
  stats?: {
    tokens: number;
    estimatedCost: number;       // Per call
  };
}

type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'vertex-ai'
  | 'azure-openai'
  | 'generic';

interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fix?: {
    description: string;
    autoFixable: boolean;
    code?: string;               // Replacement text
  };
}
```

### **Version Object** (History tracking)

```typescript
interface Version {
  id: string;
  configId: string;              // Parent config
  content: string;               // Snapshot
  diff?: string;                 // Diff from previous (compressed)
  metadata: {
    timestamp: Date;
    changeType: 'auto' | 'manual'; // Auto-save vs. explicit save
    comment?: string;            // User-provided
    author?: string;             // If multi-user
  };
}
```

### **Tab Session** (Multi-tab state)

```typescript
interface TabSession {
  id: string;
  tabs: Tab[];
  activeTabId: string;
  created: Date;
  expires: Date;                 // 24hr default
}

interface Tab {
  id: string;
  configId?: string;             // If saved
  tempContent?: string;          // If unsaved
  isPinned: boolean;             // Prevent auto-delete
  scrollPosition: number;        // Restore on switch
}
```

### **Share Link** (URL sharing)

```typescript
interface ShareLink {
  id: string;                    // Short code (e.g., "abc123")
  configSnapshot: string;        // Encrypted content
  metadata: {
    created: Date;
    expires: Date;
    viewCount: number;           // For analytics
    allowEdits: boolean;
  };
  // Note: No user tracking, no IP logs
}
```

---

## Performance Architecture

### **Bundle Splitting Strategy**

```
Main Bundle (<150KB gzipped):
  - Next.js runtime
  - React + React DOM
  - Radix UI (core components)
  - Tailwind CSS
  - Basic editor UI

Lazy-Loaded Bundles:
  1. Ace Editor Modes (~30KB each)
     - Load only when mode selected
  2. Validation Engine (~80KB)
     - Ajv + schemas
     - Load on first validate action
  3. Token Counter (~200KB)
     - tiktoken data files
     - Load on first token count
  4. Diff Viewer (~40KB)
     - Load when version history opened
  5. Command Palette (~20KB)
     - Load on Cmd+K first press
```

### **Caching Strategy**

```typescript
// Service Worker for offline + speed
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('edit0r-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/editor',
        '/static/ace-modes/json.js',
        '/static/schemas/openai.json',
        // ... critical assets
      ]);
    })
  );
});

// Stale-while-revalidate for schemas
// (Allow slightly outdated schemas, update in background)
```

### **IndexedDB Schema**

```typescript
// Using idb-keyval for simplicity

// Stores:
'configs'          → Map<configId, Config>
'versions'         → Map<versionId, Version>
'sessions'         → Map<sessionId, TabSession>
'settings'         → Map<key, value>
'cache:schemas'    → Map<provider, JSONSchema>
'cache:pricing'    → Map<provider, PricingData>

// Indexes:
// None (keep simple, search in-memory)
// Total size: ~10MB typical, 50MB max (browser quota)
```

---

## Testing Strategy

### **Test Pyramid with Vitest**

```
         ┌─────────────┐
         │   E2E (5%)  │ ← Playwright: Critical user flows
         └─────────────┘
      ┌──────────────────┐
      │ Integration (15%)│ ← Vitest: Validation, conversion, storage
      └──────────────────┘
   ┌────────────────────────┐
   │    Unit Tests (80%)    │ ← Vitest: Utilities, parsers, formatters
   └────────────────────────┘
```

### **Vitest Configuration**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### **Example Tests**

```typescript
// Unit: Validator (Vitest)
import { describe, it, expect } from 'vitest';
import { validator } from '@/lib/validator';

describe('OpenAI Schema Validator', () => {
  it('detects missing required array', async () => {
    const config = {
      functions: [{
        name: 'get_weather',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string' }
          }
          // Missing: required: ['location']
        }
      }]
    };

    const result = await validator.validate({
      content: JSON.stringify(config),
      provider: 'openai'
    });

    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining('consider marking as required')
      })
    );
  });

  it('validates correct OpenAI function schema', async () => {
    const config = {
      model: 'gpt-4',
      functions: [{
        name: 'get_weather',
        description: 'Get current weather',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string' }
          },
          required: ['location']
        }
      }]
    };

    const result = await validator.validate({
      content: JSON.stringify(config),
      provider: 'openai'
    });

    expect(result.errors).toHaveLength(0);
    expect(result.level2_schema).toBe(true);
  });
});

// Integration: Conversion (Vitest)
import { describe, it, expect } from 'vitest';
import { ConfigConverter } from '@/lib/converter';

describe('Config Converter', () => {
  const converter = new ConfigConverter();

  it('converts OpenAI to Anthropic format', () => {
    const openaiConfig = {
      model: 'gpt-4',
      functions: [{
        name: 'search',
        parameters: { type: 'object' }
      }]
    };

    const anthropicConfig = converter.openaiToAnthropic(openaiConfig);

    expect(anthropicConfig).toEqual({
      model: 'claude-3-opus-20240229',
      tools: [{
        name: 'search',
        input_schema: { type: 'object' }
      }],
      _warnings: expect.any(Array)
    });
  });

  it('warns about unsupported features in conversion', () => {
    const openaiConfig = {
      model: 'gpt-4',
      temperature: 0,
      function_call: { name: 'specific_function' }
    };

    const result = converter.openaiToAnthropic(openaiConfig);

    expect(result._warnings).toContain(
      expect.stringContaining("Anthropic doesn't support function_call")
    );
    expect(result._warnings).toContain(
      expect.stringContaining("minimum temperature is 0.1")
    );
  });
});

// Component: Editor (Vitest + Testing Library)
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SimpleEditor } from '@/components/simple-editor';

describe('SimpleEditor Component', () => {
  it('renders editor with initial content', () => {
    render(<SimpleEditor />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows validation errors on invalid JSON', async () => {
    const { user } = render(<SimpleEditor />);

    const editor = screen.getByRole('textbox');
    await user.type(editor, '{invalid json}');

    const validateBtn = screen.getByTitle('Validate Content');
    await user.click(validateBtn);

    expect(screen.getByText(/syntax error/i)).toBeInTheDocument();
  });

  it('formats JSON correctly', async () => {
    const { user } = render(<SimpleEditor />);

    const editor = screen.getByRole('textbox');
    await user.type(editor, '{"a":1,"b":2}');

    const formatBtn = screen.getByTitle('Format Content');
    await user.click(formatBtn);

    expect(editor).toHaveValue('{\n  "a": 1,\n  "b": 2\n}');
  });
});

// E2E: Critical path (Playwright)
import { test, expect } from '@playwright/test';

test('user can validate and fix config', async ({ page }) => {
  await page.goto('/editor');

  // Paste broken config
  await page.locator('[data-testid="editor"]').fill(`{
    "functions": [{ "name": "test" }]
  }`);

  // Click validate
  await page.click('[data-testid="validate-button"]');

  // See error
  await expect(page.locator('[data-testid="error-message"]'))
    .toContainText('Missing parameters');

  // Fix error
  await page.locator('[data-testid="editor"]').fill(`{
    "functions": [{ "name": "test", "parameters": {} }]
  }`);

  // Validate again
  await page.click('[data-testid="validate-button"]');

  // Success
  await expect(page.locator('[data-testid="success-message"]'))
    .toBeVisible();
});
```

### **Test Utilities**

```typescript
// test/setup.ts
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// test/helpers/mockIndexedDB.ts
import 'fake-indexeddb/auto';

// Mock IndexedDB for testing
export function setupIndexedDB() {
  // Already mocked by fake-indexeddb
}

// test/helpers/mockConfig.ts
import { Config } from '@/types';

export const mockOpenAIConfig: Config = {
  id: 'test-1',
  content: JSON.stringify({
    model: 'gpt-4',
    functions: [{
      name: 'get_weather',
      description: 'Get current weather',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' }
        },
        required: ['location']
      }
    }]
  }),
  mode: 'json',
  provider: 'openai',
  metadata: {
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  }
};
```

---

## Development Workflow

### **Local Setup**

```bash
# Clone repo
git clone https://github.com/edit0r/edit0r.git
cd edit0r

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with API keys (optional for development)

# Run dev server
npm run dev
# → http://localhost:3000

# Run tests
npm run test              # Vitest in watch mode
npm run test:run          # Vitest single run
npm run test:ui           # Vitest UI (interactive)
npm run test:coverage     # Coverage report
npm run test:e2e          # Playwright E2E
npm run test:e2e:ui       # Playwright UI mode

# Build for production
npm run build
npm run start             # Test production build locally
```

### **Package.json Scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "type-check": "tsc --noEmit"
  }
}
```

### **Git Workflow**

```
main
  └─ develop (default branch)
      ├─ feature/schema-validation
      ├─ feature/multi-tab
      └─ feature/api-testing

Release flow:
  develop → staging (auto-deploy to Vercel preview)
  staging → main (manual, triggers production deploy)
```

### **CI/CD Pipeline**

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:run
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/editor
          uploadArtifacts: true
```

---

## Next Steps for Implementation

### **Week 1-2: Foundation + Testing Setup**
1. ✅ Set up Next.js project structure (already done)
2. Configure Vitest + Playwright
3. Implement IndexedDB storage layer (TDD)
4. Add multi-tab UI (basic, no persistence yet)

### **Week 3-4: AI Features**
1. Add provider detection (OpenAI, Anthropic) - TDD
2. Implement schema validation with inline errors
3. Build token counter (OpenAI only for MVP)
4. Create validation UI (error list, jump to error)

### **Week 5-6: UX Polish**
1. Command palette (Cmd+K)
2. Keyboard shortcuts (core 10)
3. Version history (local only)
4. Diff viewer

### **Week 7-8: Sharing & Growth**
1. URL encoding for shares
2. Landing page
3. Analytics setup
4. Beta launch to 50 users

---

## Open Questions & Decisions Needed

### **Technical Decisions**

| Question | Options | Recommendation |
|----------|---------|----------------|
| Editor library? | Ace (current), Monaco, CodeMirror 6 | **Keep Ace** (lightweight, proven) |
| Diff library? | Monaco diff, react-diff-viewer, diff2html | **react-diff-viewer** (lighter than Monaco) |
| Auth provider? | Supabase, Clerk, Auth0 | **Supabase** (all-in-one, cheaper) |
| Analytics? | PostHog, Mixpanel, Amplitude | **PostHog** (privacy-first, open-source) |
| Testing? | Vitest + Playwright, Jest + Playwright | **Vitest + Playwright** ✅ (faster, modern) |

---

*Document Version: 1.1*
*Last Updated: 2025-11-16*
*Owner: BMad + The Master*
