// constants used to create an instance of each seed entity
const constants = [
  {
    tableName: "urgent_order_status",
    entityNames: ["Today", "Tomorrow", "This Week", "Not Urgent"],
  },

  {
    tableName: "transportation_request_type",
    entityNames: ["PO", "Item"],
  },

  {
    tableName: "purchase_order_status",
    entityNames: [
      "OCR-Processed",
      "Needs Receiving",
      "Needs Transportation",
      "Received",
      "Returned",
    ],
  },

  {
    tableName: "purchase_order_item_status",
    entityNames: [
      "OCR-Processed",
      "Needs Receiving",
      "Needs Transportation",
      "Received",
      "Returned",
    ],
  },

  {
    tableName: "purchase_order_request_item_status",
    entityNames: ["Requested", "Purchased", "Needs Procurement", "Deleted"],
  },

  {
    tableName: "transportation_request_status",
    entityNames: ["Open", "Assigned", "Complete", "Cancelled"],
  },

  {
    tableName: "transportation_trip_status",
    entityNames: ["Assigned", "Complete", "Partial Complete", "Cancelled"],
  },

  {
    tableName: "vehicle_type",
    entityNames: [
      "Personal Vehicle",
      "Pickup Truck",
      "Van",
      "Rental Vehicle",
      "16' Truck",
      "26' Truck",
    ],
  },
];

export default constants;