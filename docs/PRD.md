# Product Requirements Document (PRD)
## AMR Sentinel — Hack for Social Cause (Yuva Bharat)

**Initiative**: Hack for Social Cause — Yuva Bharat  
**Track**: Healthcare & Grassroots Social Impact (Viksit Bharat @2047)  
**Target Beneficiaries**: Outpatient Primary Care Clinics, Primary Health Centres (PHCs), Community Health Centres (CHCs), and Licensed Healthcare Practitioners in India.

---

### 1. Executive Vision & Problem Statement

Antimicrobial Resistance (AMR) is a major public health crisis. Outpatient clinical visits account for more than 80% of human antibiotic consumption in India. Up to 50% of these prescriptions violate standard clinical guidelines due to:
* High patient footfalls in OPDs with limited time per consult.
* Empirical over-prescribing of Broad-Spectrum "Watch" and "Reserve" antimicrobials (*Cefixime, Azithromycin, Levofloxacin*).
* Proliferation of irrational fixed-dose combinations (banned by CDSCO).
* Widespread resistance in common community uropathogens (>75% *E. coli* resistance to fluoroquinolones per ICMR surveillance).

**AMR Sentinel** is an AI-augmented, mathematically bounded clinical decision support platform engineered to assist clinicians at the point of care, eliminating contraindications, enforcing ICMR and WHO AWaRe guidelines, and generating immediate, safe de-escalation regimens.

---

### 2. Core Functional Requirements

#### F1: Stochastic Edge (Prescription Intake & Normalization)
* Multi-modal prescription ingestion (OCR text parsing, scanned doctor notes).
* Rapid generic name normalization via RapidFuzz and OKF drug dataset (e.g. *Augmentin* -> *Amoxicillin + Clavulanic Acid*).
* Dynamic extraction of patient age, biological sex, pregnancy status, and clinical symptoms.

#### F2: Deterministic Five-Tier Verification Core
* **Tier 1 (Patient Safety Gates)**: Hard contraindications (Pediatric Fluoroquinolones/Tetracyclines, Pregnancy Category D/X, Geriatric Renal clearance for Nitrofurantoin). Instant `BLOCKED` triage ($Score = 100.0$).
* **Tier 2 (Indication Legitimacy)**: Mandatory filter against antibiotic prescribing for viral self-limiting syndromes (common cold, viral bronchitis, acute watery diarrhea) and CDSCO-banned irrational FDCs.
* **Tier 3 (WHO AWaRe Spectrum Escalation)**: Penances empiric Watch tier usage when Access tier is indicated; blocks Reserve tier without documented culture proof.
* **Tier 4 (Therapeutic Duration Limits)**: Flags courses exceeding ICMR STG limits (e.g., CAP capped at 5 days; Uncomplicated UTI capped at 5 days for Nitrofurantoin or 1 day for Fosfomycin).
* **Tier 5 (Local Epidemiological Resistance)**: Flags empiric fluoroquinolone prescriptions for UTI citing ICMR-AMRSN surveillance data (>75% resistance).

#### F3: Deterministic Scoring & Triage
* Mathematical scoring equation:
  $$AMR\_Risk\_Score = \min\left(100.0, 0.4 \cdot P_{\text{class}} + 0.2 \cdot P_{\text{duration}} + 0.4 \cdot P_{\text{indication}}\right)$$
* Instantaneous risk band assignment:
  * **GREEN** ($0.0 \le Score \le 20.0$): Standard-of-care adherence.
  * **AMBER** ($20.0 < Score < 70.0$): Stewardship escalation warning; de-escalation advised.
  * **RED / BLOCKED** ($Score \ge 70.0$): High-risk regimen or hard contraindication.

#### F4: Actionable Clinical Remediation
* Proposes specific first-line Access-group alternatives, correct dosage, and duration.
* Provides one-click prescription remediation.

#### F5: Offline Resiliency & Public Health Deployment
* Full deterministic rule execution without requiring external LLM API availability.
* Generates downloadable, tamper-evident Clinical Audit PDF Reports for hospital records.

---

### 3. Social Cause & Viksit Bharat @2047 Impact Metrics

1. **Grassroots Applicability**: Can be deployed on standard hospital intranet or low-spec clinic computers with zero per-query API costs.
2. **Preventing Catastrophic Healthcare Costs**: Safeguards lower-income households from paying 5x–10x higher costs for unwarranted Watch/Reserve antibiotics and future multidrug-resistant hospitalizations.
3. **National Surveillance Grounding**: Natively informed by ICMR AMRSN annual data and NARS-Net surveillance benchmarks.
