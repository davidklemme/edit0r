# edit0r: Critical Assumptions & Validation Plan

**Purpose**: Document assumptions that could invalidate the business model or product direction. Challenge before building.

---

## How to Use This Document

1. **Red/Yellow/Green Status**:
   - 🔴 **Red**: High-risk assumption, must validate before building
   - 🟡 **Yellow**: Medium-risk, validate during beta
   - 🟢 **Green**: Low-risk, monitor post-launch

2. **Validation Methods**: User interviews, surveys, experiments, data analysis

3. **Decision Criteria**: What evidence = "validated"? What evidence = "pivot"?

---

## Business Model Assumptions

### 🔴 A1: Developers will pay $150/year for speed/convenience

**Assumption**: Browser-native developers value speed enough to pay, even though free alternatives exist.

**Why it matters**: Core monetization hypothesis. If wrong, entire pricing model fails.

**Evidence needed to validate**:
- ✅ 20+ user interviews: "Would you pay $150/year for this?"
- ✅ Landing page waitlist: 100+ signups with clear pricing shown
- ✅ Beta conversion: >2% free → paid in first 60 days

**Evidence that invalidates**:
- ❌ <50 waitlist signups after $1k ad spend
- ❌ User interviews: "I'd use it but never pay"
- ❌ <0.5% conversion in beta

**Validation plan**:
1. Week 1: Create landing page with pricing visible
2. Week 2-3: Run $500 Google Ads targeting "OpenAI function calling"
3. Week 4: Interview 15 signups about willingness to pay
4. Decision: Go/no-go based on signals

**Fallback if invalidated**:
- Option A: Freemium with Team tier focus ($49/user/month, SMBs)
- Option B: Open-source + consulting/support revenue
- Option C: Enterprise-only (self-hosted, $50k/year)

---

### 🟡 A2: Multi-provider support is valuable (vs. OpenAI-only)

**Assumption**: Users work with multiple LLM providers and need cross-provider tools.

**Why it matters**: Determines scope. Multi-provider = 3x complexity. If users only use OpenAI, wasted effort.

**Evidence needed to validate**:
- Survey: "Which LLM providers do you use?" (target: >40% use 2+ providers)
- Analytics: Track provider detection in beta (if <10% non-OpenAI, reconsider)

**Evidence that invalidates**:
- <20% of users use non-OpenAI providers
- Feature usage: Multi-provider conversion rarely used

**Validation plan**:
1. Survey 50 AI developers: "Which providers do you use?"
2. Beta: Build OpenAI-only first, add Anthropic if demand exists
3. Monitor: Requests for other providers in feedback

**Fallback if invalidated**:
- Ship OpenAI-only, focus on depth not breadth
- Add providers as customer requests come in (demand-driven)

---

### 🔴 A3: Browser-native is better than IDE extension

**Assumption**: Users prefer Cmd+T → browser tab over installing VSCode extension.

**Why it matters**: Distribution strategy. If IDE is preferred, we're in wrong channel.

**Evidence needed to validate**:
- Time study: Browser workflow vs. VSCode workflow (target: browser 2x faster)
- User interviews: "Where do you edit configs?" (target: >60% say "browser or mix")

**Evidence that invalidates**:
- >70% of target users say "I'd prefer a VSCode extension"
- Time study shows VSCode is faster (cached file open)

**Validation plan**:
1. Observe 10 developers editing configs (natural environment)
2. Time both workflows: Browser tab load vs. VSCode open file
3. Ask: "If both existed, which would you use more?"

**Fallback if invalidated**:
- Build VSCode extension first (or in parallel)
- Browser version becomes "share preview" tool

---

### 🟡 A4: Config editing ≠ Prompt management (different jobs)

**Assumption**: Editing configs is a distinct job from prompt iteration (LangSmith's domain).

**Why it matters**: Market positioning. If same job, we compete with well-funded LangSmith.

**Evidence needed to validate**:
- User interviews: "What's the difference between editing a config and managing prompts?"
- Jobs-to-be-done analysis: Distinct hiring criteria?

**Evidence that invalidates**:
- Users say "It's the same thing" or "I'd use LangSmith for this"

**Validation plan**:
1. Interview 10 LangSmith users: "What does LangSmith NOT do well?"
2. Identify gaps: Is config validation a gap?

**Fallback if invalidated**:
- Pivot to "LangSmith for individuals" (lightweight, cheaper)
- Focus on speed, not features

---

### 🔴 A5: Free tier drives Pro conversions (freemium works)

**Assumption**: Generous free tier → habit formation → conversion when hitting limits.

**Why it matters**: Growth strategy. If free tier doesn't convert, we're building for freeloaders.

**Evidence needed to validate**:
- Industry benchmarks: Freemium SaaS conversion 2-5%
- Beta: Track free → paid conversion rate (target: >2%)
- Cohort analysis: % of free users who hit limits and upgrade

**Evidence that invalidates**:
- <0.5% conversion after 6 months
- Free users churn before hitting limits
- Power users game the system (multiple accounts)

**Validation plan**:
1. Launch with free tier (3 tabs, 7-day history)
2. Track: How many users hit limits? How many upgrade?
3. Interview churned users: "Why didn't you upgrade?"

**Fallback if invalidated**:
- Tighten free tier (1 tab, 24hr history)
- Remove free tier, offer 14-day trial instead
- Focus on Team tier (B2B sales, not self-serve)

---

## Product Assumptions

### 🔴 A6: Schema validation is high-value (vs. just formatting)

**Assumption**: Developers need validation, not just pretty-printing.

**Why it matters**: Core feature. If users only format JSON, we're JSONLint clone.

**Evidence needed to validate**:
- Survey: "What breaks your AI agents most often?" (target: schema errors in top 3)
- Beta usage: Validation feature used >50% as often as format

**Evidence that invalidates**:
- Users rarely validate, mostly just format
- Feedback: "Validation is too strict/annoying"

**Validation plan**:
1. Scrape Discord/forums: What errors do people report?
2. Beta analytics: Track format vs. validate button clicks
3. A/B test: Auto-validate on paste vs. manual button

**Fallback if invalidated**:
- Shift focus to other features (token counting, API testing)
- Make validation opt-in/dismissible

---

### 🟡 A7: Token counting justifies Pro tier

**Assumption**: Developers care about token counts and will pay to track them.

**Why it matters**: Pro tier feature justification.

**Evidence needed to validate**:
- Survey: "How often do you check token counts?" (target: >50% say "always/often")
- Beta: Track feature usage among paying users

**Evidence that invalidates**:
- <10% of users ever use token counter
- Users say "I don't care about exact counts"

**Validation plan**:
1. Ship token counter in free tier initially
2. Track usage for 30 days
3. Decision: Move to Pro if high usage, keep free if low

**Fallback if invalidated**:
- Keep token counter free (table stakes)
- Focus Pro value on other features (version history, API testing)

---

### 🔴 A8: URL sharing creates viral growth

**Assumption**: Share link → recipient uses edit0r → shares own link (k > 1).

**Why it matters**: Primary acquisition channel assumption.

**Evidence needed to validate**:
- Beta: Track share → signup conversion (target: >10%)
- Viral coefficient: Shares per user (target: >0.5)

**Evidence that invalidates**:
- <2% of share recipients sign up
- K-factor < 0.2 (no viral growth)

**Validation plan**:
1. Beta: Add share tracking (anonymized)
2. Measure: Link creates → Link opens → Signups
3. Interview sharers: "Why did you share this?"

**Fallback if invalidated**:
- Invest in SEO, content marketing instead
- Paid acquisition (Google Ads, Reddit)
- Partnership with AI frameworks (LangChain, Vercel AI)

---

### 🟡 A9: Keyboard shortcuts = power users = paid users

**Assumption**: Users who learn shortcuts are more engaged and likely to convert.

**Why it matters**: Onboarding focus. Should we emphasize shortcuts or hide complexity?

**Evidence needed to validate**:
- Beta analytics: Correlation between shortcut usage and conversion
- Cohort analysis: Shortcut users vs. non-shortcut users retention

**Evidence that invalidates**:
- No correlation between shortcuts and conversion
- Shortcuts confuse new users (negative feedback)

**Validation plan**:
1. Track shortcut usage per user
2. Segment: High-shortcut vs. low-shortcut cohorts
3. Compare: Conversion, retention, NPS

**Fallback if invalidated**:
- De-emphasize shortcuts in onboarding
- Focus on visual UI, mouse-driven workflows

---

### 🟡 A10: Compliance features matter for SMBs (not just Enterprise)

**Assumption**: Companies with 5-50 employees care about GDPR/EU AI Act compliance.

**Why it matters**: Team tier pricing ($49/user/month) depends on compliance value.

**Evidence needed to validate**:
- Interview 10 SMBs: "Do you track AI system changes for compliance?"
- Survey: "Have you been asked for AI audit trails?" (target: >30% yes)

**Evidence that invalidates**:
- SMBs say "We don't care about compliance yet"
- Only enterprises (1000+ employees) care

**Validation plan**:
1. Target: 10 companies with 10-50 employees using AI
2. Ask: Current compliance practices, pain points
3. Pitch: Would audit logging be valuable at $49/user/month?

**Fallback if invalidated**:
- Move compliance to Enterprise tier only
- Team tier focuses on collaboration, not compliance

---

## Technical Assumptions

### 🟢 A11: Client-side processing is fast enough

**Assumption**: Browser can validate 10KB configs in <100ms without backend.

**Why it matters**: Architecture decision. If too slow, need server-side validation.

**Evidence needed to validate**:
- Benchmark: Ajv validation speed on typical configs
- User testing: Perceived latency acceptable?

**Evidence that invalidates**:
- Validation >500ms on average configs
- Users complain about lag

**Validation plan**:
1. Build prototype, benchmark with real configs
2. Test on low-end devices (not just MacBook Pro)

**Fallback if invalidated**:
- Move validation to edge function (Vercel Edge)
- Use Web Workers for off-main-thread processing

---

### 🟢 A12: IndexedDB quota (50MB+) is sufficient

**Assumption**: Browser storage limits won't block users in practice.

**Why it matters**: Client-first architecture viability.

**Evidence needed to validate**:
- Calculate: Typical user stores <100 configs * 10KB = 1MB (well under limit)
- Monitor: Beta users hitting quota errors

**Evidence that invalidates**:
- Users hitting 50MB limit (very unlikely)

**Validation plan**:
- Monitor beta for quota errors
- If >1% hit quota, add cloud sync earlier

**Fallback if invalidated**:
- Auto-delete old versions after 30 days
- Prompt: "Upgrade to Pro for unlimited storage"

---

### 🟡 A13: LLM API schemas are stable (monthly updates OK)

**Assumption**: OpenAI/Anthropic don't change schemas weekly, monthly cache is fine.

**Why it matters**: Maintenance burden. If schemas change daily, can't cache.

**Evidence needed to validate**:
- Historical: Check OpenAI API changelog frequency
- Set alert: Monitor schema changes in beta

**Evidence that invalidates**:
- Schemas change >2x per month
- Breaking changes without warning

**Validation plan**:
1. Monitor OpenAI/Anthropic changelogs for 3 months
2. Set up automated schema diff checks

**Fallback if invalidated**:
- Fetch schemas on every validation (slower but accurate)
- Weekly automated updates instead of monthly

---

## Market Assumptions

### 🔴 A14: AI config editing is growing market (not shrinking)

**Assumption**: More companies deploying AI agents = more config editing = growing TAM.

**Why it matters**: Market timing. If market shrinks (e.g., no-code tools replace configs), we're too late.

**Evidence needed to validate**:
- Google Trends: "OpenAI function calling" growing
- Job postings: "AI engineer" role growth
- GitHub: LangChain, Vercel AI SDK star growth

**Evidence that invalidates**:
- Downward trends in all metrics
- No-code tools (n8n, Make) replace config editing

**Validation plan**:
1. Track metrics quarterly
2. Interview: Are companies hiring more AI engineers or fewer?

**Fallback if invalidated**:
- Pivot to no-code builder integration (plugin for n8n)
- Focus on power users (won't go away)

---

### 🟡 A15: Developers trust browser tools with API keys

**Assumption**: Users will paste API keys into browser for testing feature.

**Why it matters**: API testing feature viability.

**Evidence needed to validate**:
- Survey: "Would you paste your OpenAI key into a browser tool?"
- Security audit: Can we prove keys never leave browser?

**Evidence that invalidates**:
- >50% say "Never" to pasting keys
- Can't guarantee client-side only (CORS issues)

**Validation plan**:
1. Survey 50 developers about trust/security
2. Build prototype, pen-test to verify client-side only
3. Add "Your key never leaves browser" badge

**Fallback if invalidated**:
- Remove API testing feature
- Or: Proxy through edit0r backend (higher trust, higher cost)

---

## Competitive Assumptions

### 🟡 A16: LangSmith won't add "instant config editor" mode

**Assumption**: LangSmith stays focused on tracing/eval, doesn't compete on speed.

**Why it matters**: Competitive moat. If they add fast editor, we lose differentiation.

**Evidence needed to validate**:
- Monitor LangSmith product updates
- Interview LangSmith users: Pain points?

**Evidence that invalidates**:
- LangSmith launches "Quick Edit" feature
- They price competitively (<$200/year)

**Validation plan**:
1. Subscribe to LangSmith, monitor changelog
2. Set Google Alert: "LangSmith new features"

**Fallback if invalidated**:
- Double down on speed (they can't match browser-native)
- Add features they won't (e.g., offline mode)

---

### 🟡 A17: OpenAI won't build this into Playground

**Assumption**: OpenAI Playground stays simple, doesn't add advanced validation.

**Why it matters**: If OpenAI builds it, we lose OpenAI-focused users.

**Evidence needed to validate**:
- Monitor Playground updates
- OpenAI historically slow to improve tools

**Evidence that invalidates**:
- OpenAI adds schema validation to Playground
- They add version history, sharing, etc.

**Validation plan**:
- Check Playground monthly for new features
- Maintain multi-provider moat (they won't)

**Fallback if invalidated**:
- Focus on multi-provider (OpenAI Playground is single-provider)
- Add features OpenAI won't (e.g., Anthropic support)

---

## Validation Timeline

### **Pre-Build (Week 1-4)**
- ✅ User interviews (20 people)
- ✅ Landing page + ads ($500 budget)
- ✅ Competitive analysis (use LangSmith, Humanloop)
- ✅ Workflow time studies (browser vs. IDE)

**Go/No-Go Decision Point**: If <3 critical assumptions validate, pivot or pause.

### **Beta (Month 2-3)**
- Track all metrics (usage, conversion, retention)
- Weekly assumption review: Update red/yellow/green
- User interviews with beta users (feedback loop)

**Checkpoint**: End of Month 3, review all assumptions. Pivot if needed.

### **Post-Launch (Month 4-6)**
- Monitor competitive moves
- Market growth metrics
- Refine pricing based on data

---

## Decision Framework

### **When to Pivot**

Pivot if:
- 3+ critical (🔴) assumptions invalidated
- Market shrinking (A14 fails)
- No monetization path (A1 + A5 fail)

### **When to Persevere**

Keep going if:
- Core value prop validated (A6, A8)
- At least one monetization path works (A1 OR A10)
- Market growing (A14)

### **When to Kill**

Shut down if:
- No willingness to pay after 6 months
- Competitors win on all dimensions
- Market collapses (AI agents replaced by something else)

---

*Document Version: 1.0*
*Last Updated: 2025-11-16*
*Owner: BMad + The Master*
