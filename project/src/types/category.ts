export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  parentId?: string; // For subcategories
  children?: Category[]; // For hierarchical structure
}

export interface CategoryFormData {
  id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
}
