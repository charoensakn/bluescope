import { Output } from 'ai';
import { z } from 'zod';
import { BaseAgent, type RunArgs } from './base';

export class StructureExtractionAgent extends BaseAgent {
  private _schema: z.ZodType | null = null;

  name() {
    return 'structure-extraction-v1';
  }

  output(input: RunArgs): Output.Output {
    switch (input.extract) {
      case 'person':
        this._schema = z.object({
          results: z.array(
            z.object({
              id: z.string(),
              types: z.array(z.string()),
              name: z.string(),
              person_details: z.string(),
              condition: z.string(),
              confidence: z.number(),
            }),
          ),
        });
        break;
      case 'organization':
        this._schema = z.object({
          results: z.array(
            z.object({
              id: z.string(),
              types: z.array(z.string()),
              name: z.string(),
              organization_details: z.string(),
              confidence: z.number(),
            }),
          ),
        });
        break;
      case 'location':
        this._schema = z.object({
          results: z.array(
            z.object({
              id: z.string(),
              types: z.array(z.string()),
              name: z.string(),
              location_details: z.string(),
              confidence: z.number(),
            }),
          ),
        });
        break;
      case 'asset':
        this._schema = z.object({
          results: z.array(
            z.object({
              id: z.string(),
              types: z.array(z.string()),
              name: z.string(),
              asset_details: z.string(),
              confidence: z.number(),
            }),
          ),
        });
        break;
      case 'damage':
        this._schema = z.object({
          results: z.array(
            z.object({
              id: z.string(),
              types: z.array(z.string()),
              name: z.string(),
              damage_details: z.string(),
              value: z.string(),
              confidence: z.number(),
            }),
          ),
        });
        break;
      case 'evidence':
        this._schema = z.object({
          results: z.array(
            z.object({
              id: z.string(),
              types: z.array(z.string()),
              name: z.string(),
              evidence_details: z.string(),
              confidence: z.number(),
            }),
          ),
        });
        break;
      case 'event':
        this._schema = z.object({
          results: z.array(
            z.object({
              id: z.string(),
              types: z.array(z.string()),
              name: z.string(),
              occurrence_time: z.string(),
              event_details: z.string(),
              confidence: z.number(),
            }),
          ),
        });
        break;
      default:
        throw new Error(`Unsupported extract type: ${input.extract}`);
    }
    return Output.json();
  }

  systemPrompt(_input: RunArgs): string {
    return systemPrompt;
  }

  userPrompt(input: RunArgs): string {
    const ret: string[] = [];
    if (input.thai) {
      switch (input.extract) {
        case 'person':
          ret.push(userPromptPersonTh);
          break;
        case 'organization':
          ret.push(userPromptOrganizationTh);
          break;
        case 'location':
          ret.push(userPromptLocationTh);
          break;
        case 'asset':
          ret.push(userPromptAssetTh);
          break;
        case 'damage':
          ret.push(userPromptDamageTh);
          break;
        case 'evidence':
          ret.push(userPromptEvidenceTh);
          break;
        case 'event':
          ret.push(userPromptEventTh);
          break;
        default:
          throw new Error(`Unsupported extract type: ${input.extract}`);
      }
    } else {
      switch (input.extract) {
        case 'person':
          ret.push(userPromptPersonEn);
          break;
        case 'organization':
          ret.push(userPromptOrganizationEn);
          break;
        case 'location':
          ret.push(userPromptLocationEn);
          break;
        case 'asset':
          ret.push(userPromptAssetEn);
          break;
        case 'damage':
          ret.push(userPromptDamageEn);
          break;
        case 'evidence':
          ret.push(userPromptEvidenceEn);
          break;
        case 'event':
          ret.push(userPromptEventEn);
          break;
        default:
          throw new Error(`Unsupported extract type: ${input.extract}`);
      }
    }
    ret.push(this.inputBothStoryAndEntities(input));
    return ret.join('\n');
  }

  async getOutput(): Promise<unknown> {
    const json = await super.getOutput();
    const results = await this.getJsonRepair().parseJson(json, this._schema);
    if (typeof results === 'object' && 'results' in results && Array.isArray(results.results)) {
      return results.results;
    }
    return [];
  }
}

const systemPrompt = `You are a case knowledge graph extractor. Analyze the case story and entities, then output structured data as valid JSON array.

## General rules
- Follow the user prompt schema exactly.
- Extract information stated in the input.
- Use an empty string ("") for string fields that are unclear or missing.
- Use [] only for array fields when no valid value can be assigned.
- Do not add explanations outside the JSON.
- Keep values concise and factual.
- Deduplicate entities when they clearly refer to the same thing.
- IDs must be unique within the returned array and follow the schema prefix.
- Keep enum/type values in English.
- Free-text fields may be in Thai or English depending on the source story.

## Classification guidance
- Assets are items that are owned, lost, stolen, or damaged.
- Evidence is material that is collected, recorded, seized, or used to support facts.
- If an item clearly fits both roles, it may appear in both categories.

## Confidence rules
- Each entity must include a **confidence** score.
- confidence is a number between 0 and 1.
- Use higher values when the information is explicit and clear.
- Use lower values when the information is weakly stated or ambiguous.

## Type rules:
- Use possible types whenever they reasonably fit.
- You may create a new type only if none of the possible types fit the entity.
- Any new type must be concise, meaningful, and grounded in the story.
`;

const userPromptPersonEn = `Extract all **persons** from the input below.

Your output must be **only** a single JSON object with the following structure:

{
  "results": [
    {
      "id": "PER_xxx",
      "types": string[],
      "name": string,
      "person_details": string,
      "condition": string,
      "confidence": number
    }
  ]
}

Possible types: suspect, victim, witness, officer, complainant, owner, driver, named individual, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed individuals if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not infer information not present in the input.
- If no persons are found, return an empty JSON.
`;

const userPromptPersonTh = `สกัดข้อมูล **บุคคล** ทั้งหมดจากอินพุตด้านล่าง

ผลลัพธ์ของคุณ **ต้องเป็น** ออบเจ็กต์ JSON เดียวที่มีโครงสร้างดังนี้:

{
  "results": [
    {
      "id": "PER_xxx",
      "types": string[],
      "name": string,
      "person_details": string,
      "condition": string,
      "confidence": number
    }
  ]
}

ประเภทที่เป็นไปได้ (ใช้ภาษาอังกฤษ): suspect, victim, witness, officer, complainant, owner, driver, named individual, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมบุคคลที่ไม่มีชื่อ หากมีการกล่าวถึงอย่างชัดเจน
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามอนุมานข้อมูลที่ไม่มีในอินพุต
- หากไม่พบบุคคล ให้ส่งกลับเป็น JSON ว่าง
`;

const userPromptOrganizationEn = `Extract all **organizations** from the input below.

Your output must be **only** a single JSON object with the following structure:

{
  "results": [
    {
      "id": "ORG_xxx",
      "types": string[],
      "name": string,
      "organization_details": string,
      "confidence": number
    }
  ]
}

Possible types: department, company, agency, institution, group, bank, school, hospital, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed organizations if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not infer information not present in the input.
- If no organizations are found, return an empty JSON.
`;

const userPromptOrganizationTh = `สกัดข้อมูล **องค์กร** ทั้งหมดจากอินพุตด้านล่าง

ผลลัพธ์ของคุณ **ต้องเป็น** ออบเจ็กต์ JSON เดียวที่มีโครงสร้างดังนี้:

{
  "results": [
    {
      "id": "ORG_xxx",
      "types": string[],
      "name": string,
      "organization_details": string,
      "confidence": number
    }
  ]
}

ประเภทที่เป็นไปได้ (ใช้ภาษาอังกฤษ): department, company, agency, institution, group, bank, school, hospital, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมองค์กรที่ไม่มีชื่อ หากมีการกล่าวถึงอย่างชัดเจน
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามอนุมานข้อมูลที่ไม่มีในอินพุต
- หากไม่พบองค์กร ให้ส่งกลับเป็น JSON ว่าง
`;

const userPromptLocationEn = `Extract all **locations** from the input below.

Your output must be **only** a single JSON object with the following structure:

{
  "results": [
    {
      "id": "LOC_xxx",
      "types": string[],
      "name": string,
      "location_details": string,
      "confidence": number
    }
  ]
}

Possible types: address, building, city, district, province, coordinate, landmark, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed locations if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not infer information not present in the input.
- If no locations are found, return an empty JSON.
`;

const userPromptLocationTh = `สกัดข้อมูล **สถานที่** ทั้งหมดจากอินพุตด้านล่าง

ผลลัพธ์ของคุณ **ต้องเป็น** ออบเจ็กต์ JSON เดียวที่มีโครงสร้างดังนี้:

{
  "results": [
    {
      "id": "LOC_xxx",
      "types": string[],
      "name": string,
      "location_details": string,
      "confidence": number
    }
  ]
}

ประเภทที่เป็นไปได้ (ใช้ภาษาอังกฤษ): address, building, city, district, province, coordinate, landmark, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมสถานที่ที่ไม่มีชื่อ หากมีการกล่าวถึงอย่างชัดเจน
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามอนุมานข้อมูลที่ไม่มีในอินพุต
- หากไม่พบสถานที่ ให้ส่งกลับเป็น JSON ว่าง
`;

const userPromptAssetEn = `Extract all **assets** from the input below.

Your output must be **only** a single JSON object with the following structure:

{
  "results": [
    {
      "id": "AST_xxx",
      "types": string[],
      "name": string,
      "asset_details": string,
      "confidence": number
    }
  ]
}

Possible types: vehicle, phone, money, weapon, jewelry, document, card, equipment, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed assets if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not infer information not present in the input.
- If no assets are found, return an empty JSON.
`;

const userPromptAssetTh = `สกัดข้อมูล **ทรัพย์สิน** ทั้งหมดจากอินพุตด้านล่าง

ผลลัพธ์ของคุณ **ต้องเป็น** ออบเจ็กต์ JSON เดียวที่มีโครงสร้างดังนี้:

{
  "results": [
    {
      "id": "AST_xxx",
      "types": string[],
      "name": string,
      "asset_details": string,
      "confidence": number
    }
  ]
}

ประเภทที่เป็นไปได้ (ใช้ภาษาอังกฤษ): vehicle, phone, money, weapon, jewelry, document, card, equipment, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมทรัพย์สินที่ไม่มีชื่อ หากมีการกล่าวถึงอย่างชัดเจน
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามอนุมานข้อมูลที่ไม่มีในอินพุต
- หากไม่พบทรัพย์สิน ให้ส่งกลับเป็น JSON ว่าง
`;

const userPromptDamageEn = `Extract all **damages** from the input below.

Your output must be **only** a single JSON object with the following structure:

{
  "results": [
    {
      "id": "DMG_xxx",
      "types": string[],
      "name": string,
      "damage_details": string,
      "value": string,
      "confidence": number
    }
  ]
}

Possible types: injury, financial loss, theft loss, broken property, destruction, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed damages if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not infer information not present in the input.
- If no damages are found, return an empty JSON.
`;

const userPromptDamageTh = `สกัดข้อมูล **ความเสียหาย** ทั้งหมดจากอินพุตด้านล่าง

ผลลัพธ์ของคุณ **ต้องเป็น** ออบเจ็กต์ JSON เดียวที่มีโครงสร้างดังนี้:

{
  "results": [
    {
      "id": "DMG_xxx",
      "types": string[],
      "name": string,
      "damage_details": string,
      "value": string,
      "confidence": number
    }
  ]
}

ประเภทที่เป็นไปได้ (ใช้ภาษาอังกฤษ): injury, financial loss, theft loss, broken property, destruction, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมความเสียหายที่ไม่ได้ระบุชื่ออย่างชัดเจน หากมีการกล่าวถึง
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามอนุมานข้อมูลที่ไม่มีในอินพุต
- หากไม่พบความเสียหาย ให้ส่งกลับเป็น JSON ว่าง
`;

const userPromptEvidenceEn = `Extract all **evidence** from the input below.

Your output must be **only** a single JSON object with the following structure:

{
  "results": [
    {
      "id": "EVD_xxx",
      "types": string[],
      "name": string,
      "evidence_details": string,
      "confidence": number
    }
  ]
}

Possible types: cctv, photo, video, fingerprint, dna, statement, forensic item, log, report, seized proof, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed evidence items if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not infer information not present in the input.
- If no evidence is found, return an empty JSON.
`;

const userPromptEvidenceTh = `สกัดข้อมูล **หลักฐาน** ทั้งหมดจากอินพุตด้านล่าง

ผลลัพธ์ของคุณ **ต้องเป็น** ออบเจ็กต์ JSON เดียวที่มีโครงสร้างดังนี้:

{
  "results": [
    {
      "id": "EVD_xxx",
      "types": string[],
      "name": string,
      "evidence_details": string,
      "confidence": number
    }
  ]
}

ประเภทที่เป็นไปได้ (ใช้ภาษาอังกฤษ): cctv, photo, video, fingerprint, dna, statement, forensic item, log, report, seized proof, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมหลักฐานที่ไม่มีชื่อ หากมีการกล่าวถึงอย่างชัดเจน
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามอนุมานข้อมูลที่ไม่มีในอินพุต
- หากไม่พบหลักฐาน ให้ส่งกลับเป็น JSON ว่าง
`;

const userPromptEventEn = `Extract all **events** from the input below.

Your output must be **only** a single JSON object with the following structure:

{
  "results": [
    {
      "id": "EVT_xxx",
      "types": string[],
      "name": string,
      "occurrence_time": string,
      "event_details": string,
      "confidence": number
    }
  ]
}

Allowed types: theft, assault, arrest, interview, seizure, collision, fraud, report, damage, search, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed events if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not infer information not present in the input.
- If no events are found, return an empty JSON.
`;

const userPromptEventTh = `สกัดข้อมูล **เหตุการณ์** ทั้งหมดจากอินพุตด้านล่าง

ผลลัพธ์ของคุณ **ต้องเป็น** ออบเจ็กต์ JSON เดียวที่มีโครงสร้างดังนี้:

{
  "results": [
    {
      "id": "EVT_xxx",
      "types": string[],
      "name": string,
      "occurrence_time": string,
      "event_details": string,
      "confidence": number
    }
  ]
}

ประเภทที่อนุญาต (ใช้ภาษาอังกฤษ): theft, assault, arrest, interview, seizure, collision, fraud, report, damage, search, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมเหตุการณ์ที่ไม่ระบุชื่ออย่างชัดเจน หากมีการกล่าวถึง
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามอนุมานข้อมูลที่ไม่มีในอินพุต
- หากไม่พบเหตุการณ์ ให้ส่งกลับเป็น JSON ว่าง
`;
