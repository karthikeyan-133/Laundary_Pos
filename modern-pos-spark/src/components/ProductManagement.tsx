import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState(''); // Add barcode state
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('');
    setSku('');
    setBarcode(''); // Reset barcode
    setStock('');
    setDescription('');
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleAddProduct = () => {
    if (!name || !price || !category || !sku || !barcode) { // Require barcode
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (including barcode)",
        variant: "destructive"
      });
      return;
    }

    onAddProduct({
      name,
      price: parseFloat(price),
      category,
      sku,
      barcode, // Add barcode
      stock: parseInt(stock) || 0,
      description
    });

    toast({
      title: "Product Added",
      description: `${name} has been added to the product list`
    });

    resetForm();
  };

  const handleEditProduct = () => {
    if (!editingProduct || !name || !price || !category || !sku || !barcode) { // Require barcode
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (including barcode)",
        variant: "destructive"
      });
      return;
    }

    onEditProduct({
      ...editingProduct,
      name,
      price: parseFloat(price),
      category,
      sku,
      barcode, // Update barcode
      stock: parseInt(stock) || 0,
      description
    });

    toast({
      title: "Product Updated",
      description: `${name} has been updated`
    });

    resetForm();
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setCategory(product.category);
    setSku(product.sku);
    setBarcode(product.barcode); // Load barcode
    setStock(product.stock.toString());
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
                      <Label htmlFor="price">Price (AED) <span className="text-destructive">*</span></Label>
                      <Input
                        id="price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beverages">Beverages</SelectItem>
                          <SelectItem value="Bakery">Bakery</SelectItem>
                          <SelectItem value="Food">Food</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU <span className="text-destructive">*</span></Label>
                      <Input
                        id="sku"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="Enter SKU"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode <span className="text-destructive">*</span></Label>
                      <Input
                        id="barcode"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Enter barcode"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="0"
                        min="0"
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
                          {product.category} • {product.sku}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {product.stock} in stock
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-primary">
                        AED {product.price.toFixed(2)}
                      </span>
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
                          onClick={() => onRemoveProduct(product.id)}
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