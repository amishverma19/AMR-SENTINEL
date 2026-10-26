# System Architecture Overview

For the comprehensive technical architecture, full Mermaid data-flow diagrams, and service definitions, see the [Technical Design Document](technical-design-document.md).

For clinical verification rules, penalty formulas, and evidence citations, see the [Five-Tier Verification Pipeline Specification](rules-spec.md).

---

## High-Level Architectural Pattern: "Stochastic Edge, Deterministic Core"

Clinical decision safety **cannot tolerate LLM hallucinations, probabilistic scoring drift, or non-deterministic behavior**. AMR-Guard enforces strict architectural separation:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              STOCHASTIC EDGE                                │
│       (LangGraph • OpenRouter / Gemini 2.5 • LlamaIndex • RapidFuzz)        │
│                                                                             │
│  • Multimodal OCR on doctor prescriptions, handwritten notes, and PDFs     │
│  • Normalization of trade brand names (e.g. Augmentin, Cifran) to INN      │
│  • Extraction of patient demographics, eGFR, pregnancy, and comorbidities   │
│  • Hybrid RAG literature retrieval (Dense pgvector + Sparse BM25 + RRF)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Strictly Validated ContextBundle (Pydantic v2)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DETERMINISTIC CORE                              │
│                      (Pure Python Engine • Zero LLMs)                       │
│                                                                             │
│  • Hard safety gates & absolute contraindications (Tier 1)                 │
│  • Indication legitimacy & CDSCO banned FDC filter (Tier 2)                 │
│  • WHO AWaRe spectrum escalation penalties (Tier 3)                        │
│  • Course duration caps based on ICMR STG (Tier 4)                         │
│  • Local AMR resistance benchmarking via ICMR-AMRSN (Tier 5)                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AUDIT & TRIAGE DECISION                           │
│              (Mathematical Score 0.0 - 100.0 • GREEN / AMBER / RED)         │
│                        + Actionable Remediation Regimens                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architectural Tiers:
1. **Stochastic Edge (LLMs & RAG):**
   - Natural language extraction, normalization, and semantic literature search.
   - Built with **LangGraph**, **OpenRouter**, **Google Gemini**, and **LlamaIndex** with **pgvector**.
2. **Deterministic Core (Clinical Rule Engine):**
   - Mathematical penalty scoring and hard contraindication gates.
   - Pure Python implementation without external AI or network dependencies. Validated at build time via Python AST analysis (`tests/test_architecture.py`).
3. **Monolith Deployment:**
   - Single-server hosting where **FastAPI** serves both `/api/v1/*` endpoints and the static export of the **Next.js 16** frontend.
