import React, { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    company: string;
    phone: string;
  };
  role?: {
    role: 'admin' | 'user';
  };
}

interface UserFormProps {
  user?: User;
  onSubmit: (data: any) => Promise<boolean>;
  onCancel?: () => void;
  loading?: boolean;
}

const UserForm = memo(({ user, onSubmit, onCancel, loading = false }: UserFormProps) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    full_name: user?.profile?.full_name || '',
    company: user?.profile?.company || '',
    phone: user?.profile?.phone || '',
    role: user?.role?.role || 'user'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    const success = await onSubmit(formData);
    if (success && onCancel) {
      onCancel();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
          disabled={loading}
        />
      </div>
      
      <div>
        <Label htmlFor="full_name">Nome Completo</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => handleInputChange('full_name', e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <Label htmlFor="company">Empresa</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => handleInputChange('company', e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <Label htmlFor="role">Função</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => handleInputChange('role', value)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Cliente</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processando...
            </div>
          ) : (
            user ? 'Atualizar' : 'Criar'
          )} Usuário
        </Button>
        
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
});

UserForm.displayName = 'UserForm';

export default UserForm;