# Astrion EDGE™ Capture Tool

Internal capture management tool built on Shipley methodology 
and the Astrion Business Acquisition Process (BAP).

## Live Tool
[Open Astrion EDGE™](https://gavintaylor3.github.io/capture-dashboard/AstrionCaptureTool_v5_7.html)

## Architecture
- **Frontend:** Single-file HTML (React/Babel, CDN imports, IndexedDB)
- **Backend:** Node.js/Express + sql.js (optional, for team sync)
- **AI:** Claude API via proxy for content generation

## Data Storage
All capture data is stored locally in the user's browser (IndexedDB).
No data is sent to any server in standalone mode.

## Version
v5.7 — Decision Log, Content Generator, Full BAP workflow (Stages 0–5, Gates A–D)
