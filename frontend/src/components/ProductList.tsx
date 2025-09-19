import React, { useState, useCallback, useEffect } from 'react';
import { Search, Plus, Package, ScanLine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BarcodeScanner } from '@/components/BarcodeScanner'; // Add barcode scanner
import { ServiceSelectionPopup } from '@/components/ServiceSelectionPopup'; // Import service selection popup
import { Product } from '@/types/pos';

// Define the type for the barcode simulator
interface BarcodeSimulator {
  simulateProductScan: (productId: string) => void;
}

// Only import simulator in development
let barcodeSimulator: BarcodeSimulator | null = null;
if (process.env.NODE_ENV === 'development') {
  import('@/utils/barcodeSimulator').then((module) => {
    barcodeSimulator = module.barcodeSimulator;
  });
}

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product, service: 'iron' | 'washAndIron' | 'dryClean', quantity: number) => void;
  onSearch: (query: string) => Product[];
  onAddProduct?: () => void; // Add this new prop
}

export function ProductList({ products, onAddToCart, onSearch, onAddProduct }: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // For service selection popup
  const [isServicePopupOpen, setIsServicePopupOpen] = useState(false); // For service selection popup
  const { toast } = useToast();
  
  // Debug: Log products when they change
  useEffect(() => {
    console.log('Products received in ProductList:', products);
    if (products.length > 0) {
      console.log('First product details:', products[0]);
    }
  }, [products]);
  
  // Handle scanned barcode
  const handleBarcodeScan = (barcode: string) => {
    // Search for product by barcode
    const foundProduct = products.find(product => product.barcode === barcode);
    
    if (foundProduct) {
      // Open service selection popup instead of directly adding to cart
      setSelectedProduct(foundProduct);
      setIsServicePopupOpen(true);
    } else {
      toast({
        title: "Product Not Found",
        description: `No product found with barcode ${barcode}`,
        variant: "destructive"
      });
    }
  };
  
  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  // Simulate barcode scans for testing (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && barcodeSimulator) {
      // Example: Simulate scanning product with SKU 'BEV001' after 3 seconds
      const timer = setTimeout(() => {
        // Uncomment the following line to simulate a scan
        // barcodeSimulator.simulateProductScan('1');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const filteredProducts = searchQuery 
    ? onSearch(searchQuery)
    : products;

  const finalProducts = selectedCategory === 'all' 
    ? filteredProducts
    : filteredProducts.filter(p => p.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Function to simulate scanning a product (for testing)
  const simulateScan = (productId: string) => {
    if (process.env.NODE_ENV === 'development' && barcodeSimulator) {
      barcodeSimulator.simulateProductScan(productId);
    }
  };

  // Handle product click to open service selection popup
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsServicePopupOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products or scan barcode..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 h-11 bg-card border-border focus:ring-primary"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-11 w-11"
            onClick={isScanning ? stopScanning : startScanning}
          >
            <ScanLine className="h-5 w-5" />
          </Button>
        </div>

        {/* Category Filter Dropdown and Add Product Button */}
        <div className="flex gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-border bg-card rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <Button 
            variant="default" 
            size="sm"
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
            onClick={onAddProduct}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        </div>

        {/* Barcode Scanner (only shown in development) */}
        {process.env.NODE_ENV === 'development' && isScanning && (
          <div className="relative">
            <BarcodeScanner onScan={handleBarcodeScan} />
          </div>
        )}
      </div>

      {/* Products Grid */}
      {finalProducts.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No products found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="px-4">
          <div className="grid grid-cols-5 gap-3 max-h-[70vh] overflow-y-auto">
            {finalProducts.map((product) => (
              <Card 
                key={product.id}
                className="group hover:shadow-medium transition-all duration-200 cursor-pointer bg-card border-border p-3 min-h-[100px]"
                onClick={() => handleProductClick(product)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors text-sm truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {product.description || product.barcode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        Category: {product.category}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Barcode: {product.barcode}
                      </div>
                    </div>
                  </div>

                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Service Selection Popup */}
      <ServiceSelectionPopup
        product={selectedProduct}
        isOpen={isServicePopupOpen}
        onClose={() => {
          setIsServicePopupOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}