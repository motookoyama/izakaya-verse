# MetaCapture Gemini Satellite Application (.sAtd Spec)

## Concept
- **Goal:** Build MetaCapture as a satellite app in Google Gemini Build,  
  with API bridge communication to the main system (IZAKAYA verse Phase-1).  
- **Principle:**  
  - Independent operation (satellite can work standalone)  
  - API bridge with the mothership (lightweight protocol, like Bluetooth)  
  - Cost-optimized design (broad scraping → selective filtering → generation)

---

## Input
- User specifies **URL / text / image resources**  
- Satellite app performs **broad/rough scraping**  
- Only essential resources are filtered out for further use  

---

## Processing
1. **Light Scraping**  
   - Collect DOM/meta info first (low cost priority)  
   - High-resolution OCR/analysis only if explicitly required  
2. **Resource Filtering**  
   - Extract character DNA / world-building elements / key terms  
3. **Generation**  
   - Create V2 Card (PNG with embedded JSON metadata)  
   - Generate QR code for LLM transfer  
   - Send data to Converter Hub (optional)

---

## Output
- **V2 Card** (PNG + JSON metadata)  
- **QR Code** (Prompt transfer for LLM services)  
- **API Payload** (to mothership or external hub)

---

## Mothership Integration
- **Protocol:**  
  - REST API or Webhook for card/QR data transfer  
  - Mothership archives card and assigns point values  
- **Fail-safe:**  
  - If satellite fails, mothership keeps a lightweight MetaCapture pipeline  
  - User can still generate QR and basic card on mothership  

---

## Cost Optimization
- **Default:** light scraping + low-cost generation  
- **High-Cost:** advanced parsing, OCR, image analysis (opt-in only)  
- **Directive:**  
  - Always prioritize *broad first → selective filtering*  
  - Avoid overspec parsing unless explicitly requested  

---

## Admin Mode
- Bias adjustment (Event AI Agent / Seasonal Agent, optional)  
- Library monitoring (capture history, archive management)  
- Control: ON/OFF toggle for satellite → mothership sync  

---

## Use Cases
1. **Tourism site → Guide character card**  
2. **Corporate site → Receptionist bot card**  
3. **Entertainment site → AI character DNA extraction**

---

## Advantages
- Reduces mothership workload (satellite does heavy lifting)  
- Works autonomously (Gemini backend)  
- Fail-safe: fallback mini MetaCapture pipeline in mothership  
