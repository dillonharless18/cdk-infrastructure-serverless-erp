exports.getPoLineItemComments = async (event) => {
    // Your logic to fetch PO Line Item comments from the database
  
    const purchaseOrderId = event.pathParameters.purchaseOrderId;
    const lineItemId = event.pathParameters.lineItemId;
  
    // Replace with your actual function to fetch comments
    const comments = await fetchComments(purchaseOrderId, lineItemId);
  
    const response = {
      statusCode: 200,
      body: JSON.stringify(comments),
    };
  
    return response;
  };
  
  // Replace this with your actual function to fetch comments from the database
  async function fetchComments(purchaseOrderId, lineItemId) {
    // Sample data
    return [
      {
        purchaseOrderId,
        lineItemId,
        comment: 'Sample comment 1',
      },
      {
        purchaseOrderId,
        lineItemId,
        comment: 'Sample comment 2',
      },
    ];
  }
  