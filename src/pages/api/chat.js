import { openai } from "@/configs/openai";
import { functions } from "@/lib/functions";
import * as crm from "@/lib/functions/crm";
import * as oms from "@/lib/functions/oms";
import * as pms from "@/lib/functions/pms";
import * as payment from "@/lib/functions/payment";

import dotenv from "dotenv";
dotenv.config(); // muss ganz am Anfang stehen!

const functionMap = {
  getCustomerDetails: crm.getCustomerDetails,
  updateCustomerName: crm.updateCustomerName,
  updateCustomerEmail: crm.updateCustomerEmail,
  updateCustomerPhone: crm.updateCustomerPhone,
  createSupportTicket: crm.createSupportTicket,
  getSupportTickets: crm.getSupportTickets,
  updateSupportTicketStatus: crm.updateSupportTicketStatus,
  getTicketByNumber: crm.getTicketByNumber,

  createOrder: oms.createOrder,
  getOrderStatus: oms.getOrderStatus,
  cancelOrder: oms.cancelOrder,
  getOrdersByCustomer: oms.getOrdersByCustomer,
  getOrderByNumber: oms.getOrderByNumber,

  getProductDetails: pms.getProductDetails,
  listProductsByCategory: pms.listProductsByCategory,

  getPaymentStatus: payment.getPaymentStatus,
  refundPayment: payment.refundPayment,
};

function containsSQLInjection(obj) {
  const sqlPattern = /(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b|\bSELECT\b|\bUNION\b|--|#|;|'|"|`)/i;

  const checkValue = (val) => {
    if (typeof val === "string") return sqlPattern.test(val);
    if (typeof val === "object" && val !== null)
      return Object.values(val).some(checkValue);
    return false;
  };

  return checkValue(obj);
}


function validateToken(req) {
  const validToken = process.env.AUTH_TOKEN;
  const token = req.headers["authorization"];
  return token === validToken;
}


export default async function handler(req, res) {
  const { messages, onlyUnderstand = false, customer } = req.body;



  if (!validateToken(req)) {
    return res.status(200).json({
      status: "reply",
      reply: "Zugriff verweigert: Ungültiger Token.",
    });
  }


  try {
    if (!customer) {
      return res.status(200).json({
        status: "reply",
        reply:
          "Bitte wähle zuerst einen Nutzer aus, bevor du mit dem Chatbot interagierst.",
      });
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_API_MODEL || "gpt-4-0613",
      messages,
      functions,
      function_call: "auto",
    });

    const message = response.choices[0]?.message;
    const fc = message?.function_call;

    // 1. GPT schlägt Function Call vor
    if (fc) {
      const { name, arguments: args } = fc;
      const parsedArgs = JSON.parse(args);

      console.log("Function Call:", fc?.name, fc?.arguments);

      if (onlyUnderstand) {
        return res.status(200).json({
          status: "function_call",
          intent: name,
          parameters: parsedArgs,
        });
      }

      const fn = functionMap[name];
      if (!fn) throw new Error(`Unknown function: ${name}`);

      if (containsSQLInjection(parsedArgs)) {
        console.log("Sicherheitsprüfung aktiv – args:", parsedArgs);

        return res.status(400).json({
          status: "blocked",
          reply: "Deine Eingabe enthält potenziell schädlichen SQL-Code und wurde blockiert.",
        });
      }

      // 🧠 Füge userId direkt in die Funktionsargumente ein (optional)
      const functionResult = await fn({
        ...parsedArgs,
        customerId: customer.id,
      });

      // 3. GPT um Antwort bitten
      const final = await openai.chat.completions.create({
        model: process.env.OPENAI_API_MODEL || "gpt-4-0613",
        messages: [
          ...messages,
          { role: "assistant", content: null, function_call: fc },
          { role: "function", name, content: JSON.stringify(functionResult) },
        ],
      });

      return res.status(200).json({
        status: "reply",
        reply: final.choices[0].message.content,
      });
    }

    // 4. GPT hat direkt geantwortet (z. B. Rückfrage)
    return res.status(200).json({
      status: "reply",
      reply: message?.content || "Ich konnte leider nichts erkennen.",
    });
  } catch (error) {
    console.error("Chat handler error:", error);
    return res.status(500).json({ error: error.message });
  }
}
