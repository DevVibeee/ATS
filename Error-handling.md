# AuraATS - Error Handling & Resiliency Strategy

AuraATS is designed with high fault tolerance and multi-tier fallbacks to ensure uninterrupted operation even when third-party AI APIs or database network conditions experience transient outages.

---

## Parser Failure Cascade & Fallback Architecture

When a resume parsing request is initiated, the system executes an automated fallback chain:

```
                  ┌──────────────────────────────┐
                  │ Active Engine Selection      │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Grok AI      │     │  Gemini Flash   │     │ Hybrid Consensus│
│ (grok-2-latest) │     │ (2.5 Flash)     │     │ Engine          │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │ Error/Timeout         │ Error/Timeout         │ Error/Timeout
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  In-House Native Engine │
                    │  (Zero External Dep)    │
                    └─────────────────────────┘
```

---

## Resiliency Patterns

### 1. Grok AI API Fallback
- If `GROK_API_KEY` is not present in `.env` or if the xAI endpoint times out / returns a 5xx HTTP response, `parseGrokEngine` automatically catches the exception, logs a warning, and executes the zero-latency **In-House Native Taxonomy Engine**.

### 2. Gemini API Fallback
- If `GEMINI_API_KEY` is missing or rate-limited (HTTP 429), `parseGeminiEngine` seamlessly falls back to the native parser with mock vector augmentation so the candidate UI never crashes or halts.

### 3. Database Persistence Fallback
- If MongoDB Atlas is temporarily unreachable, server endpoints and client controllers fall back to local cached memory storage (`localStorage` + in-memory express state), ensuring job applications and resume parsing remain operational.

### 4. Client Notification & User Toast Feedback
- Network errors or payload validation failures display user-friendly Toast notifications rather than generic unhandled error dialogs.

### 5. Structured Error Logging
- All critical backend exceptions are logged with timestamps and categorized into administrative audit logs for quick triage.
