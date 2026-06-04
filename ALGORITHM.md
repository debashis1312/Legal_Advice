# Algorithm and Pseudocode for Vakil.ai

This document provides the formal algorithm and pseudocode for the Vakil.ai legal document analysis pipeline, as required for research paper documentation.

## 1. System Algorithm: Legal Analysis Pipeline (RAG-based)

The Vakil.ai system utilizes a Retrieval-Augmented Generation (RAG) architecture tailored for Indian legal compliance. The algorithm is divided into two phases: the Knowledge Ingestion Phase and the Document Analysis Phase.

### Phase I: Knowledge Ingestion (Offline)
1. **Load** the legal knowledge base (statutes, Indian Contract Act, etc.).
2. **Chunk** the text using a recursive character splitter with a defined size (1000 characters) and overlap (200 characters) to preserve semantic context.
3. **Embed** each chunk into a high-dimensional vector space using a pre-trained embedding model (e.g., `all-MiniLM-L6-v2`).
4. **Store** these embeddings in a Vector Database (ChromaDB) for efficient similarity searches.

### Phase II: Document Analysis (Online/Runtime)
1. **Receive** a target legal document $D$ in PDF format.
2. **Pre-process** $D$ to extract raw text content $T$.
3. **Query Retrieval:**
   - Extract a representative snippet $S$ from $T$.
   - Generate an embedding for $S$.
   - Search the Vector Database for the top-$k$ most relevant legal contexts $C = \{c_1, c_2, ..., c_k\}$.
4. **Prompt Augmentation:**
   - Construct a prompt $P$ that integrates the retrieved context $C$, the full text $T$, and legal reasoning instructions (e.g., focusing on Section 27 of the Indian Contract Act).
5. **LLM Inference:**
   - Pass prompt $P$ to the Large Language Model (Llama-3.1).
   - Generate a structured analysis $A$ containing identified risks, severity levels, legal reasoning, and a safety score.
6. **Post-process:** Parse and validate the output as structured JSON.
7. **Return** the comprehensive legal risk report to the user.

---

## 2. Pseudocode

```text
ALGORITHM AnalyzeLegalDocument(document_pdf)
    // Step 1: Text Extraction
    document_text ← ExtractTextFromPDF(document_pdf)
    
    // Step 2: Context Retrieval (RAG)
    preview_snippet ← GetFirstNCharacters(document_text, 2000)
    query_vector ← GenerateEmbedding(preview_snippet)
    relevant_laws ← VectorSearch(query_vector, k=3)
    
    // Step 3: Construct Augmented Prompt
    system_instruction ← "You are VakilAI, an expert Indian Legal Advisor."
    context_block ← Combine(relevant_laws)
    
    prompt ← "Context (Indian Laws): " + context_block + 
             "\nDocument Text: " + document_text + 
             "\nTask: Identify risky clauses and violations of Section 27."
    
    // Step 4: LLM Generation
    llm_response ← LLM_Inference(system_instruction, prompt)
    
    // Step 5: JSON Parsing and Validation
    IF ValidJSON(llm_response) THEN
        analysis_report ← ParseJSON(llm_response)
        analysis_report.full_text ← document_text
        RETURN analysis_report
    ELSE
        RETURN Error("Failed to generate structured report")
    END IF
END ALGORITHM
```

---

## 3. Implementation (Coding)

The system is implemented using a modern AI-stack designed for scalability and precision:

- **Framework:** Python-based **FastAPI** for high-performance asynchronous API endpoints.
- **Orchestration:** **LangChain** is used to manage the RAG pipeline, prompt templates, and LLM chains.
- **Embeddings:** **HuggingFace Embeddings** (`all-MiniLM-L6-v2`) for transforming legal text into semantic vectors.
- **Vector Store:** **ChromaDB** serves as the persistent vector database for storing and retrieving Indian Legal statutes.
- **Inference:** **Groq Cloud API** powering the **Llama-3.1-8b-instant** model for ultra-fast, low-latency legal reasoning.
- **Data Handling:** **PyPDFLoader** for robust text extraction from complex legal PDF documents.

---

## 4. Validation and Evaluation Means

To ensure the reliability of the legal analysis, the system employs a multi-stage validation process:

### A. Structural Validation (JSON Verification)
The model is instructed to output results in a strict JSON format. The system performs:
1. **String Sanitization:** Removing markdown artifacts (e.g., ` ```json ` blocks) and whitespace.
2. **Integrity Check:** Using `json.loads()` to verify the structural soundness of the output.
3. **Schema Enforcement:** Ensuring mandatory fields (`summary`, `risks`, `score`) are present before returning data to the frontend.

### B. Scoring Mechanism
The "Safety Score" (0-100) is calculated based on:
- The frequency of high-risk clauses identified.
- Compliance with specific sections like **Section 27 of the Indian Contract Act**.
- The ratio of risky text to safe text within the document.

### C. Error Handling
If validation fails at any stage (PDF parsing, Retrieval, or Inference), the system returns a graceful error response rather than a hallucinated result, maintaining "Legal Guardrails."

---

## 5. Mathematical Representation of Retrieval

Given a query snippet $q$, the retrieval function $R$ searches the vector space $V$ of embedded legal chunks $C$:

$$R(q, V) = \arg\max_{c \in V}^{k} \text{cos\_sim}(E(q), E(c))$$

Where:
- $E$ is the embedding function.
- $\text{cos\_sim}$ is the cosine similarity metric.
- $k$ is the number of relevant documents retrieved.
