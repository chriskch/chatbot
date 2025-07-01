import { testContext } from "./testContext";
import {
  getCustomerDetails,
  updateCustomerEmail,
  updateCustomerName,
  updateCustomerPhone,
  createSupportTicket,
  getSupportTickets,
  updateSupportTicketStatus,
} from "@/lib/functions/crm";
import { prisma } from "@/configs/prisma";
import { describe, it, expect } from "vitest";

describe("CRM Module", () => {
  const customerId = () => testContext.customerId;
  if (!customerId) {
    throw new Error("❌ customerId ist nicht gesetzt. Setup ist kaputt!");
  }
  const customerEmail = "kunde@example.com";

  // 🔍 getCustomerDetails
  it("findet Kunden anhand von E-Mail", async () => {
    const result = await getCustomerDetails({
      identifier: customerEmail,
    });
    expect(result).not.toBeNull();
    expect(result.email).toBe(customerEmail);
  });

  it("findet Kunden anhand von Namen (unscharf)", async () => {
    const result = await getCustomerDetails({ identifier: "Mustermann" });
    expect(result).not.toBeNull();
    expect(result.name).toContain("Mustermann");
  });

  it("wirft Fehler, wenn Kunde nicht existiert", async () => {
    await expect(getCustomerDetails({ identifier: "notfound@example.com" })).rejects.toThrow(
      "Customer not found",
    );
  });

  // ✏️ updateCustomerName
  it("aktualisiert den Kundennamen", async () => {
    const updated = await updateCustomerName({
      id: customerId(),
      newName: "Customer Bot",
    });

    expect(updated).not.toBeNull();
    expect(updated.name).toBe("Customer Bot");

    // Datenbank prüfen
    const dbCustomer = await prisma.customer.findUnique({ where: { id: customerId() } });
    expect(dbCustomer.name).toBe("Customer Bot");
  });

  // ✏️ updateCustomerEmail
  it("aktualisiert die E-Mail-Adresse", async () => {
    const updated = await updateCustomerEmail({
      id: customerId(),
      newEmail: "customer@bot.com",
    });

    expect(updated).not.toBeNull();
    expect(updated.email).toBe("customer@bot.com");
  });

  // ✏️ updateCustomerPhone
  it("aktualisiert die Telefonnummer", async () => {
    const updated = await updateCustomerPhone({
      id: customerId(),
      newPhone: "555-123",
    });

    expect(updated).not.toBeNull();
    expect(updated.phone).toBe("555-123");
  });

  // 🆘 createSupportTicket
  it("erstellt ein neues Support-Ticket", async () => {
    const ticket = await createSupportTicket({
      customer_id: customerId(),
      subject: "Meine Bestellung kam nicht an",
    });

    expect(ticket).toMatchObject({
      customer_id: customerId(),
      subject: "Meine Bestellung kam nicht an",
      status: "open",
    });

    const dbTicket = await prisma.supportTicket.findUnique({ where: { id: ticket.id } });
    expect(dbTicket).not.toBeNull();
    expect(dbTicket.subject).toBe("Meine Bestellung kam nicht an");
  });

  // 📋 getSupportTickets (nutzt Seed plus neue Tickets)
  it("lädt alle Support-Tickets eines Kunden (inkl. Seed)", async () => {
    // Zwei neue Tickets anlegen
    await createSupportTicket({
      customer_id: customerId(),
      subject: "Test 1",
    });
    await createSupportTicket({
      customer_id: customerId(),
      subject: "Test 2",
    });

    const tickets = await getSupportTickets({ customer_id: customerId() });

    // 2 aus dem Seed + 2 neue = 4
    expect(tickets.length).toBe(4);

    const subjects = tickets.map((t) => t.subject);
    expect(subjects).toContain("Probleme mit der Bestellung");
    expect(subjects).toContain("Produkt defekt");
    expect(subjects).toContain("Test 1");
    expect(subjects).toContain("Test 2");
  });

  // 🔄 updateSupportTicketStatus
  it("ändert den Status eines Support-Tickets", async () => {
    const ticket = await createSupportTicket({
      customer_id: customerId(),
      subject: "Problem",
    });

    const updated = await updateSupportTicketStatus({
      ticket_id: ticket.id,
      status: "closed",
    });

    expect(updated.status).toBe("closed");

    const dbTicket = await prisma.supportTicket.findUnique({ where: { id: ticket.id } });
    expect(dbTicket.status).toBe("closed");
  });
});
