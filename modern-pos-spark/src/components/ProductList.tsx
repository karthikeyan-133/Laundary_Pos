import React, { useState, useCallback, useEffect } from 'react';
import { Search, Plus, Package, ScanLine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BarcodeScanner } from '@/components/BarcodeScanner'; // Add barcode scanner
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
  onAddToCart: (product: Product) => void;
  onSearch: (query: string) => Product[];
}

export function ProductList({ products, onAddToCart, onSearch }: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  
  // Handle scanned barcode
  const handleBarcodeScan = (barcode: string) => {
    // Search for product by SKU (barcode)
    const foundProduct = products.find(product => product.sku === barcode);
    
    if (foundProduct) {
      onAddToCart(foundProduct);
      toast({
        title: "Product Added",
        description: `${foundProduct.name} has been added to cart`
      });
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

        {/* Barcode Scanner (only shown in development) */}
        {process.env.NODE_ENV === 'development' && isScanning && (
          <div className="relative">
            <BarcodeScanner onScan={handleBarcodeScan} />
          </div>
        )}
        
        {/* Development tools (only shown in development) */}
        {process.env.NODE_ENV === 'development' && !isScanning && (
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => handleBarcodeScan('BEV001')}
            >
              Scan Coffee
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => handleBarcodeScan('BAK001')}
            >
              Scan Croissant
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => handleBarcodeScan('FOD001')}
            >
              Scan Sandwich
            </Button>
          </div>
        )}
        
        {/* Categories */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              className="cursor-pointer hover:bg-primary-hover transition-colors capitalize"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
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
        <div className="grid grid-cols-3 gap-4">
          {finalProducts.map((product) => (
            <Card 
              key={product.id}
              className="group hover:shadow-medium transition-all duration-200 cursor-pointer bg-card border-border"
              onClick={() => onAddToCart(product)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {product.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-primary">
                        AED {product.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        SKU: {product.sku} • Barcode: {product.barcode} • Stock: {product.stock}
                      </div>
                    </div>

                    <Button 
                      size="sm"
                      className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}