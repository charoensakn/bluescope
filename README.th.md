# BlueScope

> 🇬🇧 [English](README.md)

ชุดเครื่องมือข่าวกรองโอเพนซอร์สที่เบาและรวดเร็ว สำหรับงานสืบสวนสอบสวน BlueScope แปลงข้อมูลคดีดิบให้กลายเป็นข้อมูลเชิงลึกที่ชัดเจนและเชื่อถือได้ ด้วยพลังของปัญญาประดิษฐ์ เพื่อสนับสนุนการวิเคราะห์คดีและการตัดสินใจที่มีหลักฐานเป็นฐาน

## ภาพรวม

BlueScope คือ **แอปพลิเคชันเดสก์ท็อปแบบ local-first ข้ามแพลตฟอร์ม** ที่สร้างบน Electron ออกแบบมาเพื่อช่วยเจ้าหน้าที่สืบสวนในการประมวลผลเรื่องราวคดีอาญา — โดยเฉพาะอย่างยิ่งสำหรับ **เจ้าหน้าที่ตำรวจไทย** ผู้ใช้ป้อนข้อความคดีดิบ แล้วไปป์ไลน์ของ AI Agent เฉพาะทางจะดำเนินการดังนี้:

1. ปรับปรุงเรื่องราวให้ชัดเจนและกระชับ
2. สกัดข้อมูลเอนทิตีเชิงโครงสร้าง (บุคคล องค์กร สถานที่ ทรัพย์สิน หลักฐาน และเหตุการณ์)
3. อนุมานความสัมพันธ์ระหว่างเอนทิตีและสร้างกราฟเครือข่ายเชิงภาพ
4. จัดหมวดหมู่คดีตามอนุกรมวิธานทักษะกฎหมายอาญาไทย 58 ทักษะ
5. สร้างรายงานคำแนะนำการสืบสวนเฉพาะด้าน

ข้อมูลทั้งหมดจัดเก็บในเครื่องภายใน ไม่มีข้อมูลออกจากเครื่องนอกจากการเรียกใช้ API กับ LLM Provider ที่เลือก

## เทคโนโลยีที่ใช้

| ชั้น | เทคโนโลยี |
|---|---|
| Desktop shell | Electron + Electron Forge |
| Frontend | React 19 + TypeScript + Vite |
| UI components | Material UI v9 |
| Routing | React Router v7 |
| State management | Zustand |
| Database | SQLite (`better-sqlite3`) + Drizzle ORM |
| AI / LLM | Vercel AI SDK |
| Build orchestration | Turborepo |
| Linting / formatting | Biome |
| i18n | Paraglide.js — อังกฤษ & ไทย |
| Schema validation | Zod |

### LLM Provider ที่รองรับ

OpenAI, Anthropic, Google Gemini, Azure OpenAI, Groq, Mistral, Cohere, DeepSeek, Cerebras, xAI (Grok), Perplexity, TogetherAI, Fireworks, DeepInfra และ endpoint ที่เข้ากันได้กับ OpenAI ทุกตัว API key เข้ารหัสไว้ในเครื่องด้วย `safeStorage` ของ Electron

## โครงสร้าง Monorepo

Repository นี้เป็น **Turborepo monorepo** ที่ประกอบด้วย 2 แอปและ 4 แพ็กเกจ:

```
bluescope/
├── apps/
│   ├── main/       — Electron main process (IPC handlers, SQLite, migrations, window management)
│   └── renderer/   — React SPA (UI, routing, AI streaming display)
└── packages/
    ├── agents/     — AI agent classes สร้างบน Vercel AI SDK
    ├── modules/    — Electron IPC bridge modules
    ├── repos/      — Drizzle ORM database repositories
    └── skills/     — อนุกรมวิธานกฎหมายอาญาไทย (ไฟล์ Markdown 58 ทักษะ)
```

### แอปพลิเคชัน (Apps)

**`apps/main`** — Electron main process เริ่มต้นฐานข้อมูล SQLite รัน Drizzle migrations เมื่อเริ่มต้น เปิดเผย IPC module handlers ทั้งหมด จัดการหน้าต่างแบบ borderless พร้อมปุ่มควบคุม titlebar แบบกำหนดเอง และใช้ `safeStorage` สำหรับเข้ารหัส API key

**`apps/renderer`** — React frontend ขับเคลื่อนโดย Vite โหลดภายใน Electron window สื่อสารกับ main process **ผ่าน IPC bridges เท่านั้น** ที่เปิดเผยโดย `preload.ts` ไม่เรียกฐานข้อมูลหรือระบบไฟล์โดยตรง

### แพ็กเกจ (Packages)

#### `@repo/agents` — AI Agent Pipeline

Agent ทั้งหมดขยายจาก abstract class `BaseAgent` ซึ่ง wrap Vercel AI SDK แต่ละ agent กำหนด method `systemPrompt()` และ `userPrompt()` แบบสองภาษา (EN/TH) และกำหนด output schema ด้วย Zod (ถ้าต้องการ) Agent รองรับทั้งแบบ streaming (`runStream`) และแบบ batch (`run`)

| ขั้นตอน | Agent | วัตถุประสงค์ |
|---|---|---|
| 1 | `TitleAgent` | สร้างชื่อคดีที่กระชับ |
| 2 | `SummaryAgent` | สร้างสรุปคดีหนึ่งย่อหน้า |
| 3 | `DescriptionRefinementAgent` | เขียนเรื่องราวคดีใหม่ให้ชัดเจน |
| 4 | `EntityRefinementAgent` | ปรับปรุงรายการเอนทิตีเชิงโครงสร้าง |
| 5 | `StructureExtractionAgent` | สกัดบุคคล องค์กร สถานที่ ทรัพย์สิน ความเสียหาย หลักฐาน และเหตุการณ์เป็น JSON |
| 6 | `LinkAnalysisAgent` | อนุมานความสัมพันธ์ระหว่างเอนทิตีที่สกัดมา |
| 7 | `ClassificationAgent` | จัดหมวดหมู่แบบ multi-label ตามอนุกรมวิธาน 58 ทักษะ |
| 8 | `AdvisoryAgent` | สร้างคำแนะนำการสืบสวนเฉพาะทักษะ |
| 9 | `SynthesisAgent` | รวมผลลัพธ์คำแนะนำหลายรายการเป็นรายงานเดียว |

#### `@repo/modules` — IPC Bridge Modules

Module เหล่านี้ทำหน้าที่เป็นสะพานเชื่อมระหว่าง renderer (UI) และ main process (Electron) แต่ละ module ลงทะเบียน IPC handlers ที่เรียกใช้ database repositories หรือรัน AI agents และ stream ผลลัพธ์กลับมาที่ frontend

Module: `caseModule`, `configModule`, `providerModule`, `llmModule`, `descriptionModule`, `refinementModule`, `structureModule`, `classificationModule`, `advisorModule`, `dashboardModule`, `presetModule`, `searchModule`, `logModule`, `browserModule`, `devModule`

#### `@repo/repos` — Database Repositories

Drizzle ORM repositories สำหรับทุก table ในฐานข้อมูล schema ทั้งหมดกำหนดใน `schema.ts`

| Repository | ตาราง |
|---|---|
| `cases` | ข้อมูลหลักของคดี |
| `case_persons` | เอนทิตีบุคคลที่สกัดมา |
| `case_organizations` | เอนทิตีองค์กรที่สกัดมา |
| `case_locations` | เอนทิตีสถานที่ที่สกัดมา |
| `case_assets` | เอนทิตีทรัพย์สินที่สกัดมา |
| `case_damages` | ข้อมูลความเสียหายที่สกัดมา |
| `case_evidence` | รายการหลักฐานที่สกัดมา |
| `case_events` | ข้อมูลเหตุการณ์ที่สกัดมา |
| `case_links` | ขอบกราฟความสัมพันธ์ระหว่างเอนทิตี |
| `case_types` | ผลการจัดหมวดหมู่ (skill ID ที่ตรงกัน) |
| `case_suggestions` | ผลลัพธ์คำแนะนำรายทักษะ |
| `case_description_logs` | ประวัติการปรับปรุงคำอธิบายคดี |
| `case_entity_logs` | ประวัติการปรับปรุงเอนทิตี |
| `presets` | LLM provider presets ที่บันทึกไว้ |
| `usage_logs` | การติดตามการใช้ token ของ LLM |

#### `@repo/skills` — อนุกรมวิธานกฎหมายอาญาไทย

ไฟล์ Markdown 58 ไฟล์ แต่ละไฟล์ให้ข้อมูล metadata การจัดหมวดหมู่และ system prompt เฉพาะด้านสำหรับ `AdvisoryAgent` ทักษะจัดเป็น 16 หมวด:

| # | หมวด | ทักษะ |
|---|---|---|
| 1 | คดีชีวิต (Homicide & Violent Crimes) | ฆ่าผู้อื่น, ฆ่าโดยไตร่ตรอง, การตายจากชกมวย, วิสามัญฆาตกรรม, ทำให้แท้ง, วิกลจริต |
| 2 | คดีเพลิงไหม้ (Arson) | เพลิงไหม้ (2 รูปแบบ) |
| 3 | คดีเพศ (Sexual Offences) | ข่มขืน (2 รูปแบบ), ล่วงละเมิดทางเพศออนไลน์และค้ามนุษย์ |
| 4 | คดีทรัพย์ (Property Crimes) | กรรโชก, ฉ้อโกง, ยักยอก, ลักทรัพย์ (3 รูปแบบ), ลักพระพุทธรูป, ปล้น, รับของโจร, บุกรุก, หน่วงเหนี่ยว, เอาเด็กเรียกค่าไถ่ |
| 5 | คดีเอกสาร / ปลอมแปลง (Forgery) | ปลอมเงินตรา, ปลอมเอกสารราชการ |
| 6 | คดีอาวุธ (Weapons) | อาวุธปืน (2 รูปแบบ) |
| 7 | คดีคนต่างด้าว / เข้าเมือง (Immigration) | เนรเทศคนต่างด้าว, เข้าเมืองผิดกฎหมาย |
| 8 | สัตว์ป่า / ป่าไม้ / โบราณสถาน | ฆ่าช้างป่า, ครอบครองซากสัตว์ป่า, ล่าสัตว์, ป่าสงวน, โบราณสถาน |
| 9 | คดีเศรษฐกิจ / การเงิน (Economic Crimes) | เช็คเด้ง, บัตรเครดิต (3 รูปแบบ), ศุลกากร, ติดสินบน |
| 10 | วิชาชีพ / สาธารณสุข | ประกอบโรคศิลปะผิดกฎหมาย, แต่งกายเป็นพระ, แต่งเครื่องแบบตำรวจ |
| 11 | การควบคุมการฆ่าสัตว์ | ควบคุมการฆ่าสัตว์ |
| 12 | การพนัน | การพนัน, การพนันออนไลน์ |
| 13 | ยาเสพติด | ยาเสพติด, จำหน่ายยาเสพติด |
| 14 | เรี่ยไรผิดกฎหมาย | เรี่ยไรโดยไม่ได้รับอนุญาต |
| 15 | จราจร | ขับรถประมาท, อุบัติเหตุ |
| 16 | ออนไลน์ (Cybercrime) | ข่าวปลอม / พ.ร.บ.คอมฯ, หลอกขายสินค้าออนไลน์, การพนันออนไลน์, ล่วงละเมิดทางเพศออนไลน์, หลอกลวงการเงินออนไลน์ |

### หน้าของ Renderer

| หน้า | Route | คำอธิบาย |
|---|---|---|
| Dashboard | `/dashboard` | สถิติคดี, กราฟลำดับความสำคัญ, การจัดหมวดหมู่, การใช้ token, คดีล่าสุด |
| รายการคดี | `/cases` | ค้นหา สร้าง และจัดการคดี |
| คำอธิบาย | `/description` | Markdown editor (Tiptap), สร้างชื่อ/สรุปด้วย AI, ข้อมูล metadata |
| ปรับปรุง | `/refine` | AI refinement สองบานหน้าต่าง (คำอธิบายและเอนทิตี) พร้อมประวัติ |
| ความรู้ | `/knowledge` | ตารางเอนทิตีและกราฟเครือข่ายความสัมพันธ์เชิงโต้ตอบ (Neo4j NVL) |
| จัดหมวดหมู่ | `/classification` | จัดหมวดหมู่คดีแบบ multi-label ด้วย AI ตามอนุกรมวิธาน |
| คำแนะนำ | `/suggestion` | สร้างคำแนะนำรายทักษะและรายงานสรุปของ AI |
| การตั้งค่า | `/setting` | ธีม, ภาษา, เปิด/ปิด reasoning, จัดการ LLM provider |

## ขั้นตอนการทำงาน (Data Flow)

ไปป์ไลน์ตั้งแต่ต้นจนจบแสดงให้เห็นว่าเรื่องราวคดีดิบกลายเป็นข่าวกรองเชิงโครงสร้างได้อย่างไร:

```
ผู้ใช้ป้อนข้อความคดีดิบ
        │
        ▼
DescriptionRefinementAgent ──► เรื่องราวที่ปรับปรุงแล้ว
        │
        ▼
EntityRefinementAgent ──► ข้อความเอนทิตีที่ปรับปรุงแล้ว
        │
        ▼
StructureExtractionAgent ──► JSON เชิงโครงสร้าง
        │                     (บุคคล องค์กร สถานที่
        │                      ทรัพย์สิน ความเสียหาย หลักฐาน เหตุการณ์)
        ▼
LinkAnalysisAgent ──► ขอบกราฟความสัมพันธ์
        │
        ▼
ClassificationAgent ──► skill ID ที่ตรงกัน (จากอนุกรมวิธาน 58 ทักษะ)
        │
        ▼
AdvisoryAgent (ต่อทักษะที่ตรงกัน) ──► คำแนะนำการสืบสวน
        │
        ▼
SynthesisAgent ──► รายงานคำแนะนำรวม
        │
        ▼
ผลลัพธ์ทั้งหมดบันทึกลง SQLite ในเครื่อง
```

ในคู่ขนาน `TitleAgent` และ `SummaryAgent` รันในขั้นตอนคำอธิบายเพื่อสร้างชื่อและสรุปคดี

## การออกแบบที่สำคัญ

- **Local-first**: ข้อมูลคดีทั้งหมดจัดเก็บในเครื่องด้วย SQLite ไม่มีการ sync กับ cloud API key เข้ารหัสด้วย `safeStorage` ของ Electron
- **Multi-LLM**: รองรับ provider มากกว่า 15 รายผ่าน Vercel AI SDK abstraction ทำให้สลับโมเดลได้โดยไม่ต้องแก้โค้ด
- **สองภาษา**: Agent ทั้งหมดรองรับ prompt ทั้งภาษาอังกฤษและไทย UI รองรับทั้งสองภาษาผ่าน Paraglide.js
- **Streaming**: ผลลัพธ์ AI stream แบบเรียลไทม์ไปยัง UI ผ่าน Electron IPC โดยใช้ Vercel AI SDK streaming API
- **เฉพาะด้าน**: ทักษะกฎหมายอาญาไทย 58 ทักษะทำให้เครื่องมือนี้เหมาะกับการใช้งานของตำรวจไทย มี prompt การจัดหมวดหมู่และคำแนะนำที่เขียนเฉพาะสำหรับแต่ละประเภทความผิด
- **Modular monorepo**: Turborepo แยก `agents`, `modules`, `repos` และ `skills` เป็นแพ็กเกจที่ build และทดสอบได้อิสระ พร้อมแชร์ types ทั่วทั้ง workspace

## เริ่มต้นใช้งาน

### ข้อกำหนดเบื้องต้น

- Node.js 24+
- npm 11+

### ติดตั้ง dependencies

```sh
npm install
```

### Development

```sh
npm run dev
```

เริ่ม Vite dev server สำหรับ renderer และ Electron main process พร้อมกันผ่าน Turborepo

### Build

```sh
npm run build
```

คอมไพล์แพ็กเกจและแอปทั้งหมด

### Package สำหรับการแจกจ่าย

```sh
npm run dist
npm run package
```

สร้างแอปพลิเคชัน Electron ที่แพ็กเสร็จแล้วใน `release/` ออกมาเป็น ZIP archive สำหรับ Windows, macOS และ Linux

### สร้าง installer

```sh
npm run make
```

รัน `electron-forge make` เพื่อสร้าง installer เฉพาะแพลตฟอร์ม

## อ้างอิง Script

| Script | คำอธิบาย |
|---|---|
| `npm run dev` | เริ่ม development (main + renderer) |
| `npm run build` | Build แพ็กเกจและแอปทั้งหมด |
| `npm run dist` | Build และคัดลอก artifact ทั้งหมดสำหรับการแพ็กเกจ |
| `npm run start` | เริ่มแอป Electron ที่แพ็กแล้ว |
| `npm run make` | สร้าง platform installer ผ่าน Electron Forge |
| `npm run package` | แพ็กเกจแอป Electron |
| `npm run clean` | ลบ build artifact ทั้งหมด |
| `npm run lint` | Biome lint ทั่วทุก workspace |
| `npm run format` | Biome format ทั่วทุก workspace |
| `npm run check` | Biome check ทั่วทุก workspace |
| `npm run rebuild` | Build native module ใหม่ (`better-sqlite3`) สำหรับ Electron |
| `npm run test` | รัน Vitest test suite (`@repo/repos`, `@repo/skills`) |
| `npm run make-version` | สร้าง `version.json` |
