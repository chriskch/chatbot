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
  const ticket = await prisma.supportTicket.create({
    data: {
      customer_id,
      subject,
      status: "open",
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
