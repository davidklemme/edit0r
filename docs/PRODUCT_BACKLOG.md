# edit0r: AI Config Editor - Product Backlog

**Vision**: The browser-native AI config editor that's faster than opening VSCode, more powerful than DevTools console, and 3x cheaper than enterprise alternatives.

**Target Persona**: Browser-native developers editing AI agent configs (OpenAI, Anthropic, etc.) who value speed > features and ephemeral > persistent.

**Market Position**: The missing middle between free formatters and $500+/year enterprise platforms.

---

## Core Principles (Never Compromise)

1. **Speed is the feature** - Load in <1 second, zero ceremony
2. **Ephemeral by default** - Save is opt-in, not required
3. **Browser-native** - Lives in Cmd+T workflow
4. **Multi-provider** - No vendor lock-in
5. **Privacy-first** - No tracking, client-side processing

---

## Assumptions to Challenge

### **Critical Assumptions** (Must validate before building)

| # | Assumption | How to Validate | Risk if Wrong |
|---|------------|-----------------|---------------|
| A1 | Developers will pay $150/year for speed | User interviews, landing page pre-orders | Build features nobody pays for |
| A2 | Multi-provider validation is valuable | Survey: "Do you use >1 LLM provider?" | Over-engineer for single-provider users |
| A3 | Browser-native is better than VSCode extension | Time-on-task study (browser vs IDE) | Wrong distribution channel |
| A4 | Config editing ≠ prompt management (different jobs) | User journey mapping | Competing with wrong category |
| A5 | Compliance features matter for SMBs | Interview 10 companies with 5-50 employees | Enterprise-only feature in wrong tier |
| A6 | URL sharing creates viral growth | Track share→signup conversion | No acquisition channel |
| A7 | Token counting is high-value | Feature usage analytics (if exists in beta) | Build low-impact feature |
| A8 | Users want schema validation, not just formatting | Monitor error rate: how often do schemas fail? | Solving non-problem |

### **Secondary Assumptions** (Monitor post-launch)

| # | Assumption | Metric to Watch |
|---|------------|-----------------|
| A9 | Free tier drives Pro conversions | Conversion rate >2% |
| A10 | Chrome extension increases retention | DAU/MAU ratio for extension users |
| A11 | Version history prevents churn | Churn rate for users who access history |
| A12 | Keyboard shortcuts = power users = paid users | Correlation: shortcut usage vs. conversion |

---

## Product Backlog

### **Epic 1: Foundation - Browser-Native Editor** ⚡ SPEED FOCUS

**Goal**: Match current edit0r speed (<1 sec to ready) while adding AI-specific features.

#### PM-1.1: Performance Budget Definition
- [ ] **Task**: Define performance budgets
  - Initial load: <800ms (faster than current)
  - Time to interactive: <1 second
  - Schema validation: <100ms
  - Format operation: <50ms
- [ ] **Deliverable**: Performance budget doc with monitoring plan
- [ ] **Success metric**: Lighthouse score >95

#### PM-1.2: Competitive Speed Benchmarking
- [ ] **Task**: Time competitor workflows
  - LangSmith: Login → Dashboard → New prompt
  - VSCode: Open → New file → Paste
  - DevTools: Open console → Format JSON
  - JSONLint: Load page → Paste → Format
- [ ] **Deliverable**: Speed comparison matrix
- [ ] **Target**: 3x faster than fastest competitor

#### DEV-1.1: Optimize Current Editor Bundle
- [ ] **Task**: Reduce bundle size
  - Code split Ace Editor modes (load on demand)
  - Tree-shake unused Radix UI components
  - Lazy load stats component
  - Replace PapaParse with lighter CSV parser for basic use
- [ ] **Target**: <150KB initial bundle (currently ~?)
- [ ] **Success metric**: First Contentful Paint <500ms

#### DEV-1.2: Add AI Config Mode Detection
- [ ] **Task**: Auto-detect AI config formats
  - OpenAI function calling schema
  - Anthropic tools format
  - LangChain config
  - Vertex AI function declarations
  - Azure OpenAI format
- [ ] **UX**: Show badge "OpenAI Format Detected" with provider icon
- [ ] **Technical**: Pattern matching on JSON structure

#### DEV-1.3: Implement Provider-Specific Syntax Highlighting
- [ ] **Task**: Custom Ace Editor themes for AI configs
  - Highlight function names, parameters, required fields
  - Dim optional fields (visual hierarchy)
  - Color-code by provider (OpenAI blue, Anthropic orange)
- [ ] **Nice-to-have**: Semantic highlighting (not just syntax)

---

### **Epic 2: Schema Validation Engine** 🔍 CORE VALUE

**Goal**: Catch config errors before deployment (killer feature vs. formatters).

#### PM-2.1: Schema Error Research
- [ ] **Task**: Collect common AI config errors
  - Survey 20 developers: "What breaks your AI agents?"
  - Scrape OpenAI/Anthropic Discord for error patterns
  - Analyze GitHub issues in LangChain, Vercel AI SDK
- [ ] **Deliverable**: Top 20 error patterns with frequency
- [ ] **Use for**: Prioritize validation rules

#### DEV-2.1: JSON Schema Validator (Baseline)
- [ ] **Task**: Integrate JSON Schema validation
  - Library: Ajv (fast, widely used)
  - Validate against official schemas (OpenAI, Anthropic)
  - Show inline errors with line numbers
- [ ] **UX**: Red squiggly underlines (VSCode-like)
- [ ] **Performance**: <100ms for 10KB config

#### DEV-2.2: AI-Specific Validation Rules
- [ ] **Task**: Custom validators beyond JSON Schema
  - **Rule**: Required array must list actual properties
  - **Rule**: Temperature must be 0-2 (or provider-specific range)
  - **Rule**: Max_tokens < model context window
  - **Rule**: Function name must match allowed pattern
  - **Rule**: Enum values must be unique
- [ ] **Research**: Are there OpenAPI specs for AI providers?

#### DEV-2.3: Token Counter with Cost Estimator
- [ ] **Task**: Real-time token counting
  - Library: js-tiktoken (OpenAI) or anthropic-tokenizer
  - Show: "System prompt: 847 tokens | $0.008 per call"
  - Warn: "Approaching context limit (3,500/4,096)"
- [ ] **UX**: Live counter in status bar
- [ ] **Data**: Maintain pricing table (update monthly)

#### DEV-2.4: Smart Warnings (Not Errors)
- [ ] **Task**: Heuristic-based suggestions
  - Warning: "Temperature 0 may produce repetitive outputs"
  - Warning: "No examples provided - consider few-shot prompting"
  - Warning: "System prompt >2000 tokens - consider summarizing"
  - Info: "This function has no description - harder for model to use"
- [ ] **Toggle**: "Show hints" (on by default, can disable)

#### PM-2.2: Validation Rule Documentation
- [ ] **Task**: Create public validation rules reference
  - Why each rule exists (with examples of failures)
  - How to fix common errors
  - Provider-specific quirks
- [ ] **SEO benefit**: "OpenAI function calling validator" → edit0r
- [ ] **Distribution**: Publish on docs site + Dev.to

---

### **Epic 3: Multi-Tab Sessions** 🗂️ WORKFLOW EFFICIENCY

**Goal**: Parallel config editing without file management overhead.

#### PM-3.1: Tab UX Research
- [ ] **Task**: Study tab patterns in speed-focused tools
  - Browser tabs (Chrome, Arc)
  - Figma tabs
  - Linear issue quick-switcher
  - Raycast windows
- [ ] **Question**: Named tabs vs. numbered tabs vs. preview-based?
- [ ] **Hypothesis**: Auto-naming ("OpenAI Config #1") > manual naming

#### DEV-3.1: IndexedDB Tab Storage
- [ ] **Task**: Persist tabs locally
  - Store: content, mode, provider, timestamp
  - Auto-save every 2 seconds (debounced)
  - Max 10 tabs for free tier, unlimited for Pro
- [ ] **Deletion**: Auto-delete after 24 hours (ephemeral default)
- [ ] **Performance**: Lazy load tab content (don't load all tabs on init)

#### DEV-3.2: Tab UI Component
- [ ] **Task**: Build tab bar
  - Show: Provider icon + first line preview ("Get weather function...")
  - Keyboard: Cmd+1-9 to switch, Cmd+T new tab, Cmd+W close
  - Reorder: Drag-and-drop
  - Pin: Option to prevent 24hr deletion
- [ ] **Inspiration**: Arc browser's sidebar

#### DEV-3.3: Tab State Restoration
- [ ] **Task**: Restore session on browser close/reopen
  - Save to localStorage: active tab, scroll position
  - Prompt: "Restore 3 tabs from yesterday?"
  - Privacy: Clear on logout (if auth added)

#### PM-3.2: Tab Naming Strategy A/B Test
- [ ] **Test**: Auto-name vs. manual name vs. no name
  - Variant A: "OpenAI Config (12:34 PM)"
  - Variant B: Prompt for name on save
  - Variant C: "Tab 1", "Tab 2"
- [ ] **Metric**: Which has lowest friction? (time to create new tab)

---

### **Epic 4: Version History & Diffing** 📜 DEBUGGABILITY

**Goal**: "What changed?" clarity for iterative config editing.

#### PM-4.1: Version History User Stories
- [ ] **Task**: Map version history use cases
  - Story 1: "Agent broke, need to see what I changed 2 hours ago"
  - Story 2: "Compare my config to teammate's shared link"
  - Story 3: "Compliance audit: show config on Dec 1st"
  - Story 4: "Rollback to working version"
- [ ] **Prioritize**: Which stories justify $150/year?

#### DEV-4.1: Auto-Versioning on Save
- [ ] **Task**: Create version snapshots
  - Trigger: Every manual save OR every 10 mins if editing
  - Store: Full content + metadata (timestamp, user if logged in)
  - Retention: 7 days free, 90 days Pro
- [ ] **Storage**: IndexedDB (free) → Cloud (Pro)

#### DEV-4.2: Diff Viewer
- [ ] **Task**: Side-by-side diff view
  - Library: Monaco Editor diff viewer (heavier) vs. diff2html (lighter)
  - Show: Added (green), removed (red), modified (yellow)
  - Navigate: Jump to next/prev change
- [ ] **UX**: "Compare with previous version" button
- [ ] **Performance**: Diff calculation <200ms for 10KB configs

#### DEV-4.3: Version Timeline UI
- [ ] **Task**: Visual timeline of changes
  - Show: List of versions with preview of what changed
  - Example: "2 hours ago - Added 'location' parameter"
  - Click: Load that version (with option to restore)
- [ ] **Inspiration**: Google Docs version history (but faster)

#### PM-4.2: Diff Feature Validation
- [ ] **Task**: Prototype testing
  - Give 10 users two configs, ask them to find differences
  - Without tool: Time taken, errors
  - With edit0r diff: Time taken, errors
- [ ] **Success metric**: 5x faster + 90% accuracy

---

### **Epic 5: Multi-Provider Translation** 🔄 VENDOR INDEPENDENCE

**Goal**: Switch providers without rewriting configs (moat vs. LangSmith).

#### PM-5.1: Provider Migration Pain Research
- [ ] **Task**: Quantify migration cost
  - Survey: "How long to migrate from OpenAI → Anthropic?"
  - Collect: GitHub PRs showing migration diffs
  - Calculate: Hours saved if automated
- [ ] **Value prop**: "Save 8 hours per provider switch"

#### DEV-5.1: Config Format Normalizer
- [ ] **Task**: Internal canonical format
  - Define: edit0r's provider-agnostic schema
  - Parse: OpenAI → canonical
  - Serialize: Canonical → Anthropic
- [ ] **Complexity**: High (each provider has quirks)

#### DEV-5.2: OpenAI ↔ Anthropic Converter (MVP)
- [ ] **Task**: Bidirectional translation
  - Map: `functions` → `tools`
  - Map: `function_call` → `tool_choice`
  - Handle: Differences in required/optional fields
  - Warn: "Anthropic doesn't support nested arrays in parameters"
- [ ] **Testing**: Round-trip conversion (OpenAI → Anthropic → OpenAI should match)

#### DEV-5.3: Vertex AI & Azure Support
- [ ] **Task**: Extend to Google, Microsoft formats
  - Research: Vertex AI function declarations spec
  - Research: Azure OpenAI differences from OpenAI
  - Implement: Converters
- [ ] **Priority**: Based on user surveys (which providers do they use?)

#### PM-5.2: Translation Accuracy Validation
- [ ] **Task**: Build test suite
  - Collect: 100 real-world configs from each provider
  - Convert: Using edit0r
  - Test: Does converted config work in target provider?
- [ ] **Success metric**: >95% accuracy (no breaking changes)

---

### **Epic 6: Live API Testing Sandbox** 🧪 FEEDBACK LOOP

**Goal**: Test configs without leaving the editor (vs. copy-paste to Postman).

#### PM-6.1: API Testing Workflow Analysis
- [ ] **Task**: Map current debugging workflow
  - Step 1: Write config in editor
  - Step 2: Copy to where? (Playground, Postman, code)
  - Step 3: Run test
  - Step 4: See error
  - Step 5: Go back to editor
- [ ] **Question**: How many iterations per config? (metric: cycle time)

#### DEV-6.1: API Key Management
- [ ] **Task**: Secure key storage
  - Free tier: Paste API key (ephemeral, not stored)
  - Pro tier: Encrypted storage in browser (IndexedDB + crypto API)
  - Enterprise: Proxy through edit0r backend (never expose keys)
- [ ] **Security**: Never log keys, never send to analytics
- [ ] **UX**: "Your key never leaves your browser" badge

#### DEV-6.2: Test Input Interface
- [ ] **Task**: Quick test UI
  - Input: User message or function call scenario
  - Button: "Test Config"
  - Output: Response + metadata (tokens, cost, latency)
- [ ] **Example presets**: "Test with weather query", "Test with booking request"
- [ ] **Diff**: Show expected vs. actual response

#### DEV-6.3: API Client Implementation
- [ ] **Task**: Call provider APIs from browser
  - OpenAI: Direct API call (CORS-enabled)
  - Anthropic: Direct API call
  - Others: May need CORS proxy
- [ ] **Rate limiting**: Track calls (100/month for Pro)
- [ ] **Error handling**: Show helpful errors ("Invalid API key", "Rate limit hit")

#### DEV-6.4: Response Inspector
- [ ] **Task**: Detailed response analysis
  - Show: Full JSON response (collapsible)
  - Show: Token breakdown (input + output)
  - Show: Cost calculation
  - Show: Latency (time to first token, total time)
- [ ] **UX**: Tabs: "Response" | "Raw JSON" | "Metrics"

#### PM-6.2: Testing Feature Monetization Research
- [ ] **Task**: Determine pricing model for API calls
  - Option A: Include X calls in Pro tier (100? 500?)
  - Option B: Pay-as-you-go ($0.01 per call markup)
  - Option C: Bring your own key (no limits, no revenue)
- [ ] **Question**: Does testing feature drive conversions or is it expected for free?

---

### **Epic 7: URL Sharing & Collaboration** 🔗 VIRAL GROWTH

**Goal**: "Check this config" → share link → viral loop.

#### PM-7.1: Sharing Use Case Mapping
- [ ] **Task**: Identify sharing scenarios
  - Scenario 1: Developer → teammate (async review)
  - Scenario 2: Developer → client (approval)
  - Scenario 3: Developer → forum (help request)
  - Scenario 4: Tutorial → learners (education)
- [ ] **Question**: Which scenario has highest share frequency?

#### DEV-7.1: Client-Side URL Encoding (Security)
- [ ] **Task**: Encode state in URL hash (not server)
  - Format: `edit0r.com/#base64(compressed(config))`
  - Compression: pako (gzip in browser)
  - Max size: 2MB URL limit (handle gracefully)
- [ ] **Privacy**: Content never hits server (client-side only)
- [ ] **SEO**: Hash content not indexed by Google

#### DEV-7.2: Fallback for Large Configs (Cloud Storage)
- [ ] **Task**: Optional server-side storage for >100KB configs
  - Generate: Short link (edit0r.com/abc123)
  - Store: Encrypted in database (S3 + DynamoDB?)
  - Expire: 24 hours (ephemeral)
  - Privacy: No analytics, no logging
- [ ] **Pricing**: Pro feature only (prevent abuse)

#### DEV-7.3: Share UI
- [ ] **Task**: One-click sharing
  - Button: "Share" → Copy link
  - Options: "Expires in: 1 hour | 24 hours | 7 days"
  - Toggle: "Allow editing" vs. "Read-only"
  - Toast: "Link copied! Expires in 24h"
- [ ] **Analytics**: Track shares (not content) for growth metrics

#### DEV-7.4: Shared Link Landing Page
- [ ] **Task**: Optimized viewer for shared links
  - Show: "Shared by [user] via edit0r" header
  - CTA: "Edit a copy" (loads in new tab, not destructive)
  - Badge: "Create your own free account" (conversion)
- [ ] **A/B test**: CTA placement and copy

#### PM-7.2: Viral Coefficient Tracking
- [ ] **Task**: Measure k-factor (viral growth)
  - Metric: Shares per user
  - Metric: Share → signup conversion rate
  - Target: k > 1 (every user brings 1+ new user)
- [ ] **Hypothesis**: Share feature drives 30% of signups

---

### **Epic 8: Chrome Extension** 🧩 BROWSER INTEGRATION

**Goal**: Right-click from anywhere → edit in edit0r (stickiness).

#### PM-8.1: Extension Use Case Research
- [ ] **Task**: Identify high-value injection points
  - DevTools Network tab (API responses)
  - SaaS dashboards (OpenAI Playground, Supabase)
  - GitHub (JSON files in PRs)
  - Notion, Linear (embedded configs)
- [ ] **Survey**: "Where do you copy configs from most often?"

#### DEV-8.1: Context Menu Integration
- [ ] **Task**: Right-click "Edit in edit0r"
  - Detect: Selected text is JSON
  - Action: Open edit0r in new tab with content pre-filled
  - Preserve: Current tab (don't lose context)
- [ ] **UX**: Only show menu item if JSON detected

#### DEV-8.2: DevTools Panel
- [ ] **Task**: edit0r panel in Chrome DevTools
  - Tab: "edit0r" next to Console, Network
  - Action: Click API request → "Edit & Replay"
  - Feature: Modify request body → Re-send
- [ ] **Complexity**: High (DevTools API learning curve)
- [ ] **Alternative**: "Send to edit0r" button (easier)

#### DEV-8.3: Inject Back Feature
- [ ] **Task**: Edit → Replace original text
  - Flow: Select textarea → Edit in edit0r → Save → Inject back
  - Target: Works on common SaaS dashboards
  - Risk: May break with dashboard updates
- [ ] **Testing**: Ensure doesn't break page functionality

#### PM-8.2: Extension vs. Web App Strategy
- [ ] **Task**: Determine feature parity
  - Question: Should extension be standalone or web wrapper?
  - Option A: Extension opens website (simple)
  - Option B: Extension is full editor (complex, more sticky)
- [ ] **Decision**: Based on development cost vs. retention impact

---

### **Epic 9: Keyboard-First UX** ⌨️ POWER USER RETENTION

**Goal**: Never touch mouse = 10x faster (target: power users = paid users).

#### PM-9.1: Keyboard Shortcut Audit
- [ ] **Task**: Map existing shortcuts users expect
  - Survey: "What shortcuts do you use in VSCode/Sublime?"
  - Test: Which shortcuts conflict with browser/OS?
  - Prioritize: Which 10 shortcuts = 80% of actions?

#### DEV-9.1: Command Palette (Cmd+K)
- [ ] **Task**: Fuzzy search for all actions
  - Search: "format" → "Format JSON"
  - Search: "validate" → "Validate OpenAI Schema"
  - Search: "save" → "Save Config"
  - Recent: Show recently used commands first
- [ ] **Library**: cmdk (same as Linear, Vercel)
- [ ] **Performance**: <50ms to open, instant search

#### DEV-9.2: Essential Shortcuts
- [ ] **Task**: Implement core shortcuts
  - `Cmd+S`: Save config
  - `Cmd+Shift+F`: Format
  - `Cmd+Shift+V`: Validate
  - `Cmd+Shift+T`: Test with API
  - `Cmd+Shift+C`: Copy shareable link
  - `Cmd+1-9`: Switch tabs
  - `Cmd+T`: New tab
  - `Cmd+W`: Close tab
  - `Cmd+Z/Y`: Undo/redo
- [ ] **Conflict resolution**: Override browser defaults where safe

#### DEV-9.3: Shortcut Customization
- [ ] **Task**: Let users remap shortcuts
  - UI: Settings panel with key bindings
  - Import: VSCode/Sublime keymaps
  - Export: Share keymap config
- [ ] **Complexity**: Medium (nice-to-have for Pro users)

#### DEV-9.4: Keyboard Navigation Tutorial
- [ ] **Task**: First-time user onboarding
  - Show: "Press Cmd+K to get started" tooltip
  - Interactive: "Try pressing Cmd+Shift+F to format"
  - Dismissible: Don't annoy returning users
- [ ] **Metric**: Do users who complete tutorial have higher retention?

#### PM-9.2: Shortcut Usage Correlation Analysis
- [ ] **Task**: Post-launch analysis
  - Hypothesis: Keyboard users → power users → paid users
  - Metric: Correlation between shortcut usage and conversion
  - Decision: If true, emphasize shortcuts in onboarding

---

### **Epic 10: Compliance & Audit Logging** 📋 ENTERPRISE UNLOCK

**Goal**: Pass audits → unlock Team/Enterprise tiers.

#### PM-10.1: Compliance Requirements Research
- [ ] **Task**: Interview companies about audit needs
  - Target: 10 companies with AI agents in production
  - Questions:
    - "What do auditors ask about your AI systems?"
    - "Do you track prompt changes? How?"
    - "What compliance frameworks apply to you?" (GDPR, SOC2, HIPAA, EU AI Act)
- [ ] **Deliverable**: Compliance checklist by industry

#### DEV-10.1: Change Audit Log
- [ ] **Task**: Immutable change log
  - Record: Who, what, when, why (optional comment)
  - Store: Append-only (can't delete history)
  - Export: CSV, JSON, PDF
- [ ] **UI**: Timeline view of all changes
- [ ] **Retention**: Unlimited for Enterprise, 90 days for Team

#### DEV-10.2: Compliance Scanning
- [ ] **Task**: Auto-detect compliance risks
  - Scan for: Email addresses, phone numbers, API keys in prompts
  - Scan for: Banned phrases ("ignore previous instructions")
  - Scan for: PII handling instructions (GDPR)
  - Warn: "This prompt may expose PII"
- [ ] **Customization**: Let Enterprise define their own rules

#### DEV-10.3: Approval Workflow
- [ ] **Task**: Require approval before deploy
  - Role: Config Author → Reviewer → Approver
  - Status: Draft → Under Review → Approved → Deployed
  - Notifications: Email/Slack when approval needed
- [ ] **Pricing**: Team tier minimum (requires multi-user)

#### DEV-10.4: Audit Report Generation
- [ ] **Task**: One-click compliance reports
  - Template: EU AI Act compliance report
  - Template: SOC2 AI system documentation
  - Include: All config versions, approvers, timestamps
  - Format: PDF with digital signature
- [ ] **Sales enabler**: "Pass audits with one click"

#### PM-10.2: Compliance Feature Validation
- [ ] **Task**: Customer development
  - Find: 3 beta customers willing to test
  - Test: Do compliance features help them pass audits?
  - Pricing: What would they pay for this? ($49/user? $99?)

---

### **Epic 11: Onboarding & Growth** 🚀 USER ACQUISITION

**Goal**: Landing page → activated user in <2 minutes.

#### PM-11.1: Activation Metric Definition
- [ ] **Task**: Define "aha moment"
  - Hypothesis: User pastes config, sees validation error, fixes it = activated
  - Alternative: User shares a link = activated
  - Metric: Time to activation <2 minutes
- [ ] **Research**: Segment "activated users" → retention rate

#### DEV-11.1: Landing Page
- [ ] **Task**: High-converting homepage
  - Hero: "Validate AI configs 10x faster"
  - Demo: Interactive editor (paste sample config, see instant validation)
  - Social proof: "Used by engineers at [logos]"
  - CTA: "Start editing (no signup)" → Immediate value
- [ ] **A/B test**: CTA copy ("Try free" vs. "Start editing")

#### DEV-11.2: Interactive Tutorial
- [ ] **Task**: First-time user flow
  - Step 1: Pre-fill broken OpenAI config
  - Step 2: "Click 'Validate' to see errors"
  - Step 3: "Fix the error (hint: add 'required' array)"
  - Step 4: "Now it works! Save or share your config."
- [ ] **Metric**: Tutorial completion rate >60%

#### DEV-11.3: Email Capture (Optional)
- [ ] **Task**: Non-intrusive email collection
  - Timing: After 3rd save OR after sharing link
  - Value: "Get notified when Pro features launch"
  - Incentive: Early bird discount
- [ ] **Privacy**: Clearly state no spam, unsubscribe anytime

#### PM-11.2: Growth Loop Design
- [ ] **Task**: Map viral loops
  - Loop 1: Share link → Recipient uses → Shares own link
  - Loop 2: Tutorial content → SEO → Organic traffic
  - Loop 3: "Built with edit0r" badge for shared configs
- [ ] **Target**: 30% organic growth month-over-month

#### PM-11.3: Content Marketing Strategy
- [ ] **Task**: SEO & thought leadership
  - Blog: "10 Common OpenAI Function Calling Mistakes"
  - Blog: "How to Migrate from OpenAI to Anthropic in 5 Minutes"
  - Video: "edit0r walkthrough" (YouTube)
  - GitHub: Awesome list of AI config tools (list edit0r)
- [ ] **Target**: 1,000 monthly organic visitors in month 3

---

### **Epic 12: Monetization & Pricing** 💰 BUSINESS MODEL

**Goal**: Convert free users to paid without killing growth.

#### PM-12.1: Pricing Research
- [ ] **Task**: Willingness-to-pay study
  - Survey: "What would you pay for [feature]?"
  - Van Westendorp analysis (too cheap/too expensive)
  - Compare: Competitor pricing
- [ ] **Hypothesis**: $150/year = sweet spot (vs. $468 LangSmith)

#### PM-12.2: Free vs. Pro Feature Split
- [ ] **Task**: Define free tier limits
  - Question: What drives conversions without annoying free users?
  - Option A: Limit tabs (3 free, unlimited Pro)
  - Option B: Limit version history (7 days free, 90 days Pro)
  - Option C: Limit API tests (10/month free, 100/month Pro)
- [ ] **Research**: Which limit causes least churn?

#### DEV-12.1: Payment Integration
- [ ] **Task**: Stripe subscription setup
  - Plans: Pro ($150/year or $15/month)
  - Plans: Team ($49/user/month, min 3 seats)
  - Billing: Auto-renew, cancel anytime
  - Invoicing: For Team/Enterprise
- [ ] **Tax**: Stripe Tax for VAT/GST compliance

#### DEV-12.2: Upgrade Flow
- [ ] **Task**: Frictionless upsell
  - Trigger: Hit free tier limit
  - Modal: "Unlock unlimited tabs with Pro"
  - CTA: "Upgrade now" (one-click, no page reload)
  - Alternative: "Remind me later" (don't block)
- [ ] **A/B test**: Hard paywall vs. soft paywall

#### DEV-12.3: Usage Analytics Dashboard (Pro)
- [ ] **Task**: Show value to paid users
  - Metric: "You've validated 47 configs this month"
  - Metric: "Time saved: 12 hours" (vs. manual validation)
  - Metric: "Errors caught: 23"
- [ ] **Goal**: Justify ongoing subscription

#### PM-12.3: Churn Prevention Strategy
- [ ] **Task**: Retention tactics
  - Email: "You haven't used edit0r in 30 days - here's what's new"
  - In-app: "You've used 8/10 free configs - upgrade to unlimited"
  - Offer: Win-back discount for churned users
- [ ] **Target**: <5% monthly churn for Pro users

---

### **Epic 13: Team Collaboration** 👥 REVENUE EXPANSION

**Goal**: Individual → Team upgrade (higher LTV).

#### PM-13.1: Team Use Case Research
- [ ] **Task**: Understand team workflows
  - Interview: 5 teams using AI agents
  - Questions:
    - "How do you share configs between team members?"
    - "Who reviews configs before deployment?"
    - "What causes miscommunication?"
- [ ] **Deliverable**: Team collaboration user stories

#### DEV-13.1: Shared Workspaces
- [ ] **Task**: Team-level config library
  - Structure: Workspace → Projects → Configs
  - Permissions: Owner, Editor, Viewer roles
  - Discovery: Search across team's configs
- [ ] **Pricing**: Team tier only

#### DEV-13.2: Async Commenting
- [ ] **Task**: Config review workflow
  - Action: Select text → Add comment
  - Thread: Replies to comments
  - Resolve: Mark comment as resolved
  - Notify: Email when comment added
- [ ] **UX**: Similar to Google Docs comments (familiar)

#### DEV-13.3: Activity Feed
- [ ] **Task**: Team activity stream
  - Show: "Alice updated 'Weather Agent Config'"
  - Show: "Bob commented on 'Booking Flow'"
  - Filter: By project, by user, by date
- [ ] **Goal**: Visibility into team's work

#### PM-13.2: Team Tier Validation
- [ ] **Task**: Beta test with 3 teams
  - Offer: Free Team tier for 3 months
  - Question: "Would you pay $49/user/month for this?"
  - Metric: Do they actively use team features?

---

### **Epic 14: Enterprise Features** 🏢 HIGH-VALUE DEALS

**Goal**: Land $50k+ annual contracts.

#### PM-14.1: Enterprise Buyer Research
- [ ] **Task**: Identify enterprise decision-makers
  - Title: VP Engineering, Head of AI, Chief Compliance Officer
  - Pain: "We have 50 engineers building AI agents - no governance"
  - Budget: $50k-$200k/year for tooling
- [ ] **Deliverable**: Ideal customer profile (ICP)

#### DEV-14.1: Self-Hosted Deployment
- [ ] **Task**: Docker-based on-prem option
  - Package: Docker Compose with all services
  - Docs: Installation, backup, upgrade guides
  - Support: Dedicated Slack channel
- [ ] **Pricing**: $50k/year base + $10k/year support

#### DEV-14.2: SSO/SAML Integration
- [ ] **Task**: Enterprise auth
  - Providers: Okta, Azure AD, Google Workspace
  - Library: next-auth or WorkOS
  - Admin: User provisioning/deprovisioning
- [ ] **Requirement**: Team tier minimum

#### DEV-14.3: Advanced Audit Logs
- [ ] **Task**: Enterprise-grade logging
  - Track: Every action (login, view, edit, delete)
  - Export: Continuous export to S3/BigQuery
  - Retention: Unlimited
  - Search: Full-text search across all logs
- [ ] **Compliance**: SOC2, ISO 27001 requirements

#### PM-14.2: Enterprise Sales Process
- [ ] **Task**: Define sales motion
  - Lead gen: Outbound to companies with >10 AI engineers
  - Demo: Custom demo environment with their configs
  - Pilot: 30-day trial with 5-10 users
  - Contract: Annual upfront payment
- [ ] **Goal**: 3 enterprise deals in year 1

---

### **Epic 15: Technical Debt & Scalability** 🏗️ FOUNDATION

**Goal**: Don't let early shortcuts become bottlenecks.

#### DEV-15.1: Monitoring & Observability
- [ ] **Task**: Production monitoring
  - APM: Vercel Analytics or Sentry
  - Metrics: Load time, error rate, API latency
  - Alerts: PagerDuty for critical issues
- [ ] **Dashboard**: Real-time system health

#### DEV-15.2: Error Handling & Resilience
- [ ] **Task**: Graceful degradation
  - Offline mode: Use cached data when API down
  - Retry logic: Exponential backoff for API calls
  - User feedback: Clear error messages
- [ ] **Testing**: Chaos engineering (randomly fail API calls)

#### DEV-15.3: Security Audit
- [ ] **Task**: Third-party security review
  - Pentest: Hire security firm for penetration testing
  - Fix: Address all high/critical vulnerabilities
  - Cert: SOC2 Type II (for Enterprise sales)
- [ ] **Timeline**: Before Enterprise launch

#### DEV-15.4: Performance Optimization
- [ ] **Task**: Continuous improvement
  - Metric: Core Web Vitals (LCP, FID, CLS)
  - Tool: Lighthouse CI in GitHub Actions
  - Goal: Maintain >95 score as features added
- [ ] **Process**: Performance budget in code review

#### DEV-15.5: Database & Infrastructure
- [ ] **Task**: Scalable backend (when needed)
  - Current: Client-side only (no backend)
  - Future: Supabase or Firebase for cloud sync
  - Scale: Plan for 100k users, 1M configs
- [ ] **Cost model**: $5/user/year infrastructure cost

---

## PM Tasks (Cross-Epic)

### **Product Strategy**

#### PM-S1: Competitive Analysis (Monthly)
- [ ] Monitor: LangSmith, Humanloop, PromptLayer feature releases
- [ ] Track: Pricing changes, new entrants
- [ ] Action: Adjust roadmap to maintain differentiation

#### PM-S2: User Feedback Loop
- [ ] Tool: In-app feedback widget (Canny, Beamer)
- [ ] Cadence: Weekly review of top requests
- [ ] Prioritization: Impact vs. effort matrix

#### PM-S3: Analytics & Metrics
- [ ] Setup: PostHog or Mixpanel for product analytics
- [ ] Track: Activation, retention, conversion funnels
- [ ] Review: Weekly metrics review with team

### **Go-to-Market**

#### PM-GTM1: Product Hunt Launch
- [ ] Prep: 3 months of beta feedback
- [ ] Content: Demo video, screenshots, maker story
- [ ] Goal: #1 Product of the Day

#### PM-GTM2: Community Building
- [ ] Platform: Discord or Slack for users
- [ ] Content: Weekly AI config tips
- [ ] Engage: Respond to every question <24hrs

#### PM-GTM3: Partnership Strategy
- [ ] Target: AI frameworks (LangChain, Vercel AI SDK)
- [ ] Offer: "Official validator for [framework]"
- [ ] Distribution: Listed in their docs

---

## Next Steps (For BMad)

### **Immediate Validation (Before Building)**

1. **Landing Page Experiment** (1 week)
   - Create: One-page site with value prop
   - CTA: "Join waitlist"
   - Ads: $500 Google Ads budget
   - Goal: 100 email signups = validated demand

2. **Customer Interviews** (2 weeks)
   - Find: 15 developers editing AI configs
   - Ask: Willingness to pay, feature priorities
   - Goal: Validate $150/year price point

3. **Prototype Core Feature** (1 week)
   - Build: Schema validator (just OpenAI)
   - Test: With 10 beta users
   - Goal: "I'd pay for this" feedback

### **MVP Scope (If Validated)**

**Phase 1 (8 weeks):**
- Epic 1: Foundation
- Epic 2: Schema Validation
- Epic 3: Multi-Tab Sessions
- Epic 11: Landing Page & Onboarding

**Phase 2 (6 weeks):**
- Epic 4: Version History
- Epic 5: Multi-Provider Translation (OpenAI + Anthropic only)
- Epic 9: Keyboard Shortcuts

**Phase 3 (4 weeks):**
- Epic 6: API Testing
- Epic 7: URL Sharing
- Epic 12: Monetization

---

## Success Metrics (6 Months Post-Launch)

| Metric | Target | Stretch |
|--------|--------|---------|
| Active users | 1,000 | 5,000 |
| Paid conversions | 2% | 5% |
| MRR | $2,000 | $5,000 |
| NPS | 40 | 60 |
| Churn (monthly) | <7% | <5% |
| Viral coefficient | 0.3 | 0.8 |

---

*Document Version: 1.0*
*Last Updated: 2025-11-16*
*Owner: BMad + The Master*
