export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * (taxRate / 100);
}

export function calculateDiscount(originalPrice: number, discountPercentage: number): number {
  return originalPrice * (discountPercentage / 100);
}

export function calculateItemTotal(price: number, quantity: number, discountPercentage: number = 0): number {
  const subtotal = price * quantity;
  const discount = calculateDiscount(subtotal, discountPercentage);
  return subtotal - discount;
}

export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}

export function generateSKU(category: string, name: string): string {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const nameCode = name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${categoryCode}${nameCode}${random}`;
}