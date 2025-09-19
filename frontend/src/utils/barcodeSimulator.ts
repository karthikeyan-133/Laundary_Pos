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
    // For sample products, we'll use their barcode
    const barcodes: Record<string, string> = {
      '1': 'CL001',
      '2': 'CL002',
      '3': 'CL003',
      '4': 'CL004',
      '5': 'CL005',
      '6': 'HH001',
      '7': 'HH002',
      '8': 'HH003',
      '9': 'HH004',
      '10': 'CL006'
    };
    
    const barcode = barcodes[productId];
    if (barcode) {
      this.simulateScan(barcode);
    } else {
      console.warn(`Product with ID ${productId} not found`);
    }
  }
}

// Export a singleton instance
export const barcodeSimulator = BarcodeSimulator.getInstance();