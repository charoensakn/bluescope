import { Output } from 'ai';
import { z } from 'zod';
import { BaseAgent, type RunArgs } from './base';

export class StructureExtractionAgent extends BaseAgent {
  name() {
    return 'structure-extraction-v1';
  }

  output(input: RunArgs): Output.Output {
    switch (input.extract) {
      case 'person':
        return Output.array({
          element: z.object({
            id: z.string(),
            types: z.array(z.string()),
            name: z.string(),
            person_details: z.string(),
            condition: z.string(),
            confidence: z.number(),
          }),
        });
      case 'organization':
        return Output.array({
          element: z.object({
            id: z.string(),
            types: z.array(z.string()),
            name: z.string(),
            organization_details: z.string(),
            confidence: z.number(),
          }),
        });
      case 'location':
        return Output.array({
          element: z.object({
            id: z.string(),
            types: z.array(z.string()),
            name: z.string(),
            location_details: z.string(),
            confidence: z.number(),
          }),
        });
      case 'asset':
        return Output.array({
          element: z.object({
            id: z.string(),
            types: z.array(z.string()),
            name: z.string(),
            asset_details: z.string(),
            confidence: z.number(),
          }),
        });
      case 'damage':
        return Output.array({
          element: z.object({
            id: z.string(),
            types: z.array(z.string()),
            name: z.string(),
            damage_details: z.string(),
            value: z.string(),
            confidence: z.number(),
          }),
        });
      case 'evidence':
        return Output.array({
          element: z.object({
            id: z.string(),
            types: z.array(z.string()),
            name: z.string(),
            evidence_details: z.string(),
            confidence: z.number(),
          }),
        });
      case 'event':
        return Output.array({
          element: z.object({
            id: z.string(),
            types: z.array(z.string()),
            name: z.string(),
            occurrence_time: z.string(),
            event_details: z.string(),
            confidence: z.number(),
          }),
        });
      default:
        throw new Error(`Unsupported extract type: ${input.extract}`);
    }
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

Return only one JSON array following this exact schema:

{
  "id": "PER_xxx",
  "types": string[],
  "name": string,
  "person_details": string,
  "condition": string,
  "confidence": number
}

Possible types: suspect, victim, witness, officer, complainant, owner, driver, named individual, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed individuals if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not add fields not defined in the schema.
- Output JSON array only, with no explanation.
`;

const userPromptPersonTh = `สกัดข้อมูล **บุคคล** ทั้งหมดจากอินพุตด้านล่าง

โดยส่งกลับเป็น JSON array เดียวตาม schema นี้เท่านั้น:

{
  "id": "PER_xxx",
  "types": string[],
  "name": string,
  "person_details": string,
  "condition": string,
  "confidence": number
}

ประเภทที่เป็นไปได้ (ใช้ภาษาอังกฤษ): suspect, victim, witness, officer, complainant, owner, driver, named individual, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมบุคคลที่ไม่มีชื่อ หากมีการกล่าวถึงอย่างชัดเจน
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามเพิ่มฟิลด์ที่ไม่อยู่ใน schema
- แสดงผลเฉพาะ JSON array เท่านั้น โดยไม่ต้องอธิบายเพิ่มเติม
`;

const userPromptOrganizationEn = `Extract all **organizations** from the input below.

Return only one JSON array following this exact schema:

{
  "id": "ORG_xxx",
  "types": string[],
  "name": string,
  "organization_details": string,
  "confidence": number
}

Possible types: department, company, agency, institution, group, bank, school, hospital, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed organizations if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not add fields not defined in the schema.
- Output JSON array only, with no explanation.
`;

const userPromptOrganizationTh = `สกัดข้อมูล **องค์กร** ทั้งหมดจากอินพุตด้านล่าง

โดยส่งกลับเป็น JSON array เดียวตาม schema นี้เท่านั้น:

{
  "id": "ORG_xxx",
  "types": string[],
  "name": string,
  "organization_details": string,
  "confidence": number
}

ประเภทที่เป็นไปได้ (ใช้ภาษาอังกฤษ): department, company, agency, institution, group, bank, school, hospital, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมองค์กรที่ไม่มีชื่อ หากมีการกล่าวถึงอย่างชัดเจน
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามเพิ่มฟิลด์ที่ไม่อยู่ใน schema
- แสดงผลเฉพาะ JSON array เท่านั้น โดยไม่ต้องอธิบายเพิ่มเติม
`;

const userPromptLocationEn = `Extract all **locations** from the input below.

Return only one JSON array following this exact schema:

{
  "id": "LOC_xxx",
  "types": string[],
  "name": string,
  "location_details": string,
  "confidence": number
}

Possible types: address, building, city, district, province, coordinate, landmark, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed locations if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not infer information not present in the input.
- Do not add fields not defined in the schema.
- If no locations are found, return an empty JSON array.
- Output JSON array only, with no explanation.
`;

const userPromptLocationTh = `สกัดข้อมูล **สถานที่** ทั้งหมดจากอินพุตด้านล่าง

โดยส่งกลับเป็น JSON array เดียวตาม schema นี้เท่านั้น:

{
  "id": "LOC_xxx",
  "types": string[],
  "name": string,
  "location_details": string,
  "confidence": number
}

ประเภทที่เป็นไปได้ (ใช้ภาษาอังกฤษ): address, building, city, district, province, coordinate, landmark, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมสถานที่ที่ไม่มีชื่อ หากมีการกล่าวถึงอย่างชัดเจน
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามอนุมานข้อมูลที่ไม่มีในอินพุต
- ห้ามเพิ่มฟิลด์ที่ไม่อยู่ใน schema
- หากไม่พบสถานที่ ให้ส่งกลับเป็น JSON array ว่าง
- แสดงผลเฉพาะ JSON array เท่านั้น โดยไม่ต้องอธิบายเพิ่มเติม
`;

const userPromptAssetEn = `Extract all **assets** from the input below.

Return only one JSON array following this exact schema:

{
  "id": "AST_xxx",
  "types": string[],
  "name": string,
  "asset_details": string,
  "confidence": number
}

Possible types: vehicle, phone, money, weapon, jewelry, document, card, equipment, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed assets if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not infer information not present in the input.
- Do not add fields not defined in the schema.
- If no assets are found, return an empty JSON array.
- Output JSON array only, with no explanation.
`;

const userPromptAssetTh = `สกัดข้อมูล **ทรัพย์สิน** ทั้งหมดจากอินพุตด้านล่าง

โดยส่งกลับเป็น JSON array เดียวตาม schema นี้เท่านั้น:

{
  "id": "AST_xxx",
  "types": string[],
  "name": string,
  "asset_details": string,
  "confidence": number
}

ประเภทที่เป็นไปได้ (ใช้ภาษาอังกฤษ): vehicle, phone, money, weapon, jewelry, document, card, equipment, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมทรัพย์สินที่ไม่มีชื่อ หากมีการกล่าวถึงอย่างชัดเจน
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามอนุมานข้อมูลที่ไม่มีในอินพุต
- ห้ามเพิ่มฟิลด์ที่ไม่อยู่ใน schema
- หากไม่พบทรัพย์สิน ให้ส่งกลับเป็น JSON array ว่าง
- แสดงผลเฉพาะ JSON array เท่านั้น โดยไม่ต้องอธิบายเพิ่มเติม
`;

const userPromptDamageEn = `Extract all **damages** from the input below.

Return only one JSON array following this exact schema:

{
  "id": "DMG_xxx",
  "types": string[],
  "name": string,
  "damage_details": string,
  "value": string,
  "confidence": number
}

Possible types: injury, financial loss, theft loss, broken property, destruction, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed damages if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not infer information not present in the input.
- Do not add fields not defined in the schema.
- If no damages are found, return an empty JSON array.
- Output JSON array only, with no explanation.
`;

const userPromptDamageTh = `สกัดข้อมูล **ความเสียหาย** ทั้งหมดจากอินพุตด้านล่าง

โดยส่งกลับเป็น JSON array เดียวตาม schema นี้เท่านั้น:

{
  "id": "DMG_xxx",
  "types": string[],
  "name": string,
  "damage_details": string,
  "value": string,
  "confidence": number
}

ประเภทที่เป็นไปได้ (ใช้ภาษาอังกฤษ): injury, financial loss, theft loss, broken property, destruction, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมความเสียหายที่ไม่ได้ระบุชื่ออย่างชัดเจน หากมีการกล่าวถึง
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามอนุมานข้อมูลที่ไม่มีในอินพุต
- ห้ามเพิ่มฟิลด์ที่ไม่อยู่ใน schema
- หากไม่พบความเสียหาย ให้ส่งกลับเป็น JSON array ว่าง
- แสดงผลเฉพาะ JSON array เท่านั้น โดยไม่ต้องอธิบายเพิ่มเติม
`;

const userPromptEvidenceEn = `Extract all **evidence** from the input below.

Return only one JSON array following this exact schema:

{
  "id": "EVD_xxx",
  "types": string[],
  "name": string,
  "evidence_details": string,
  "confidence": number
}

Possible types: cctv, photo, video, fingerprint, dna, statement, forensic item, log, report, seized proof, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed evidence items if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not infer information not present in the input.
- Do not add fields not defined in the schema.
- If no evidence is found, return an empty JSON array.
- Output JSON array only, with no explanation.
`;

const userPromptEvidenceTh = `สกัดข้อมูล **หลักฐาน** ทั้งหมดจากอินพุตด้านล่าง

โดยส่งกลับเป็น JSON array เดียวตาม schema นี้เท่านั้น:

{
  "id": "EVD_xxx",
  "types": string[],
  "name": string,
  "evidence_details": string,
  "confidence": number
}

ประเภทที่เป็นไปได้ (ใช้ภาษาอังกฤษ): cctv, photo, video, fingerprint, dna, statement, forensic item, log, report, seized proof, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมหลักฐานที่ไม่มีชื่อ หากมีการกล่าวถึงอย่างชัดเจน
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามอนุมานข้อมูลที่ไม่มีในอินพุต
- ห้ามเพิ่มฟิลด์ที่ไม่อยู่ใน schema
- หากไม่พบหลักฐาน ให้ส่งกลับเป็น JSON array ว่าง
- แสดงผลเฉพาะ JSON array เท่านั้น โดยไม่ต้องอธิบายเพิ่มเติม
`;

const userPromptEventEn = `Extract all **events** from the input below.

Return only one JSON array following this exact schema:

{
  "id": "EVT_xxx",
  "types": string[],
  "name": string,
  "occurrence_time": string,
  "event_details": string,
  "confidence": number
}

Allowed types: theft, assault, arrest, interview, seizure, collision, fraud, report, damage, search, other

Rules:
- Use only information grounded in the story or entities.
- Include unnamed events if clearly implied.
- Keep descriptions concise.
- Use consistent references.
- Do not infer information not present in the input.
- Do not add fields not defined in the schema.
- If no events are found, return an empty JSON array.
- Output JSON array only, with no explanation.
`;

const userPromptEventTh = `สกัดข้อมูล **เหตุการณ์** ทั้งหมดจากอินพุตด้านล่าง

โดยส่งกลับเป็น JSON array เดียวตาม schema นี้เท่านั้น:

{
  "id": "EVT_xxx",
  "types": string[],
  "name": string,
  "occurrence_time": string,
  "event_details": string,
  "confidence": number
}

ประเภทที่อนุญาต (ใช้ภาษาอังกฤษ): theft, assault, arrest, interview, seizure, collision, fraud, report, damage, search, other

กฎ:
- ใช้เฉพาะข้อมูลที่ยืนยันได้จากเรื่องราวหรือเอนทิตี
- รวมเหตุการณ์ที่ไม่ระบุชื่ออย่างชัดเจน หากมีการกล่าวถึง
- เขียนคำอธิบายให้กระชับ
- รักษาความสอดคล้องของการอ้างอิง
- ห้ามอนุมานข้อมูลที่ไม่มีในอินพุต
- ห้ามเพิ่มฟิลด์ที่ไม่อยู่ใน schema
- หากไม่พบเหตุการณ์ ให้ส่งกลับเป็น JSON array ว่าง
- แสดงผลเฉพาะ JSON array เท่านั้น โดยไม่ต้องอธิบายเพิ่มเติม
`;
