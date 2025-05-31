import { prisma } from "@/configs/prisma.js";

export async function getCustomerDetails({ identifier }) {
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { email: identifier },
        { name: { contains: identifier, mode: "insensitive" } },
      ],
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  return customer;
}

export async function updateCustomerName({ id, newName }) {
  const customer = await prisma.customer.update({
    where: { id },
    data: { name: newName },
  });

  return customer;
}

export async function updateCustomerEmail({ id, newEmail }) {
  const customer = await prisma.customer.update({
    where: { id },
    data: { email: newEmail },
  });

  return customer;
}

export async function updateCustomerPhone({ id, newPhone }) {
  const customer = await prisma.customer.update({
    where: { id },
    data: { phone: newPhone },
  });

  return customer;
}

/**
 * Erstellt ein neues Support-Ticket für einen Kunden.
 */
export async function createSupportTicket({ customer_id, subject }) {
  const lastTicket = await prisma.supportTicket.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  const nextId = (lastTicket?.id || 0) + 1;
  const ticketNumber = `T${nextId.toString().padStart(3, "0")}`;

  const ticket = await prisma.supportTicket.create({
    data: {
      customer_id,
      subject,
      status: "open",
      ticket_number: ticketNumber,
    },
  });

  return ticket;
}

/**
 * Holt alle Tickets für einen bestimmten Kunden.
 */
export async function getSupportTickets({ customer_id }) {
  const tickets = await prisma.supportTicket.findMany({
    where: { customer_id },
    orderBy: { id: "desc" },
  });

  return tickets;
}

/**
 * Aktualisiert den Status eines Support-Tickets.
 */
export async function updateSupportTicketStatus({ ticket_id, status }) {
  const ticket = await prisma.supportTicket.update({
    where: { id: ticket_id },
    data: { status },
  });

  return ticket;
}

export async function getTicketByNumber({ ticket_number }) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { ticket_number },
  });

  if (!ticket) throw new Error("Ticket not found");

  return ticket;
}
