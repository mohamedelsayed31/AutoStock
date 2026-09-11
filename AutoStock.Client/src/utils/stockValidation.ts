export function validateStockOperation(
    quantity: number,
    operation: "in" | "out",
    currentQuantity: number
  ): string | null {
  
    if (
      !Number.isFinite(
        quantity
      )
    ) {
      return "Quantity is required.";
    }
  
  
    if (
      !Number.isInteger(
        quantity
      )
    ) {
      return "Quantity must be a whole number.";
    }
  
  
    if (
      quantity <= 0
    ) {
      return "Quantity must be greater than 0.";
    }
  
  
    if (
      operation === "out" &&
      quantity > currentQuantity
    ) {
      return (
        `Cannot remove ${quantity} units. ` +
        `Current stock is only ${currentQuantity}.`
      );
    }
  
  
    return null;
  }