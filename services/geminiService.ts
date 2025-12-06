import { GoogleGenAI, Type, Schema } from "@google/genai";

const getClient = () => {
  // Check if API key is available
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateReportAnalysis = async (dataContext: string): Promise<string> => {
  const client = getClient();
  if (!client) return "عذراً، مفتاح API غير متوفر لتحليل البيانات.";

  try {
    const prompt = `
      بصفتك مستشاراً مالياً خبيراً، قم بتحليل البيانات المالية التالية لنظام محاسبي.
      البيانات بتنسيق JSON:
      ${dataContext}

      المطلوب:
      1. قدم ملخصاً تنفيذياً للأداء المالي باللغة العربية.
      2. حدد نقاط القوة والضعف (مثل المنتجات الأكثر ربحية أو العهد المفتوحة لفترة طويلة).
      3. قدم توصيات لتحسين الكفاءة وتقليل التكاليف.
      
      اجعل الرد منسقاً وسهل القراءة وموجهاً لمدير الشركة. لا تستخدم Markdown في العناوين بشكل مفرط.
    `;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "لم يتم استلام رد من النظام الذكي.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "حدث خطأ أثناء تحليل البيانات بواسطة الذكاء الاصطناعي.";
  }
};

export interface ExtractedInvoiceData {
  invoiceNumber?: string;
  date?: string;
  supplierName?: string;
  taxNumber?: string;
  currency?: string;
  items?: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export const analyzeInvoiceImage = async (base64Image: string, mimeType: string): Promise<ExtractedInvoiceData | null> => {
  const client = getClient();
  if (!client) return null;

  try {
    const prompt = `
      Role: Expert Data Entry Specialist for Saudi Accounting System.
      Task: Extract data from the invoice image into strict JSON.

      **PRIORITY 1: INVOICE NUMBER (رقم الفاتورة)**
      - You MUST extract the Invoice Number.
      - Look for labels: "Invoice No", "Inv No", "Bill No", "رقم الفاتورة", "فاتورة رقم", "الرقم التسلسلي", "Serial No", "Reference", "Ref No".
      - If "Invoice No" is not found, look for "Order No" or "Request No".
      - **CRITICAL**: The Invoice Number is usually a short integer (e.g., 1024, 5501) or alphanumeric (e.g., INV-2024-001).
      - **NEGATIVE CONSTRAINT**: 
        - DO NOT return the VAT Number (Starts with 3, 15 digits).
        - DO NOT return the Phone Number (Starts with 05, 966, 9200).
        - DO NOT return the CR Number (Sijil/ست).
      - **Clean the value**: Remove symbols like "#" or "No.". Return the value only.

      **PRIORITY 2: SUPPLIER & DATES**
      - **Supplier Name**: Extract the full company name in Arabic.
      - **Date**: YYYY-MM-DD.
      - **Tax Number**: 15 digits starting with 3.

      **PRIORITY 3: LINE ITEMS**
      - Extract Description (Arabic preferred).
      - Quantity (Number).
      - **Unit Price**: 
        - YOU MUST RETURN THE PRICE **BEFORE TAX**.
        - If the invoice says "Inclusive of VAT" or "شامل الضريبة", **DIVIDE the price by 1.15**.
        - Example: If item price is 115 (Inc VAT), return 100.

      **DATA CLEANING**:
      - Convert Arabic numerals (١ ٢ ٣) to English (1 2 3).
    `;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            invoiceNumber: { type: Type.STRING, description: "The unique invoice number (NOT tax number)" },
            date: { type: Type.STRING, description: "Invoice date in YYYY-MM-DD format" },
            supplierName: { type: Type.STRING, description: "Name of the supplier in Arabic" },
            taxNumber: { type: Type.STRING, description: "Tax identification number (15 digits)" },
            currency: { type: Type.STRING, description: "Currency code e.g. SAR" },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING, description: "Item name in Arabic" },
                  quantity: { type: Type.NUMBER, description: "Quantity of the item" },
                  unitPrice: { type: Type.NUMBER, description: "Price per unit BEFORE tax (divide by 1.15 if inclusive)" }
                }
              }
            }
          }
        }
      }
    });

    let jsonText = response.text;
    if (!jsonText) return null;

    // Clean Markdown code blocks if present (Model sometimes adds them despite MIME type)
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonText) as ExtractedInvoiceData;

  } catch (error) {
    console.error("Gemini Invoice Analysis Error:", error);
    return null;
  }
};