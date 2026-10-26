# Clinical Sample Data & Test Cases
## AMR-Guard / AMR Sentinel Clinical Benchmark

This document provides sample patient prescription datasets, clinical benchmark test cases, expected audit triage outcomes, and copy-pasteable execution commands to verify the **Five-Tier Clinical Verification Engine**.

---

## 1. Automated Benchmark Evaluation (12 Real-World Cases)

AMR-Guard includes an automated gold-standard clinical evaluation suite derived from **ICMR Standard Treatment Guidelines (STG)** and the **WHO AWaRe Framework (2023)**.

### Run Benchmark Suite:
```powershell
# From the repository root:
$env:PYTHONPATH="amr-guard"; .\amr-guard\.venv\Scripts\python.exe amr-guard/scripts/eval_benchmark.py
```

### Benchmark Cases Summary Table:

| Case ID | Clinical Scenario | Patient Profile | Prescribed Regimen | Expected Status | Triage Band | Expected Score | Primary Flag / Rule Triggered |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **CASE-EVAL-001** | Compliant Outpatient Cystitis | 28y, Female, eGFR 95 | Nitrofurantoin 100mg PO BD x 5d | **APPROVED** | `GREEN` | `0.0` | First-line Access compliance |
| **CASE-EVAL-002** | Pediatric Fluoroquinolone Ban | 12y, Male | Ciprofloxacin 500mg PO BD x 5d | **BLOCKED** | `RED` | `100.0` | `TIER1_PEDIATRIC_CONTRAINDICATION` |
| **CASE-EVAL-003** | Pregnancy Tetracycline Gate | 26y, Female (Pregnant) | Doxycycline 100mg PO BD x 7d | **BLOCKED** | `RED` | `100.0` | `TIER1_PREGNANCY_GATE` |
| **CASE-EVAL-004** | Geriatric Renal Nitrofurantoin Gate | 74y, Male, eGFR 22 | Nitrofurantoin 100mg PO BD x 5d | **BLOCKED** | `RED` | `100.0` | `TIER1_RENAL_AGE_GATE` |
| **CASE-EVAL-005** | Viral Acute Bronchitis Overprescription | 35y, Male | Azithromycin 500mg PO OD x 5d | **FLAGGED** | `AMBER` | `40.0` | `TIER2_VIRAL_INDICATION_PENALTY` |
| **CASE-EVAL-006** | Banned Irrational Dual-FDC | 42y, Female | Ofloxacin + Ornidazole Tab x 5d | **FLAGGED** | `AMBER` | `40.0` | `TIER2_BANNED_FDC_PENALTY` |
| **CASE-EVAL-007** | Empirical Watch Over-Escalation | 29y, Male (Mild CAP) | Cefixime 200mg PO BD x 5d | **FLAGGED** | `GREEN` | `18.0` | `TIER3_WATCH_GROUP_PENALTY` |
| **CASE-EVAL-008** | Outpatient Reserve Group Air-Gap | 50y, Male (Outpatient) | Linezolid 600mg PO BD x 7d | **FLAGGED** | `GREEN` | `34.0` | `TIER3_RESERVE_GROUP_PENALTY` |
| **CASE-EVAL-009** | Excessive Duration in CAP | 40y, Male (Mild CAP) | Amoxicillin 500mg PO TDS x 10d | **FLAGGED** | `GREEN` | `15.0` | `TIER4_EXCESSIVE_DURATION_CAP` |
| **CASE-EVAL-010** | Fluoroquinolone UTI Resistance | 31y, Female (UTI) | Ciprofloxacin 500mg PO BD x 5d | **FLAGGED** | `GREEN` | `18.0` | `TIER5_LOCAL_RESISTANCE_TRAP` |
| **CASE-EVAL-011** | Supportive Symptomatic Therapy (Viral) | 22y, Female (Viral URTI) | Paracetamol 650mg SOS x 3d | **APPROVED** | `GREEN` | `0.0` | Non-antibiotic symptomatic therapy |
| **CASE-EVAL-012** | Multi-Drug Inpatient Sepsis | 62y, Male (Inpatient Ward) | Piperacillin-Tazobactam IV | **APPROVED** | `GREEN` | `0.0` | Inpatient severity authorized |

---

## 2. Interactive cURL Verification Examples

Once the backend is started (`uvicorn app.main:app --reload --port 8000` from `amr-guard`), execute the following requests to verify audit outcomes:

### Example A: Compliant Outpatient Regimen (`APPROVED`)
```bash
curl -X POST http://127.0.0.1:8000/api/v1/audit/ \
  -H "Content-Type: application/json" \
  -d '{
    "patient": {
      "age_years": 28,
      "sex": "F",
      "is_pregnant": false,
      "egfr": 95.0
    },
    "prescription_lines": [
      { "drug_name": "Nitrofurantoin", "duration_days": 5 }
    ],
    "canonical_syndrome": "SYN_UNCOMPLICATED_UTI",
    "is_outpatient": true
  }'
```
**Expected Output:**
```json
{
  "status": "APPROVED",
  "score": 0.0,
  "band": "GREEN",
  "penalties": { "p_class": 0.0, "p_duration": 0.0, "p_indication": 0.0 },
  "flags": [],
  "remediation_options": []
}
```

---

### Example B: Pediatric Fluoroquinolone Contraindication (`BLOCKED`)
```bash
curl -X POST http://127.0.0.1:8000/api/v1/audit/ \
  -H "Content-Type: application/json" \
  -d '{
    "patient": {
      "age_years": 12,
      "sex": "M",
      "is_pregnant": false
    },
    "prescription_lines": [
      { "drug_name": "Ciprofloxacin", "duration_days": 5 }
    ],
    "canonical_syndrome": "SYN_CAP_MILD",
    "is_outpatient": true
  }'
```
**Expected Output:**
```json
{
  "status": "BLOCKED",
  "score": 100.0,
  "band": "RED",
  "flags": [
    {
      "tier": 1,
      "rule_id": "TIER1_PEDIATRIC_CONTRAINDICATION",
      "severity": "CRITICAL",
      "message": "Fluoroquinolones (Ciprofloxacin) contraindicated in pediatric patients under 18 years due to musculoskeletal toxicity."
    }
  ]
}
```

---

### Example C: Viral Infection Inappropriate Prescribing (`FLAGGED`)
```bash
curl -X POST http://127.0.0.1:8000/api/v1/audit/ \
  -H "Content-Type: application/json" \
  -d '{
    "patient": {
      "age_years": 35,
      "sex": "M",
      "is_pregnant": false
    },
    "prescription_lines": [
      { "drug_name": "Azithromycin", "duration_days": 5 }
    ],
    "canonical_syndrome": "SYN_ACUTE_BRONCHITIS",
    "is_outpatient": true
  }'
```
**Expected Output:**
```json
{
  "status": "FLAGGED",
  "score": 40.0,
  "band": "AMBER",
  "flags": [
    {
      "tier": 2,
      "rule_id": "TIER2_VIRAL_INDICATION_PENALTY",
      "severity": "HIGH",
      "message": "Antibacterial therapy is not indicated for uncomplicated viral bronchitis per ICMR guidelines."
    }
  ]
}
```

---

## 3. Automated Unit & Architectural Test Execution

Verify the full Python test suite, including deterministic AST boundary isolation:
```powershell
# From repository root:
$env:PYTHONPATH="amr-guard"
.\amr-guard\.venv\Scripts\pytest.exe amr-guard/tests/test_architecture.py amr-guard/tests/test_rules.py
```
*Expected: 27 passing tests (0 failures).*
