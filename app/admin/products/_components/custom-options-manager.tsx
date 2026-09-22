import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Save, Type } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../../_services/product.service';

interface CustomOption {
  id?: string;
  label: string;
  type: string;
  is_required: boolean;
  max_length: number | null;
  choices: string[];
  sort_order: number;
}

export function CustomOptionsManager({ productId }: { productId: string }) {
  const [options, setOptions] = useState<CustomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState(5);

  const [isAdding, setIsAdding] = useState(false);
  const [newOption, setNewOption] = useState<CustomOption>({
    label: '',
    type: 'text',
    is_required: false,
    max_length: 40,
    choices: [],
    sort_order: 1
  });

  const loadOptions = async () => {
    setLoading(true);
    try {
      const res = await productService.getCustomOptions(productId);
      setOptions(res.data || []);
      setRemaining(res.meta?.remaining ?? (5 - (res.data?.length || 0)));
    } catch (e) {
      toast.error('Failed to load custom options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, [productId]);

  const handleCreate = async () => {
    if (!newOption.label) {
      toast.error('Label is required');
      return;
    }
    if (newOption.type === 'dropdown' && newOption.choices.length === 0) {
      toast.error('Dropdown requires at least one choice');
      return;
    }

    try {
      await productService.createCustomOption(productId, newOption);
      toast.success('Custom option added');
      setIsAdding(false);
      setNewOption({ label: '', type: 'text', is_required: false, max_length: 40, choices: [], sort_order: options.length + 2 });
      loadOptions();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to add option');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productService.deleteCustomOption(id);
      toast.success('Option deleted');
      loadOptions();
    } catch (e) {
      toast.error('Failed to delete option');
    }
  };

  if (loading) return <div>Loading custom options...</div>;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5"/> Custom Options</CardTitle>
            <CardDescription>
              Buyer-filled fields like "Engraving text". Max 5 per product. ({remaining} remaining)
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAdding(true)} 
            disabled={remaining <= 0 || isAdding}
          >
            <Plus className="h-4 w-4 mr-2"/> Add Field
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {options.map((opt) => (
            <div key={opt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-medium text-sm text-slate-900">{opt.label}</p>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                  <span className="capitalize px-1.5 py-0.5 bg-slate-100 rounded border">{opt.type}</span>
                  {opt.is_required ? <span className="text-amber-600">Required</span> : <span>Optional</span>}
                  {opt.type === 'text' && opt.max_length && <span>Max: {opt.max_length} chars</span>}
                </div>
                {opt.type === 'dropdown' && opt.choices?.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">Choices: {opt.choices.join(', ')}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDelete(opt.id!)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {options.length === 0 && !isAdding && (
            <div className="p-8 text-center text-slate-500 text-sm">
              No custom options added yet. Click "Add Field" to create one.
            </div>
          )}

          {isAdding && (
            <div className="p-4 bg-blue-50/50 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Field Label *</Label>
                  <Input 
                    value={newOption.label} 
                    onChange={e => setNewOption({...newOption, label: e.target.value})} 
                    placeholder="e.g. Engraving Text"
                  />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Field Type</Label>
                  <Select value={newOption.type} onValueChange={v => setNewOption({...newOption, type: v})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Input</SelectItem>
                      <SelectItem value="image">Image Upload</SelectItem>
                      <SelectItem value="dropdown">Dropdown Options</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="opt-req" 
                    checked={newOption.is_required} 
                    onCheckedChange={c => setNewOption({...newOption, is_required: c})} 
                  />
                  <Label htmlFor="opt-req">Required</Label>
                </div>
                
                {newOption.type === 'text' && (
                  <div className="flex items-center gap-2">
                    <Label>Max Length:</Label>
                    <Input 
                      type="number" min="1" max="1000" className="w-24 h-8"
                      value={newOption.max_length || ''} 
                      onChange={e => setNewOption({...newOption, max_length: e.target.value ? Number(e.target.value) : null})} 
                    />
                  </div>
                )}
              </div>

              {newOption.type === 'dropdown' && (
                <div className="space-y-2">
                  <Label>Dropdown Choices (Comma separated)</Label>
                  <Input 
                    value={newOption.choices.join(', ')} 
                    onChange={e => setNewOption({...newOption, choices: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                    placeholder="e.g. Option 1, Option 2, Option 3"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button size="sm" className="gap-2" onClick={handleCreate}>
                  <Save className="h-4 w-4"/> Save Field
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
