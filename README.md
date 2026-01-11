# 🩺 Problem Statement 3: AI-Powered Report Simplifier

A production-ready MERN-stack backend designed to translate complex medical lab results into patient-friendly insights. This project utilizes a **Two-Phase AI Chaining Pipeline** to ensure technical precision while delivering empathetic, easy-to-understand explanations.

**Live Demo:** [View Deployed Project]([https://plum-assignment-orcin.vercel.app/])  
**GitHub Repository:** [View Source Code]([https://github.com/Thunder2367shiv/Plum_Assignment])

---

## 🏗 System Architecture & Data Flow

This project implements a **Sequential AI Chain**. Instead of a single "black box" prompt, the system separates technical extraction from narrative translation to maintain 100% data integrity.



### 🔄 The "Synthesis" Logic
1. **OCR Layer:** `Tesseract.js` extracts raw text from image uploads. Else if user directly give text then we skip this step.
2. **Phase 1 (The Fact Extractor):** - Uses `gpt-4o-mini` to identify tests and create a technical `fields` object.
   - **Result:** Pure data (Values, Units, Status).
3. **Phase 2 (The Narrative Translator):** - Takes the JSON from Phase 1 and generates a human-readable `summary`.
   - **Result:** Context and empathy.
4. **The Merge:** The final controller merges Phase 1's detailed `tests` array with Phase 2's `summary` string to create the final response.

---

## 🧪 API Usage & Example Output

### **POST /api/simplify**
Processes medical reports via image upload or raw text.

**Request Type:** `multipart/form-data`  
**Keys:** `report` (File) or `text` (String)

**Standard JSON Response:**
```json
{
    "tests": [
        {
            "name": "Hemoglobin",
            "fields": {
                "value": 10.2,
                "unit": "g/dL",
                "status": "Low",
                "ref_range": { "low": 13.5, "high": 17.5 }
            }
        },
        {
            "name": "WBC",
            "fields": {
                "value": 11000,
                "unit": "cells/mcL",
                "status": "High",
                "ref_range": { "low": 4500, "high": 11000 }
            }
        }
    ],
    "summary": "Your hemoglobin level is low, which might indicate anemia. Additionally, your white blood cell count is elevated, suggesting a possible response to infection.",
    "status": "ok"
}
```
---
## 📂 Project Structure 

```Bash
Backend/
├── index.js
├── vercel.json
├── package.json
├── .env
└── src/
    ├── app.js
    ├── controllers/
    ├── routes/
    ├── services/
    └── middlewares/
```
---
## 🛠 Tech Stack

  - AI Model: **gpt-4o-mini** via **OpenRouter** (Optimized for medical parsing speed).
- OCR Engine: **Tesseract.js** (Image-to-text processing).
- Runtime: **Node.js** / **Express.js**.
- File Handling: **Multer** (Configured for /tmp storage for **Vercel** compatibility).
- Deployment: **Vercel** (Serverless Environment).

---

## 🛡 Guardrails & Safety

- **Anti-Hallucination**: Phase 2 is strictly limited to explaining data extracted in Phase 1.

- **Scope Verification**: Custom middleware detects if the input is a medical document. Non-medical inputs trigger a 422 error.
- **Vercel Optimized**: Uses the /tmp directory for ephemeral file processing, ensuring compatibility with serverless read-only filesystems.

---

## 🚀 Installation & Local Setup
Clone the repository:

```Bash
git clone [https://github.com/Thunder2367shiv/Plum_Assignment](https://github.com/Thunder2367shiv/Plum_Assignment)
```

Install dependencies:
```Bash
npm install multer cors dotenv @openrouter/sdk express tesseract.js
```
Configure Environment: Create a .env file and add:
Code snippet
```Bash
OPENROUTER_API_KEY=your_key_here
SITE_URL=your_project_url
SITE_NAME=MedicalSimplifier
```
Run the server:
```Bash
node index.js
```