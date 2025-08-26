# Sat-Driven Method (English Version)

## Overview
The **Sat-Driven Method (.sAtd)** is a specification-driven development workflow.  
It is designed to let humans write high-level specifications (`.sAtd` files), while AI and coding environments (Cursor, GitHub, Docker, etc.) interpret and implement them consistently.  
This prevents unnecessary complexity and avoids human errors when bridging natural ideas with executable systems.

---

## Core Principles
1. **One Source of Truth**  
   - `.sAtd` files describe specifications, steps, and context.  
   - AI agents use them to keep knowledge consistent across environments.  

2. **MVP First**  
   - Always start with a **Minimum Viable Product (MVP)**.  
   - Avoid feature creep during early testing.  

3. **Keep it Simple**  
   - Instructions are focused on what humans must do.  
   - AI fills in technical details without overloading the human operator.  

---

## Standard Workflow
1. **Specification (.sAtd)**  
   - Write project specs in `.sAtd` format.  
   - Include features, constraints, and human steps clearly.  

2. **Development (Cursor + AI)**  
   - Cursor reads `.sAtd` as project context.  
   - ChatGPT/Gemini assist coding.  
   - GitHub Copilot provides in-editor completion.  

3. **Version Control (GitHub)**  
   - Push updates to GitHub repository.  
   - `.sAtd` stored alongside source code.  

4. **Deployment (Docker or Local)**  
   - Build containerized environments using Docker.  
   - Sync local and cloud versions.  

5. **Extension (Satellite Apps)**  
   - Satellite services (e.g. Gemini Build apps) can follow the `.sAtd` spec.  
   - They act as external helpers but still speak the same protocol.  

---

## Example: Docker × Cursor × GitHub Integration
- Write `.sAtd` specs for project.  
- Place in GitHub repo.  
- Run Docker environment to simulate and build.  
- Cursor AI reads `.sAtd` and outputs structured code.  
- Both local and GitHub remain in sync for updates.  

---

## Advantages
- Human-friendly, machine-readable.  
- Prevents endless loops of AI overthinking.  
- Portable between environments (ChatGPT, Gemini, Cursor).  
- Simple fallback: If external "satellite apps" fail, the main environment runs a lightweight pipeline.  

---

## Notes
- `.sAtd` files should be **kept minimal but complete**.  
- Avoid overspecification (high-cost parsing, unnecessary detail).  
- Intended for entertainment, creative media, and lightweight deployment — not industrial-grade data mining.  