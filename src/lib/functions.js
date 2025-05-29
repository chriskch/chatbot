export const functions = [
  // CRM
  {
    name: "getCustomerDetails",
    description: "Finds customer info by name or email",
    parameters: {
      type: "object",
      properties: {
        identifier: { type: "string", description: "Email or name" },
      },
      required: ["identifier"],
    },
  },
  {
    name: "updateCustomerName",
    description: "Updates the name of a customer by ID or email",
    parameters: {
      type: "object",
      properties: {
        id: { type: "number" },
        newName: { type: "string" },
      },
      required: ["id", "newName"],
    },
  },
  {
    name: "updateCustomerEmail",
    description: "Updates the email of a customer by ID or email",
    parameters: {
      type: "object",
      properties: {
        id: { type: "number" },
        newEmail: { type: "string" },
      },
      required: ["id", "newEmail"],
    },
  },
  {
    name: "updateCustomerPhone",
    description: "Updates the phone number of a customer by ID or email",
    parameters: {
      type: "object",
      properties: {
        id: { type: "number" },
        newPhone: { type: "string" },
      },
      required: ["id", "newPhone"],
    },
  },
  {
    name: "createSupportTicket",
    description: "Creates a new support ticket for a customer",
    parameters: {
      type: "object",
      properties: {
        customer_id: { type: "number" },
        subject: { type: "string" },
      },
      required: ["customer_id", "subject"],
    },
  },
  {
    name: "getSupportTickets",
    description: "Gets all support tickets for a customer",
    parameters: {
      type: "object",
      properties: {
        customer_id: { type: "number" },
      },
      required: ["customer_id"],
    },
  },
  {
    name: "updateSupportTicketStatus",
    description: "Updates the status of a support ticket",
    parameters: {
      type: "object",
      properties: {
        ticket_id: { type: "number" },
        status: {
          type: "string",
          enum: ["open", "in_progress", "resolved", "closed"],
        },
      },
      required: ["ticket_id", "status"],
    },
  },

  // OMS
  {
    name: "createOrder",
    description: "Places a new order for a customer",
    parameters: {
      type: "object",
      properties: {
        customer_id: { type: "number" },
        product_ids: {
          type: "array",
          items: { type: "number" },
        },
      },
      required: ["customer_id", "product_ids"],
    },
  },
  {
    name: "getOrderStatus",
    description: "Gets the current status of an order",
    parameters: {
      type: "object",
      properties: {
        order_id: { type: "number" },
      },
      required: ["order_id"],
    },
  },
  {
    name: "cancelOrder",
    description: "Cancels an existing order",
    parameters: {
      type: "object",
      properties: {
        order_id: { type: "number" },
      },
      required: ["order_id"],
    },
  },
  {
    name: "getOrdersByCustomer",
    description: "Lists all orders for a specific customer",
    parameters: {
      type: "object",
      properties: {
        customer_id: { type: "number" },
      },
      required: ["customer_id"],
    },
  },

  // PMS
  {
    name: "getProductDetails",
    description: "Gets product information such as price, stock, name",
    parameters: {
      type: "object",
      properties: {
        product_id: { type: "number" },
      },
      required: ["product_id"],
    },
  },
  {
    name: "listProductsByCategory",
    description: "Lists products in a specific category",
    parameters: {
      type: "object",
      properties: {
        category: { type: "string" },
      },
      required: ["category"],
    },
  },

  // Payment
  {
    name: "getPaymentStatus",
    description: "Returns the payment status for a specific order",
    parameters: {
      type: "object",
      properties: {
        order_id: {
          type: "number",
          description: "ID of the order",
        },
      },
      required: ["order_id"],
    },
  },
  {
    name: "refundPayment",
    description: "Refunds a payment for a given order",
    parameters: {
      type: "object",
      properties: {
        order_id: {
          type: "number",
          description: "ID of the paid order to refund",
        },
      },
      required: ["order_id"],
    },
  },
];
