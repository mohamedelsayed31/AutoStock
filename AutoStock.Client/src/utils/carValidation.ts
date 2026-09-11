export interface CarFormValues {
    model: string;
  
    year: number;
  
    price: number;
  
    quantity?: number;
  
    reorderLevel: number;
  
    color: string;
  
    fuelType: string;
  
    transmission: string;
  
    brandId: number;
  
    categoryId: number;
  
    supplierId: number;
  }
  
  
  export function validateCarForm(
    values: CarFormValues
  ): string | null {
  
    const currentYear =
      new Date()
        .getFullYear();
  
  
    if (
      !values.model.trim()
    ) {
      return (
        "Model is required."
      );
    }
  
  
    if (
      values.model.trim()
        .length < 2
    ) {
      return (
        "Model must contain at least 2 characters."
      );
    }
  
  
    if (
      values.year < 1900 ||
      values.year >
        currentYear + 1
    ) {
      return (
        `Year must be between 1900 and ${currentYear + 1}.`
      );
    }
  
  
    if (
      !Number.isFinite(
        values.price
      ) ||
      values.price <= 0
    ) {
      return (
        "Price must be greater than 0."
      );
    }
  
  
    if (
      values.quantity !==
        undefined &&
      (
        !Number.isInteger(
          values.quantity
        ) ||
        values.quantity < 0
      )
    ) {
      return (
        "Quantity must be a non-negative whole number."
      );
    }
  
  
    if (
      !Number.isInteger(
        values.reorderLevel
      ) ||
      values.reorderLevel < 0
    ) {
      return (
        "Reorder level must be a non-negative whole number."
      );
    }
  
  
    if (
      !values.color.trim()
    ) {
      return (
        "Color is required."
      );
    }
  
  
    if (
      !values.fuelType
    ) {
      return (
        "Fuel type is required."
      );
    }
  
  
    if (
      !values.transmission
    ) {
      return (
        "Transmission is required."
      );
    }
  
  
    if (
      values.brandId <= 0
    ) {
      return (
        "Brand is required."
      );
    }
  
  
    if (
      values.categoryId <= 0
    ) {
      return (
        "Category is required."
      );
    }
  
  
    if (
      values.supplierId <= 0
    ) {
      return (
        "Supplier is required."
      );
    }
  
  
    return null;
  }