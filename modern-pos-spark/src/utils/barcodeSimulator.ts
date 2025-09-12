/**
 * Utility function to simulate barcode scanning for testing purposes
 * This is useful for development and testing when a real barcode scanner is not available
 */

export class BarcodeSimulator {
  private static instance: BarcodeSimulator;
  private isSimulating = false;
  private simulationSpeed = 50; // ms between key presses

  private constructor() {}

  static getInstance(): BarcodeSimulator {
    if (!BarcodeSimulator.instance) {
      BarcodeSimulator.instance = new BarcodeSimulator();
    }
    return BarcodeSimulator.instance;
  }

  /**
   * Simulate scanning a barcode by dispatching key events
   * @param barcode The barcode to simulate scanning
   */
  simulateScan(barcode: string): void {
    if (this.isSimulating) return;
    
    this.isSimulating = true;
    
    // Split barcode into individual characters
    const characters = barcode.split('');
    
    // Dispatch keydown events for each character
    let index = 0;
    const dispatchNext = () => {
      if (index < characters.length) {
        const char = characters[index];
        const event = new KeyboardEvent('keydown', {
          key: char,
          bubbles: true
        });
        window.dispatchEvent(event);
        index++;
        setTimeout(dispatchNext, this.simulationSpeed);
      } else {
        // Dispatch Enter key to complete the scan
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true
        });
        window.dispatchEvent(enterEvent);
        this.isSimulating = false;
      }
    };
    
    dispatchNext();
  }

  /**
   * Simulate scanning one of the sample products
   * @param productId The ID of the product to simulate (1-10)
   */
  simulateProductScan(productId: string): void {
    // For sample products, we'll use their SKU as the barcode
    const skus: Record<string, string> = {
      '1': 'BEV001',
      '2': 'BAK001',
      '3': 'FOD001',
      '4': 'BEV002',
      '5': 'BAK002',
      '6': 'FOD002',
      '7': 'BEV003',
      '8': 'BAK003',
      '9': 'FOD003',
      '10': 'BEV004'
    };
    
    const sku = skus[productId];
    if (sku) {
      this.simulateScan(sku);
    } else {
      console.warn(`Product with ID ${productId} not found`);
    }
  }
}

// Export a singleton instance
export const barcodeSimulator = BarcodeSimulator.getInstance();