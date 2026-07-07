import { Smsir } from "smsir-js";

type SmsIrResponse = {
  data?: {
    status?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

const getSmsClient = () => {
  const apiKey = (process.env.SMS_IR_API_KEY || process.env.smskey || "").trim();
  const lineNumber = Number(process.env.SMS_IR_LINE_NUMBER?.trim());

  if (!apiKey || Number.isNaN(lineNumber)) {
    throw new Error("SMS.ir configuration is incomplete");
  }

  return new Smsir(apiKey, lineNumber);
};

export async function sendVerificationCode(phone: string, code: string) {
  console.log(`[OTP] ${phone} -> ${code}`);

  try {
    const templateId = Number(process.env.SMS_IR_TEMPLATE_ID?.trim());

    if (Number.isNaN(templateId)) {
      console.log("[SMS.ir] SMS_IR_TEMPLATE_ID is not configured; skipped SMS send.");
      return true;
    }

    const smsir = getSmsClient();
    const result = (await smsir.SendVerifyCode(phone, templateId, [
      { name: "CODE", value: code },
    ])) as SmsIrResponse;

    console.log("[SMS.ir] verify-code result:", result);
    return result.data?.status === 1;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "SMS.ir configuration is incomplete"
    ) {
      console.log("[SMS.ir] configuration is incomplete; skipped SMS send.");
      return true;
    }

    if (typeof error === "object" && error && "response" in error) {
      const response = (error as { response?: { status?: number; data?: unknown } })
        .response;
      console.log("SMS send response:", {
        status: response?.status,
        data: response?.data,
      });
    }

    console.log(
      "SMS send error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return false;
  }
}

export async function sendOrderConfirmationSMS(phone: string, customerName: string, orderId: string) {
  try {
    const smsir = getSmsClient();
    const templateId = parseInt(process.env.SERVICE_SMS!);
    
    // Truncate customer name to max 20 characters
    const truncatedName = customerName.length > 20 ? customerName.substring(0, 20) : customerName;
    
    // Generate shorter order ID (max 20 characters)
    const shortOrderId = generateShortOrderId(orderId);
    
    const result = await smsir.SendVerifyCode(phone, templateId, [
      { name: 'CustomerName', value: truncatedName },
      { name: 'ORDERID', value: shortOrderId }
    ]);
    
    console.log('SMS send result:', result);
    return result.data?.status === 1;
  } catch (error: unknown) {
    console.log('Order SMS send error:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export function generateShortOrderId(fullOrderId: string): string {
  // Extract timestamp from order ID (e.g., "SERVICE-WALLET-1729693200000" or "HOZORI-1729693200000")
  const timestampMatch = fullOrderId.match(/\d{13}/);
  
  if (timestampMatch) {
    // Use last 10 digits of timestamp
    const timestamp = timestampMatch[0].slice(-10);
    
    // Determine prefix based on order type
    let prefix = 'ORD';
    if (fullOrderId.includes('WALLET')) prefix = 'WAL';
    else if (fullOrderId.includes('HOZORI')) prefix = 'HOZ';
    else if (fullOrderId.includes('SERVICE')) prefix = 'SRV';
    else if (fullOrderId.includes('LOTTERY')) prefix = 'LOT';
    
    // Format: PREFIX-TIMESTAMP (e.g., "SRV-9693200000" = 14 chars max)
    return `${prefix}-${timestamp}`;
  }
  
  // Fallback: use last 15 characters of order ID
  return fullOrderId.slice(-15);
}

export async function sendStatusUpdateSMS(phone: string, customerName: string, orderName: string) {
  try {
    const smsir = getSmsClient();
    const templateId = parseInt(process.env.TICKET_SMS_TEMPLATE!);
    
    // Truncate customer name to max 20 characters
    const truncatedName = customerName.length > 20 ? customerName.substring(0, 20) : customerName;
    
    // Truncate order name to max 30 characters
    const truncatedOrderName = orderName.length > 30 ? orderName.substring(0, 30) : orderName;
    
    const result = await smsir.SendVerifyCode(phone, templateId, [
      { name: 'CUSTOMERNAME', value: truncatedName },
      { name: 'ORDERNAME', value: truncatedOrderName }
    ]);
    
    console.log('Status update SMS send result:', result);
    return result.data?.status === 1;
  } catch (error: unknown) {
    console.log('Status update SMS send error:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
