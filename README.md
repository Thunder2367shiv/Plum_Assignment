# 🩺 Problem Statement 3: AI-Powered Report Simplifier

A production-ready MERN-stack backend designed to translate complex medical lab results into patient-friendly insights. This project utilizes a **Two-Phase AI Chaining Pipeline** to ensure technical precision while delivering empathetic, easy-to-understand explanations.

But it is prefered to test the api locally as tesseract and ocrextraction is a bulky process.
- **Live Demo:** [https://plum-assignment-bay.vercel.app/]

- **GitHub Repository:** [https://github.com/Thunder2367shiv/Plum_Assignment]

---

## 🏗 System Architecture & Data Flow

This project utilizes a **Modular Layered Architecture** combined with a **Sequential AI Chaining Pipeline**. This ensures that the application is scalable, maintainable, and minimizes AI "hallucinations" by separating data extraction from narrative generation.

### 🗺 High-Level Architecture


- **Presentation Layer (Routes):** Entry points for the client requests.
- **Orchestration Layer (Controllers):** Manages the flow between different AI phases.
- **Service Layer (OCR & AI):** Independent modules for Tesseract.js and OpenRouter (GPT-4o-mini).
- **Validation Layer (Guardrails):** Middleware that ensures the input is medical and the output is grounded in facts.

### 🔄 The "Hybrid-Synthesis" Data Flow
1. **Input Handling:** Accepts image uploads or raw text. 
2. **OCR Service:** If an image is provided, `Tesseract.js` extracts raw text. If text is provided directly, this step is bypassed.
3. **Phase 1 (The Fact Extractor):** Uses `gpt-4o-mini` to parse raw text into a structured, technical `fields` object (Values, Units, Status).
4. **Phase 2 (The Narrative Translator):** Uses the JSON from Phase 1 to generate a patient-friendly `summary`.
5. **Synthesis:** The final controller merges the full technical data from Phase 1 with the summary from Phase 2.

---

## 🧪 API Usage & Examples
```Bash
POST /api/simplify
```

Processes medical reports via image upload or raw text.

**Request Type**: multipart/form-data

**Parameters**:
- report: (File) JPG/PNG image of a lab report.
- text: (String) Raw medical text (Alternative to image).

Example cURL Request:
```Bash

curl -X POST [http://localhost:5000/api/simplify]
```

Example Postman Request(POST):
```Bash
https://localhost:5000/api/simplify
```
And Input(text):
```Bash
"CBC: Hemoglobin 10.2 g/dL (Low), WBC 11,200 /uL (High)"
```
Example JSON Response:
```Bash
{
    "tests": [
        {
            "name": "Hemoglobin",
            "fields": {
                "value": 10.2,
                "unit": "g/dL",
                "status": "Low",
                "ref_range": {
                    "low": 12,
                    "high": 16
                }
            }
        },
        {
            "name": "WBC",
            "fields": {
                "value": 11200,
                "unit": "/uL",
                "status": "High",
                "ref_range": {
                    "low": 4000,
                    "high": 10000
                }
            }
        }
    ],
    "summary": "Your test results show that your hemoglobin level is low, and your
     white blood cell count is high. These results can indicate different health 
     conditions which may need further investigation.",
    "status": "ok"
}
```
---
## 📂 Project Structure 

```Bash
Backend/
├── index.js            # Entry point & Vercel serverless export
├── vercel.json         # Vercel deployment & routing config
├── package.json        # Dependencies & scripts
├── .env                 
└── src/
    ├── app.js          # Express app & global middleware
    ├── controllers/    # handleReport: Orchestrates the AI phases
    ├── routes/         # API endpoint definitions
    ├── services/       # aiProvider: LLM logic for Phase 1 & 2
    └── utils/          # ocrService & guardrails (Validation logic)
```
---
## 🛠 Tech Stack

  - AI Model: **gpt-4o-mini** via **OpenRouter** (Optimized for medical parsing speed).
- OCR Engine: **Tesseract.js** (Image-to-text processing).
- Runtime: **Node.js** / **Express.js**.
- File Handling: **Multer** (Configured for /tmp storage for **Vercel** compatibility).
- Deployment: **Vercel** (Serverless Environment).

---

## 🛡 Guardrails & Troubleshooting

- **Medical Scope**: The system uses a guardrail middleware to detect non-medical text. If you send "How to make a cake," the API will return a 422 Unprocessed Entity error.
- **Vercel Timeouts**: OCR is a heavy process. If using the Vercel link, ensure images are clear and under 4MB to avoid the 10-second serverless timeout.
- **Read-Only FS**: Files are handled in the /tmp directory to comply with Vercel's read-only environment.

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
