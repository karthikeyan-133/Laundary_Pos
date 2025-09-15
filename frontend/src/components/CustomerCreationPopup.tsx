import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Customer } from '@/types/pos';

// Define the 7 UAE Emirates
const UAE_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah"
];

interface CustomerCreationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (customer: Customer) => void;
}

export function CustomerCreationPopup({ isOpen, onClose, onCreate }: CustomerCreationPopupProps) {
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    code: '',
    contactName: '',
    phone: '',
    email: '',
    place: '',
    emirate: ''
  });

  const handleChange = (field: keyof Customer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData as Customer);
    // Reset form
    setFormData({
      name: '',
      code: '',
      contactName: '',
      phone: '',
      email: '',
      place: '',
      emirate: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="code">Customer Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="Enter customer code"
              />
            </div>
            
            <div>
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleChange('contactName', e.target.value)}
                placeholder="Enter contact name"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Contact Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter contact number"
                type="tel"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email address"
                type="email"
              />
            </div>
            
            <div>
              <Label htmlFor="place">Place</Label>
              <Input
                id="place"
                value={formData.place}
                onChange={(e) => handleChange('place', e.target.value)}
                placeholder="Enter place"
              />
            </div>
            
            <div>
              <Label htmlFor="emirate">Emirate</Label>
              <Select value={formData.emirate} onValueChange={(value) => handleChange('emirate', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emirate" />
                </SelectTrigger>
                <SelectContent>
                  {UAE_EMIRATES.map((emirate) => (
                    <SelectItem key={emirate} value={emirate}>
                      {emirate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Customer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}