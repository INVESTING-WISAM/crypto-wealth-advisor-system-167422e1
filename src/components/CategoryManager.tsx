
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

const CategoryManager = ({ currentUser }: { currentUser: string }) => {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Trading Basics', description: 'Fundamental trading concepts', color: 'bg-blue-500' },
    { id: '2', name: 'Technical Analysis', description: 'Chart analysis and indicators', color: 'bg-green-500' },
    { id: '3', name: 'Trading Strategies', description: 'Advanced trading strategies', color: 'bg-purple-500' },
    { id: '4', name: 'Market Analysis', description: 'Market trends and analysis', color: 'bg-orange-500' }
  ]);

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: 'bg-blue-500'
  });

  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const colorOptions = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-red-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'
  ];

  useEffect(() => {
    const savedCategories = localStorage.getItem(`video_categories_${currentUser}`);
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`video_categories_${currentUser}`, JSON.stringify(categories));
  }, [categories, currentUser]);

  const addCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      description: newCategory.description,
      color: newCategory.color
    };

    setCategories([...categories, category]);
    setNewCategory({ name: '', description: '', color: 'bg-blue-500' });
    toast.success('Category added successfully');
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
    toast.success('Category deleted');
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category.id);
    setNewCategory({
      name: category.name,
      description: category.description,
      color: category.color
    });
  };

  const updateCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setCategories(categories.map(cat => 
      cat.id === editingCategory 
        ? { ...cat, name: newCategory.name, description: newCategory.description, color: newCategory.color }
        : cat
    ));

    setEditingCategory(null);
    setNewCategory({ name: '', description: '', color: 'bg-blue-500' });
    toast.success('Category updated successfully');
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setNewCategory({ name: '', description: '', color: 'bg-blue-500' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Management</CardTitle>
        <CardDescription>Manage video categories for content organization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add/Edit Category Form */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Category Name</Label>
              <Input
                placeholder="e.g., Advanced Strategies"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <Input
                placeholder="Brief description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full ${color} ${
                      newCategory.color === color ? 'ring-2 ring-gray-800' : ''
                    }`}
                    onClick={() => setNewCategory({ ...newCategory, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {editingCategory ? (
              <>
                <Button onClick={updateCategory}>Update Category</Button>
                <Button variant="outline" onClick={cancelEditing}>Cancel</Button>
              </>
            ) : (
              <Button onClick={addCategory}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            )}
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-2">
          <h3 className="font-semibold">Existing Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${category.color}`} />
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => startEditing(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteCategory(category.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
