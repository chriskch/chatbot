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

describe("CRM-Funktionen", () => {
  let customer;

  beforeEach(async () => {
    customer = await prisma.customer.findUnique({
      where: { id: globalThis.testCustomerId },
    });

    await prisma.supportTicket.deleteMany();
  });

  afterEach(async () => {
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        name: "Besteller Bot",
        email: "besteller@example.com",
        phone: "123456789",
      },
    });
  });

  // 🔍 getCustomerDetails
  it("findet Kunden anhand von E-Mail", async () => {
    const result = await getCustomerDetails({
      identifier: "besteller@example.com",
    });
    expect(result.email).toBe("besteller@example.com");
  });

  it("findet Kunden anhand von Namen (unscharf)", async () => {
    const result = await getCustomerDetails({ identifier: "bot" });
    expect(result.name).toContain("Bot");
  });

  it("wirft Fehler, wenn Kunde nicht existiert", async () => {
    await expect(
      getCustomerDetails({ identifier: "notfound@example.com" })
    ).rejects.toThrow("Customer not found");
  });

  // ✏️ updateCustomerName
  it("aktualisiert den Kundennamen", async () => {
    const updated = await updateCustomerName({
      id: customer.id,
      newName: "Customer Bot",
    });
    expect(updated.name).toBe("Customer Bot");
  });

  // ✏️ updateCustomerEmail
  it("aktualisiert die E-Mail-Adresse", async () => {
    const updated = await updateCustomerEmail({
      id: customer.id,
      newEmail: "customer@bot.com",
    });
    expect(updated.email).toBe("customer@bot.com");
  });

  // ✏️ updateCustomerPhone
  it("aktualisiert die Telefonnummer", async () => {
    const updated = await updateCustomerPhone({
      id: customer.id,
      newPhone: "555-123",
    });
    expect(updated.phone).toBe("555-123");
  });

  // 🆘 createSupportTicket
  it("erstellt ein neues Support-Ticket", async () => {
    const ticket = await createSupportTicket({
      customer_id: customer.id,
      subject: "Meine Bestellung kam nicht an",
    });

    expect(ticket).toMatchObject({
      customer_id: customer.id,
      subject: "Meine Bestellung kam nicht an",
      status: "open",
    });
  });

  // 📋 getSupportTickets
  it("lädt alle Support-Tickets eines Kunden", async () => {
    await createSupportTicket({
      customer_id: customer.id,
      subject: "Test 1",
    });
    await createSupportTicket({
      customer_id: customer.id,
      subject: "Test 2",
    });

    const tickets = await getSupportTickets({ customer_id: customer.id });
    expect(tickets.length).toBe(2);
    expect(tickets[0].subject).toBe("Test 2"); // neuste zuerst
  });

  // 🔄 updateSupportTicketStatus
  it("ändert den Status eines Support-Tickets", async () => {
    const ticket = await createSupportTicket({
      customer_id: customer.id,
      subject: "Problem",
    });

    const updated = await updateSupportTicketStatus({
      ticket_id: ticket.id,
      status: "closed",
    });
    expect(updated.status).toBe("closed");
  });
});
