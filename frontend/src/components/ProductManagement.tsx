import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Product } from '@/types/pos';
import { useToast } from '@/hooks/use-toast';

interface ProductManagementProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onRemoveProduct: (productId: string) => void;
}

export function ProductManagement({
  products,
  onAddProduct,
  onEditProduct,
  onRemoveProduct
}: ProductManagementProps) {
  const { toast } = useToast();
  
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [ironRate, setIronRate] = useState('');
  const [washAndIronRate, setWashAndIronRate] = useState('');
  const [dryCleanRate, setDryCleanRate] = useState('');
  const [category, setCategory] = useState('');
  const [barcode, setBarcode] = useState(''); // Add barcode state
  const [description, setDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const resetForm = () => {
    setName('');
    setIronRate('');
    setWashAndIronRate('');
    setDryCleanRate('');
    setCategory('');
    setBarcode(''); // Reset barcode
    setDescription('');
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleAddProduct = async () => {
    if (!name || !ironRate || !washAndIronRate || !dryCleanRate || !category || !barcode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (including all service rates and barcode)",
        variant: "destructive"
      });
      return;
    }

    // Validate that rates are valid numbers
    const ironRateNum = parseFloat(ironRate);
    const washAndIronRateNum = parseFloat(washAndIronRate);
    const dryCleanRateNum = parseFloat(dryCleanRate);

    if (isNaN(ironRateNum) || isNaN(washAndIronRateNum) || isNaN(dryCleanRateNum)) {
      toast({
        title: "Validation Error",
        description: "All rate values must be valid numbers",
        variant: "destructive"
      });
      return;
    }

    try {
      const newProduct = {
        name,
        ironRate: ironRateNum,
        washAndIronRate: washAndIronRateNum,
        dryCleanRate: dryCleanRateNum,
        category,
        barcode,
        description
      };

      console.log('Sending product data to API:', newProduct);
      await onAddProduct(newProduct);

      toast({
        title: "Product Added",
        description: `${name} has been added to the product list`
      });

      resetForm();
    } catch (error: any) {
      console.error('Error adding product:', error);
      // Provide more detailed error information
      const errorMessage = error.message || "Failed to add product. Please try again.";
      const errorDetails = error.details ? `Details: ${error.details}` : '';
      const errorHint = error.hint ? `Hint: ${error.hint}` : '';
      
      toast({
        title: "Error",
        description: `${errorMessage} ${errorDetails} ${errorHint}`,
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !name || !ironRate || !washAndIronRate || !dryCleanRate || !category || !barcode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (including all service rates and barcode)",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedProduct = {
        ...editingProduct,
        name,
        ironRate: parseFloat(ironRate),
        washAndIronRate: parseFloat(washAndIronRate),
        dryCleanRate: parseFloat(dryCleanRate),
        category,
        barcode,
        description
      };

      await onEditProduct(updatedProduct);

      toast({
        title: "Product Updated",
        description: `${name} has been updated`
      });

      resetForm();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      await onRemoveProduct(productId);
      toast({
        title: "Product Removed",
        description: "Product has been removed successfully"
      });
    } catch (error: any) {
      console.error('Error removing product:', error);
      // Provide more specific error handling for deletion issues
      let errorMessage = error.message || "Failed to remove product. Please try again.";
      if (errorMessage.includes('referenced in existing')) {
        errorMessage = 'Cannot delete this product because it is referenced in existing orders or returns. To remove this product, you would need to first delete all related orders and returns.';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setIronRate(product.ironRate.toString());
    setWashAndIronRate(product.washAndIronRate.toString());
    setDryCleanRate(product.dryCleanRate.toString());
    setCategory(product.category);
    setBarcode(product.barcode); // Load barcode
    setDescription(product.description || '');
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Product Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Product</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </DialogTitle>
                </DialogHeader>
                
                {/* Product Form */}
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Clothing">Clothing</SelectItem>
                          <SelectItem value="Household">Household</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ironRate">Iron Rate (AED) <span className="text-destructive">*</span></Label>
                      <Input
                        id="ironRate"
                        type="number"
                        value={ironRate}
                        onChange={(e) => setIronRate(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="washAndIronRate">Wash & Iron Rate (AED) <span className="text-destructive">*</span></Label>
                      <Input
                        id="washAndIronRate"
                        type="number"
                        value={washAndIronRate}
                        onChange={(e) => setWashAndIronRate(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dryCleanRate">Dry Clean Rate (AED) <span className="text-destructive">*</span></Label>
                      <Input
                        id="dryCleanRate"
                        type="number"
                        value={dryCleanRate}
                        onChange={(e) => setDryCleanRate(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode <span className="text-destructive">*</span></Label>
                      <Input
                        id="barcode"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Enter barcode"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter product description"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={editingProduct ? handleEditProduct : handleAddProduct} 
                      className="flex-1"
                    >
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                    {editingProduct && (
                      <Button 
                        variant="outline" 
                        onClick={resetForm} 
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Product List */}
          <div className="space-y-4">
            <h3 className="font-medium">Existing Products ({products.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <Card key={product.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Iron:</span>
                          <span className="font-medium">AED {product.ironRate.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wash & Iron:</span>
                          <span className="font-medium">AED {product.washAndIronRate.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dry Clean:</span>
                          <span className="font-medium">AED {product.dryCleanRate.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveProduct(product.id)}
                          className="text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {product.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {product.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}