import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Package, 
  MapPin, 
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Search,
  Filter
} from 'lucide-react';

const DeliveryDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  
  // Dados simulados de entregas
  const deliveries = {
    pending: [
      {
        id: 1,
        orderNumber: '#1234',
        address: 'Rua Silva Só, 123 - Porto Alegre',
        customer: 'Maria Silva',
        phone: '(51) 99999-9999',
        time: '14:30',
        status: 'waiting_pickup'
      },
      // ... mais entregas
    ],
    inProgress: [
      {
        id: 2,
        orderNumber: '#1235',
        address: 'Av. Ipiranga, 1500 - Porto Alegre',
        customer: 'João Santos',
        phone: '(51) 98888-8888',
        time: '15:00',
        status: 'in_route',
        driver: 'Carlos Moto'
      }
    ]
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Entregas</h1>
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input className="pl-10" placeholder="Buscar por número do pedido, cliente..." />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button className="gap-2">
            <Truck className="h-4 w-4" />
            Nova Entrega
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Métricas */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-pink-500" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-500">Aguardando</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-gray-500">Em Rota</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">28</p>
                <p className="text-sm text-gray-500">Entregues Hoje</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-gray-500">Problemas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Entregas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Entregas Pendentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliveries.pending.map(delivery => (
                <Card key={delivery.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{delivery.orderNumber}</span>
                        <Badge variant="outline">{delivery.status === 'waiting_pickup' ? 'Aguardando Retirada' : 'Em Rota'}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        {delivery.address}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Atribuir Motoboy</Button>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {delivery.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {delivery.time}
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Painel Lateral */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Motoboys Ativos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Carlos Moto</p>
                    <p className="text-sm text-gray-500">3 entregas em rota</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Mais motoboys aqui */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;