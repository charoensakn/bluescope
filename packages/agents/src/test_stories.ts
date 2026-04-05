interface CaseData {
  label: string;
  en: string;
  th: string;
}

const normalize = (text: string) => text.replaceAll(/\s+/g, ' ');

const cases: CaseData[] = [
  // 1 — Assault
  {
    label: 'assault',
    en: `On the night of 12 March 2024, at approximately 21:15, Mr. Somchai Prasert, a 35-year-old office worker, reported that he was assaulted by Mr. Ek Chaiyaporn in front of a convenience store located on Phahonyothin Road in Bang Khen district, Bangkok.

According to Somchai, the incident occurred after an argument between the two men inside the store. After they walked outside, Ek punched Somchai in the face several times, causing him to fall to the ground. During the incident, Somchai's mobile phone fell from his hand and its screen was cracked.

A friend of Somchai who witnessed the incident took him to Kasemrad Hospital for treatment. The hospital later issued a medical report confirming that Somchai suffered a facial injury and a minor concussion.

The convenience store belongs to CP All Public Company Limited. CCTV cameras installed outside the store recorded the entire incident.

Somchai estimated that the damaged mobile phone was worth about 8,000 baht.`,
    th: `เมื่อวันที่ 12 มีนาคม 2567 เวลาประมาณ 21.15 น. นายสมชาย ประเสริฐ อายุ 35 ปี พนักงานบริษัทแห่งหนึ่ง แจ้งว่าถูกนายเอก ชัยภรณ์ ทำร้ายร่างกายบริเวณหน้าร้านสะดวกซื้อบนถนนพหลโยธิน แขวงอนุสาวรีย์ เขตบางเขน กรุงเทพมหานคร

นายสมชายให้การว่า ก่อนเกิดเหตุทั้งสองคนมีปากเสียงกันภายในร้านสะดวกซื้อ หลังจากนั้นเมื่อออกมาหน้าร้าน นายเอกได้ชกต่อยนายสมชายหลายครั้งจนล้มลงกับพื้น ระหว่างเหตุการณ์โทรศัพท์มือถือของนายสมชายตกลงพื้นและหน้าจอแตกเสียหาย

เพื่อนของนายสมชายซึ่งอยู่ในเหตุการณ์ได้พานายสมชายไปเข้ารับการรักษาที่โรงพยาบาลเกษมราษฎร์ แพทย์ได้ออกใบรับรองแพทย์ระบุว่านายสมชายมีบาดแผลบริเวณใบหน้าและมีอาการกระทบกระเทือนเล็กน้อยที่ศีรษะ

ร้านสะดวกซื้อดังกล่าวเป็นสาขาของบริษัท ซีพี ออลล์ จำกัด (มหาชน) และมีกล้องวงจรปิดบริเวณหน้าร้านซึ่งสามารถบันทึกเหตุการณ์ขณะเกิดเหตุไว้ได้

นายสมชายประเมินว่าโทรศัพท์มือถือที่เสียหายมีมูลค่าประมาณ 8,000 บาท`,
  },

  // 2 — Phone scam
  {
    label: 'phone-scam',
    en: `On 5 June 2024, Ms. Nattaya Wong received a phone call from a person claiming to be an officer from Bangkok Bank. The caller informed her that her bank account had been involved in suspicious transactions and instructed her to transfer money to a temporary account for verification.

The caller identified himself as Mr. Anan and claimed to represent the Anti-Fraud Department of Bangkok Bank.

Believing the information to be true, Nattaya transferred 50,000 baht from her Bangkok Bank account to another account registered under the name Mr. Kritsada Thongchai at Siam Commercial Bank.

Later that day, Nattaya contacted Bangkok Bank directly and discovered that the call had been fraudulent.

Nattaya filed a complaint at Phaya Thai Police Station. She provided evidence including the bank transfer slip, the phone number used by the caller, and screenshots of the conversation recorded on her mobile phone.`,
    th: `เมื่อวันที่ 5 มิถุนายน 2567 นางสาวณัฐยา วงศ์ ได้รับโทรศัพท์จากบุคคลที่อ้างว่าเป็นเจ้าหน้าที่ฝ่ายป้องกันการทุจริตของธนาคารกรุงเทพ โดยแจ้งว่าบัญชีธนาคารของเธอมีธุรกรรมต้องสงสัยและจำเป็นต้องตรวจสอบบัญชี

ผู้โทรใช้ชื่อว่านายอนันต์ และแนะนำให้นางสาวณัฐยาโอนเงินจำนวน 50,000 บาทไปยังบัญชีธนาคารชั่วคราวเพื่อทำการตรวจสอบ

นางสาวณัฐยาหลงเชื่อและโอนเงินจากบัญชีธนาคารกรุงเทพของตนไปยังบัญชีธนาคารไทยพาณิชย์ที่จดทะเบียนในชื่อนายกฤษดา ทองชัย

ต่อมานางสาวณัฐยาได้ติดต่อธนาคารกรุงเทพโดยตรงและพบว่าไม่มีเจ้าหน้าที่คนใดโทรมาแจ้งดังกล่าว จึงทราบว่าตนตกเป็นเหยื่อของการหลอกลวง

นางสาวณัฐยาได้เข้าแจ้งความต่อพนักงานสอบสวนที่สถานีตำรวจนครบาลพญาไท พร้อมนำหลักฐาน ได้แก่ สลิปการโอนเงิน หมายเลขโทรศัพท์ของผู้โทร และภาพหน้าจอการสนทนาในโทรศัพท์มือถือมาแสดง`,
  },

  // 3 — Car theft
  {
    label: 'car-theft',
    en: `On the morning of 20 January 2024, Mr. Preecha Suksan discovered that his white Toyota Camry, license plate 1กข1234 Bangkok, was missing from the parking area of his apartment building located on Ratchadaphisek Road.

According to the building's security guard, a man wearing a black jacket was seen driving the vehicle out of the parking area at around 03:00 AM.

The apartment building is managed by Ratchada Residence Co., Ltd.

Preecha reported the theft at Huai Khwang Police Station. Police officers later collected CCTV footage from the apartment's parking lot showing the suspect entering the vehicle and driving away.

The estimated value of the stolen car is approximately 850,000 baht.`,
    th: `เมื่อวันที่ 20 มกราคม 2567 เวลาเช้าประมาณ 07.00 น. นายปรีชา สุขสันต์ พบว่ารถยนต์ส่วนตัวของตนยี่ห้อโตโยต้า รุ่นคัมรี สีขาว หมายเลขทะเบียน 1กข1234 กรุงเทพมหานคร หายไปจากลานจอดรถของอาคารที่พักอาศัยบนถนนรัชดาภิเษก

พนักงานรักษาความปลอดภัยของอาคารให้ข้อมูลว่า เมื่อเวลาประมาณ 03.00 น. มีชายสวมเสื้อแจ็กเก็ตสีดำขับรถยนต์คันดังกล่าวออกจากลานจอดรถ

อาคารที่พักดังกล่าวบริหารจัดการโดยบริษัท รัชดา เรสซิเดนซ์ จำกัด

นายปรีชาได้เข้าแจ้งความต่อพนักงานสอบสวนที่สถานีตำรวจนครบาลห้วยขวาง และเจ้าหน้าที่ตำรวจได้ตรวจสอบกล้องวงจรปิดบริเวณลานจอดรถ ซึ่งพบภาพชายต้องสงสัยกำลังขับรถยนต์ออกจากพื้นที่

นายปรีชาประเมินว่ารถยนต์คันดังกล่าวมีมูลค่าประมาณ 850,000 บาท`,
  },

  // 4 — Traffic accident
  {
    label: 'traffic-accident',
    en: `On 18 February 2024 at approximately 07:45 AM, a traffic accident occurred at the intersection of Rama IX Road and Ratchadaphisek Road in Bangkok.

Mr. Thanawat Charoen was driving a black Honda Civic when his vehicle collided with a motorcycle ridden by Mr. Surasak Panya.

As a result of the collision, Surasak fell onto the road and sustained injuries to his left leg. His motorcycle was also heavily damaged.

Emergency responders from Bangkok Emergency Medical Service transported Surasak to Phraram 9 Hospital for treatment.

Police officers from Huai Khwang Police Station later examined the scene and collected dashcam footage from a nearby taxi that recorded the collision.`,
    th: `เมื่อวันที่ 18 กุมภาพันธ์ 2567 เวลาประมาณ 07.45 น. เกิดอุบัติเหตุทางจราจรบริเวณสี่แยกถนนพระราม 9 ตัดกับถนนรัชดาภิเษก กรุงเทพมหานคร

นายธนวัฒน์ เจริญ กำลังขับรถยนต์ยี่ห้อฮอนด้า ซีวิค สีดำ เมื่อมาถึงบริเวณสี่แยกได้ชนกับรถจักรยานยนต์ที่นายสุรศักดิ์ ปัญญา เป็นผู้ขับขี่

จากการชนดังกล่าวทำให้นายสุรศักดิ์ล้มลงบนถนนและได้รับบาดเจ็บที่ขาซ้าย ขณะที่รถจักรยานยนต์ได้รับความเสียหายอย่างหนัก

เจ้าหน้าที่จากศูนย์บริการการแพทย์ฉุกเฉินกรุงเทพมหานครได้เข้าช่วยเหลือและนำตัวนายสุรศักดิ์ส่งโรงพยาบาลพระราม 9

ต่อมาเจ้าหน้าที่ตำรวจจากสถานีตำรวจนครบาลห้วยขวางได้ตรวจสอบที่เกิดเหตุและเก็บหลักฐานเพิ่มเติม รวมถึงภาพจากกล้องหน้ารถของรถแท็กซี่ที่บันทึกเหตุการณ์ขณะเกิดอุบัติเหตุไว้ได้`,
  },

  // 5 — Online fraud
  {
    label: 'online-fraud',
    en: `In April 2024, Mr. Kittipong Arun ordered a laptop through an online marketplace page called TechDeal Thailand on Facebook.

The seller, who used the name "Best Tech Store," requested that Kittipong transfer 25,000 baht to a bank account registered under the name Ms. Ladda Srisuk.

After the transfer was completed, the seller stopped responding to messages and the laptop was never delivered.

Kittipong later discovered that several other buyers had reported similar incidents involving the same Facebook page.

He reported the incident to officers at Cyber Crime Investigation Bureau and submitted evidence including screenshots of the Facebook conversation, the bank transfer record, and the website link of the seller's page.`,
    th: `ในเดือนเมษายน 2567 นายกิตติพงษ์ อรุณ ได้สั่งซื้อคอมพิวเตอร์โน้ตบุ๊กผ่านเพจขายสินค้าออนไลน์ชื่อ TechDeal Thailand บนแพลตฟอร์ม Facebook

ผู้ขายใช้ชื่อร้านว่า Best Tech Store และแจ้งให้นายกิตติพงษ์โอนเงินจำนวน 25,000 บาทไปยังบัญชีธนาคารที่จดทะเบียนในชื่อนางสาวลดา ศรีสุข

หลังจากที่นายกิตติพงษ์โอนเงินแล้ว ผู้ขายได้หยุดตอบข้อความและไม่ส่งสินค้าให้

ต่อมานายกิตติพงษ์พบว่ามีผู้เสียหายรายอื่นร้องเรียนเกี่ยวกับเพจดังกล่าวในลักษณะเดียวกัน

นายกิตติพงษ์จึงเข้าแจ้งความต่อเจ้าหน้าที่กองบังคับการปราบปรามอาชญากรรมทางเทคโนโลยี พร้อมนำหลักฐาน ได้แก่ ภาพหน้าจอการสนทนา หลักฐานการโอนเงิน และลิงก์ของเพจร้านค้ามาแสดง`,
  },

  // 6 — Burglary
  {
    label: 'burglary',
    en: `On 10 August 2024 at approximately 14:00, Mrs. Arunee Sombat, age 52, returned to her home on Soi Sukhumvit 31 in Watthana district, Bangkok, and discovered that the front door had been forced open. Several valuable items were missing from the house, including a gold necklace weighing 5 baht, a diamond ring, and cash amounting to 120,000 baht kept in a bedroom drawer.

Neighbors reported seeing an unfamiliar man carrying a backpack leaving the house at around 12:30 PM. The man was described as approximately 175 cm tall and wearing a grey cap and a blue T-shirt.

Mrs. Arunee reported the incident to Thong Lor Police Station. Fingerprints were collected from the door frame and bedroom furniture. Officers also obtained CCTV footage from a neighboring house that captured the suspect entering and leaving the premises.

The total estimated value of the stolen property is approximately 320,000 baht.`,
    th: `เมื่อวันที่ 10 สิงหาคม 2567 เวลาประมาณ 14.00 น. นางอรุณี สมบัติ อายุ 52 ปี กลับมาถึงบ้านพักของตนบนซอยสุขุมวิท 31 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพมหานคร พบว่าประตูหน้าบ้านถูกงัดเปิดออก และทรัพย์สินมีค่าหลายรายการหายไป ได้แก่ สร้อยคอทองคำหนัก 5 บาท แหวนเพชร 1 วง และเงินสดจำนวน 120,000 บาท ที่เก็บไว้ในลิ้นชักห้องนอน

เพื่อนบ้านให้ข้อมูลว่าเมื่อเวลาประมาณ 12.30 น. เห็นชายแปลกหน้าถือกระเป๋าเป้ออกจากบ้านดังกล่าว ชายคนดังกล่าวมีรูปร่างสูงประมาณ 175 เซนติเมตร สวมหมวกแก๊ปสีเทาและเสื้อยืดสีน้ำเงิน

นางอรุณีได้เข้าแจ้งความต่อพนักงานสอบสวนที่สถานีตำรวจนครบาลทองหล่อ เจ้าหน้าที่ตำรวจได้เก็บลายนิ้วมือจากบริเวณวงกบประตูและเฟอร์นิเจอร์ในห้องนอน รวมถึงตรวจสอบกล้องวงจรปิดจากบ้านข้างเคียงซึ่งบันทึกภาพผู้ต้องสงสัยเข้าและออกจากบ้านไว้ได้

มูลค่าทรัพย์สินที่ถูกขโมยรวมทั้งหมดประมาณ 320,000 บาท`,
  },

  // 7 — Embezzlement
  {
    label: 'embezzlement',
    en: `Between January and September 2024, Mr. Worawit Jantarasuk, a finance manager at Siam Craft Industries Co., Ltd., was found to have embezzled company funds totaling 2,350,000 baht.

An internal audit revealed that Worawit had created fictitious supplier invoices and diverted payments to a personal bank account at Kasikorn Bank registered under his own name.

The company's CEO, Mr. Pairoj Lertpanich, filed a criminal complaint at Bang Rak Police Station on 15 October 2024 after the audit committee confirmed the irregularities.

Evidence submitted included financial records, forged invoices, bank statements showing the diverted transfers, and email correspondence between Worawit and the accounting department.

Siam Craft Industries Co., Ltd. also filed a civil lawsuit seeking full recovery of the embezzled amount plus damages.`,
    th: `ระหว่างเดือนมกราคมถึงกันยายน 2567 นายวรวิทย์ จันทรสุข ตำแหน่งผู้จัดการฝ่ายการเงินของบริษัท สยามคราฟท์ อินดัสทรีส์ จำกัด ถูกตรวจพบว่ายักยอกเงินของบริษัทเป็นจำนวนรวม 2,350,000 บาท

ผลการตรวจสอบบัญชีภายในพบว่านายวรวิทย์ได้สร้างใบแจ้งหนี้ปลอมจากผู้ขายที่ไม่มีอยู่จริง และโอนเงินดังกล่าวเข้าบัญชีส่วนตัวของตนเองที่ธนาคารกสิกรไทย

นายไพโรจน์ เลิศพาณิชย์ ตำแหน่งกรรมการผู้จัดการของบริษัท ได้เข้าแจ้งความดำเนินคดีต่อพนักงานสอบสวนที่สถานีตำรวจนครบาลบางรัก เมื่อวันที่ 15 ตุลาคม 2567 หลังจากคณะกรรมการตรวจสอบยืนยันความผิดปกติแล้ว

หลักฐานที่ยื่นประกอบด้วยบันทึกทางการเงิน ใบแจ้งหนี้ปลอม รายการเดินบัญชีธนาคารที่แสดงการโอนเงิน และอีเมลโต้ตอบระหว่างนายวรวิทย์กับแผนกบัญชี

บริษัท สยามคราฟท์ อินดัสทรีส์ จำกัด ยังได้ยื่นฟ้องคดีแพ่งเรียกร้องให้ชดใช้เงินที่ถูกยักยอกคืนทั้งหมดพร้อมค่าเสียหาย`,
  },

  // 8 — Defamation
  {
    label: 'defamation',
    en: `On 3 September 2024, Ms. Rattana Wongpaisarn filed a criminal defamation complaint against Mr. Tanakorn Meesuk at Phra Khanong Police Station.

According to Rattana, on 28 August 2024, Tanakorn posted several messages on his public Facebook account accusing Rattana of stealing money from their workplace, a dental clinic called Smile Dental Center located on Sukhumvit Road.

The posts were shared over 500 times and included Rattana's full name and photograph. Multiple comments under the posts contained further accusations and insults directed at Rattana.

Rattana stated that the accusations were entirely false and that she had never been involved in any financial misconduct at the clinic. She provided screenshots of the Facebook posts, a record of employee performance reviews from the clinic, and a certified statement from the clinic's owner, Dr. Manee Charoensri, confirming that no theft had occurred.

Rattana claimed that the posts caused significant damage to her reputation and emotional distress.`,
    th: `เมื่อวันที่ 3 กันยายน 2567 นางสาวรัตนา วงศ์ไพศาล ได้เข้าแจ้งความร้องทุกข์ในข้อหาหมิ่นประมาทต่อนายธนากร มีสุข ที่สถานีตำรวจนครบาลพระโขนง

นางสาวรัตนาให้การว่า เมื่อวันที่ 28 สิงหาคม 2567 นายธนากรได้โพสต์ข้อความหลายรายการในบัญชี Facebook สาธารณะของตน กล่าวหาว่านางสาวรัตนาขโมยเงินจากสถานที่ทำงาน ซึ่งเป็นคลินิกทันตกรรมชื่อ สไมล์ เดนทัล เซ็นเตอร์ ตั้งอยู่บนถนนสุขุมวิท

โพสต์ดังกล่าวถูกแชร์มากกว่า 500 ครั้ง และมีการระบุชื่อจริงพร้อมรูปถ่ายของนางสาวรัตนา ความคิดเห็นใต้โพสต์หลายรายการมีการกล่าวหาและดูถูกเพิ่มเติม

นางสาวรัตนาให้การว่าข้อกล่าวหาดังกล่าวเป็นเท็จทั้งสิ้น และตนไม่เคยมีส่วนเกี่ยวข้องกับการทุจริตทางการเงินใดๆ ที่คลินิก โดยนำหลักฐานมาแสดง ได้แก่ ภาพหน้าจอโพสต์ Facebook บันทึกผลการประเมินการทำงานจากคลินิก และหนังสือรับรองจากเจ้าของคลินิก ทันตแพทย์หญิงมณี เจริญศรี ยืนยันว่าไม่มีเหตุการณ์ลักทรัพย์เกิดขึ้น

นางสาวรัตนาระบุว่าโพสต์ดังกล่าวสร้างความเสียหายต่อชื่อเสียงและก่อให้เกิดความทุกข์ทางจิตใจอย่างมาก`,
  },

  // 9 — Land encroachment
  {
    label: 'land-encroachment',
    en: `On 22 November 2024, Mr. Sompong Rattanakul filed a civil complaint at the Nonthaburi Provincial Court against Mrs. Jintra Kaewmanee regarding a land encroachment dispute.

Sompong owns a plot of land covering 1 rai 2 ngan on Tiwanon Road, Tambon Talat Khwan, Amphoe Mueang Nonthaburi, under title deed No. 54832. He alleged that Jintra, who owns the adjacent plot, had constructed a concrete wall and a storage shed that extended approximately 3 meters into his property.

Sompong stated that he had previously asked Jintra to remove the structures but she refused, claiming that the wall was built along the correct boundary.

A licensed surveyor from the Department of Lands conducted a survey on 10 October 2024 and confirmed that the structures encroached on Sompong's land by 2.8 meters.

Evidence submitted included the title deed, the surveyor's report, photographs of the encroaching structures, and records of prior correspondence between the two parties.`,
    th: `เมื่อวันที่ 22 พฤศจิกายน 2567 นายสมพงษ์ รัตนกุล ได้ยื่นฟ้องคดีแพ่งต่อศาลจังหวัดนนทบุรี กล่าวหานางจินตรา แก้วมณี ในข้อพิพาทเรื่องการรุกล้ำที่ดิน

นายสมพงษ์เป็นเจ้าของที่ดินเนื้อที่ 1 ไร่ 2 งาน บนถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมืองนนทบุรี จังหวัดนนทบุรี ตามโฉนดที่ดินเลขที่ 54832 โดยกล่าวหาว่านางจินตราซึ่งเป็นเจ้าของที่ดินแปลงติดกัน ได้ก่อสร้างกำแพงคอนกรีตและโรงเก็บของรุกล้ำเข้ามาในที่ดินของตนประมาณ 3 เมตร

นายสมพงษ์ให้การว่าเคยแจ้งให้นางจินตรารื้อถอนสิ่งปลูกสร้างดังกล่าวแล้ว แต่นางจินตราปฏิเสธ โดยอ้างว่ากำแพงสร้างอยู่ในแนวเขตที่ถูกต้อง

ช่างรังวัดจากกรมที่ดินได้ทำการรังวัดที่ดินเมื่อวันที่ 10 ตุลาคม 2567 และยืนยันว่าสิ่งปลูกสร้างรุกล้ำเข้ามาในที่ดินของนายสมพงษ์เป็นระยะ 2.8 เมตร

หลักฐานที่ยื่นประกอบด้วย โฉนดที่ดิน รายงานการรังวัด ภาพถ่ายสิ่งปลูกสร้างที่รุกล้ำ และบันทึกการติดต่อสื่อสารระหว่างคู่กรณีทั้งสองฝ่าย`,
  },

  // 10 — Hit-and-run
  {
    label: 'hit-and-run',
    en: `On 7 December 2024 at approximately 22:30, Mr. Amnaj Thongsri was struck by a pickup truck while crossing Chaeng Watthana Road near the Government Complex in Lak Si district, Bangkok. The driver of the vehicle did not stop and fled the scene.

Witnesses reported that the vehicle was a dark-colored Isuzu D-Max heading north toward Don Mueang. One witness managed to note a partial license plate number: 8ขX-XXXX.

Amnaj was found unconscious on the roadside by bystanders who called the emergency services. He was transported to Mongkutwattana General Hospital and was diagnosed with a fractured pelvis, a broken right arm, and multiple abrasions.

Traffic police from Lak Si Police Station arrived at the scene and collected evidence including paint fragments found on Amnaj's clothing and CCTV footage from the Government Complex security system.

As of the filing date, the suspect driver has not been identified. Amnaj's medical expenses have already exceeded 180,000 baht.`,
    th: `เมื่อวันที่ 7 ธันวาคม 2567 เวลาประมาณ 22.30 น. นายอำนาจ ทองศรี ถูกรถกระบะชนขณะเดินข้ามถนนแจ้งวัฒนา บริเวณใกล้ศูนย์ราชการเฉลิมพระเกียรติ เขตหลักสี่ กรุงเทพมหานคร โดยผู้ขับขี่ไม่หยุดรถและหลบหนีออกจากที่เกิดเหตุ

พยานในเหตุการณ์ให้ข้อมูลว่ารถคันดังกล่าวเป็นรถกระบะยี่ห้ออีซูซุ ดีแมกซ์ สีเข้ม มุ่งหน้าไปทางทิศเหนือในทิศทางดอนเมือง พยานรายหนึ่งจดหมายเลขทะเบียนได้บางส่วนคือ 8ขX-XXXX

นายอำนาจถูกพบหมดสติอยู่ข้างทางโดยผู้ที่อยู่ในบริเวณนั้น ซึ่งได้โทรแจ้งหน่วยกู้ชีพ และนำส่งโรงพยาบาลมงกุฎวัฒนะ แพทย์วินิจฉัยว่ากระดูกเชิงกรานหัก แขนขวาหัก และมีบาดแผลถลอกหลายแห่ง

เจ้าหน้าที่ตำรวจจราจรจากสถานีตำรวจนครบาลหลักสี่ได้ตรวจสอบที่เกิดเหตุและเก็บหลักฐาน ได้แก่ เศษสีรถที่พบบนเสื้อผ้าของนายอำนาจ และภาพจากกล้องวงจรปิดของระบบรักษาความปลอดภัยศูนย์ราชการ

ณ วันที่ยื่นรายงาน ยังไม่สามารถระบุตัวผู้ขับขี่ที่ต้องสงสัยได้ ค่ารักษาพยาบาลของนายอำนาจเกินกว่า 180,000 บาทแล้ว`,
  },
];

// Build flat export: { case1en, case1th, case2en, ... }
const exported: Record<string, string> = {};
cases.forEach((c, i) => {
  const n = i + 1;
  exported[`case${n}en`] = normalize(c.en);
  exported[`case${n}th`] = normalize(c.th);
});

export { cases };
export default exported;
