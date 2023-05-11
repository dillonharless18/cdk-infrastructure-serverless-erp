// constants used to create an instance of each seed entity
const urgentOrderStatusData = {
  tableName: "urgent_order_status",
  entityNames: ["Today", "Tomorrow", "This Week", "Not Urgent"],
};

const transportationRequestTypeData = {
  tableName: "transportation_request_type",
  entityNames: ["PO", "Item"],
};

const purchaseOrderStatusData = {
  tableName: "purchase_order_status",
  entityNames: [
    "OCR-Processed",
    "Needs Receiving",
    "Needs Transportation",
    "Received",
    "Returned",
  ],
};

const purchaseOrderItemStatusData = {
  tableName: "purchase_order_item_status",
  entityNames: [
    "OCR-Processed",
    "Needs Receiving",
    "Needs Transportation",
    "Received",
    "Returned",
  ],
};

const purchaseOrderRequestItemStatusData = {
  tableName: "purchase_order_request_item_status",
  entityNames: ["Requested", "Purchased", "Needs Procurement", "Deleted"],
};

const transportationRequestStatusData = {
  tableName: "transportation_request_status",
  entityNames: ["Open", "Assigned", "Complete", "Cancelled"],
};

const transportationTripStatusData = {
  tableName: "transportation_trip_status",
  entityNames: ["Assigned", "Complete", "Partial Complete", "Cancelled"],
};

const vehicleTypeData = {
  tableName: "vehicle_type",
  entityNames: [
    "Personal Vehicle",
    "Pickup Truck",
    "Van",
    "Rental Vehicle",
    "16' Truck",
    "26' Truck",
  ],
};
