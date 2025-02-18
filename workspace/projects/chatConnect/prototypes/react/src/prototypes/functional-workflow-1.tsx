import React, { useState, ChangeEvent } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { 
  ShoppingBag, 
  Package, 
  Truck,
  CheckCircle,
  Search,
  Filter,
  MapPin,
  Store,
  Clock,
  AlertCircle,
  Phone,
  MessageSquare,
  User
} from 'lucide-react';

interface Motoboy {
  id: number;
  name: string;
  status: string;
  deliveries: number;
}

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onConfirm: (data: { type: string; data: any }) => void;
  type: 'motoboy' | 'correios' | 'pickup' | null;
}

interface Order {
  id: number;
  number: string;
  customer: string;
  address: string;
  phone: string;
  total: number;
  date: string;
  delivery_method: 'motoboy' | 'correios' | 'pickup';
  shipping_cost: number;
  status: string;
  actions: Array<{ type: string; label: string }>;
}

type OrderStatus = 'NOVO' | 'SEPARANDO' | 'SEPARADO' | 'EM_ROTA' | 'CONCLUIDO';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: number, newStatus: OrderStatus, data: any) => void;
}

const ShippingModal: React.FC<ShippingModalProps> = ({ isOpen, onClose, order, onConfirm, type }) => {
  const [selectedMotoboy, setSelectedMotoboy] = useState<Motoboy | null>(null);
  const [trackingCode, setTrackingCode] = useState('');

  const motoboys: Motoboy[] = [
    { id: 1, name: 'João Silva', status: 'Disponível', deliveries: 3 },
    { id: 2, name: 'Pedro Santos', status: 'Disponível', deliveries: 1 },
    { id: 3, name: 'Maria Oliveira', status: 'Disponível', deliveries: 2 }
  ];

  const handleConfirm = () => {
    if (type === 'motoboy') {
      onConfirm({ type: 'motoboy', data: selectedMotoboy });
    } else if (type === 'correios') {
      onConfirm({ type: 'correios', data: trackingCode });
    } else {
      onConfirm({ type: 'pickup', data: null });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'motoboy' && 'Atribuir Motoboy'}
            {type === 'correios' && 'Registrar Código de Rastreio'}
            {type === 'pickup' && 'Confirmar Disponível para Retirada'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {type === 'motoboy' && (
            <div className="space-y-3">
              {motoboys.map((motoboy) => (
                <div
                  key={motoboy.id}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    selectedMotoboy?.id === motoboy.id ? 'border-pink-500 bg-pink-50' : ''
                  }`}
                  onClick={() => setSelectedMotoboy(motoboy)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{motoboy.name}</div>
                      <div className="text-sm text-gray-500">{motoboy.deliveries} entregas hoje</div>
                    </div>
                    <Badge>{motoboy.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {type === 'correios' && (
            <Input
              placeholder="Digite o código de rastreio"
              value={trackingCode}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTrackingCode(e.target.value)}
            />
          )}

          {type === 'pickup' && (
            <div className="space-y-3">
              <div className="text-sm">
                Local de Retirada: <span className="font-medium">Loja Principal</span>
              </div>
              <div className="text-sm text-gray-500">
                O cliente será notificado que o pedido está disponível para retirada.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleConfirm}
            disabled={
              (type === 'motoboy' && !selectedMotoboy) ||
              (type === 'correios' && !trackingCode)
            }
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const getNextActions = (status: string, deliveryMethod: string) => {
  switch (status) {
    case 'NOVO':
      return [{ type: 'SEPARANDO', label: 'Iniciar Separação', icon: Package }];
    case 'SEPARANDO':
      return [{ type: 'SEPARADO', label: 'Finalizar Separação', icon: CheckCircle }];
    case 'SEPARADO':
      return [{ type: 'EM_ROTA', label: 'Iniciar Entrega', icon: Truck }];
    case 'EM_ROTA':
      return [{ type: 'CONCLUIDO', label: 'Concluir Entrega', icon: CheckCircle }];
    default:
      return [];
  }
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus }) => {
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingType, setShippingType] = useState<'motoboy' | 'correios' | 'pickup' | null>(null);

  const handleStatusChange = (newStatus: string) => {
    onUpdateStatus(order.id, newStatus as OrderStatus, {});
  };

  const handleShippingConfirm = (data: { type: string; data: any }) => {
    onUpdateStatus(order.id, 'EM_ROTA', data);
  };

  const availableActions = getNextActions(order.status, order.delivery_method);

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">#{order.number}</span>
              <Badge variant={
                order.delivery_method === 'correios' ? 'default' :
                order.delivery_method === 'motoboy' ? 'secondary' : 'outline'
              }>
                {order.delivery_method === 'correios' ? 'Correios' :
                 order.delivery_method === 'motoboy' ? 'Motoboy' : 'Retirada'}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">{order.customer}</div>
          </div>
          <div className="text-right">
            <div className="font-medium">R$ {order.total.toFixed(2)}</div>
            <div className="text-sm text-gray-500">{order.date}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            {order.address}
          </div>
          {order.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              {order.phone}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Truck className="h-4 w-4" />
            Frete: R$ {order.shipping_cost.toFixed(2)}
          </div>
        </div>
        
        {/* Ações disponíveis para o status atual */}
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div className="flex gap-2">
            {availableActions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                onClick={() => handleStatusChange(action.type)}
                className="gap-2"
              >
                {action.icon && <action.icon className="h-4 w-4" />}
                {action.label}
              </Button>
            ))}
          </div>
          
          <Button variant="ghost" size="sm">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>

        {/* Seção de Entrega */}
        {order.status === 'SEPARADO' && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium mb-3">Método de Entrega</div>
            {order.delivery_method === 'motoboy' && (
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  setShippingType('motoboy');
                  setShowShippingModal(true);
                }}
              >
                <Truck className="h-4 w-4 mr-2" />
                Atribuir Motoboy
              </Button>
            )}

            {order.delivery_method === 'correios' && (
              <Button 
                className="w-full"
                onClick={() => {
                  setShippingType('correios');
                  setShowShippingModal(true);
                }}
              >
                Registrar Código de Rastreio
              </Button>
            )}

            {order.delivery_method === 'pickup' && (
              <Button 
                className="w-full"
                onClick={() => {
                  setShippingType('pickup');
                  setShowShippingModal(true);
                }}
              >
                <Store className="h-4 w-4 mr-2" />
                Confirmar Disponível
              </Button>
            )}
          </div>
        )}

        {/* Modal de Envio */}
        <ShippingModal
          isOpen={showShippingModal}
          onClose={() => setShowShippingModal(false)}
          order={order}
          type={shippingType}
          onConfirm={handleShippingConfirm}
        />
      </CardContent>
    </Card>
  );
};

type OrderState = {
  [key: string]: Order[];
};

const WorkflowDashboard: React.FC = () => {
  const [orders, setOrders] = useState<OrderState>({
    NOVO: [
      {
        id: 1,
        number: '1234',
        customer: 'Maria Silva',
        address: 'Rua Silva Só, 123 - Porto Alegre',
        phone: '(51) 99999-9999',
        total: 250.00,
        date: '30/01 14:30',
        delivery_method: 'motoboy',
        shipping_cost: 15.00,
        status: 'NOVO',
        actions: [
          { type: 'start_separation', label: 'Iniciar Separação' }
        ]
      },
      {
        id: 2,
        number: '1235',
        customer: 'João Santos',
        address: 'Av. Ipiranga, 1500 - Porto Alegre',
        phone: '(51) 98888-8888',
        total: 175.50,
        date: '30/01 15:00',
        delivery_method: 'correios',
        shipping_cost: 25.00,
        status: 'NOVO',
        actions: [
          { type: 'start_separation', label: 'Iniciar Separação' }
        ]
      }
    ],
    SEPARANDO: [],
    SEPARADO: [],
    EM_ROTA: [],
    CONCLUIDO: []
  });

  const handleUpdateStatus = (orderId: number, newStatus: OrderStatus, additionalData: Record<string, any> = {}) => {
    setOrders(prevOrders => {
      const updatedOrders = { ...prevOrders };
      let orderToMove: Order | undefined;
      let currentStatus: string | undefined;

      // Encontrar o pedido e seu status atual
      Object.entries(prevOrders).forEach(([status, orderList]) => {
        const foundOrder = orderList.find(o => o.id === orderId);
        if (foundOrder) {
          orderToMove = foundOrder;
          currentStatus = status;
        }
      });

      if (!orderToMove || !currentStatus) return prevOrders;

      // Atualizar o pedido
      const updatedOrder: Order = {
        ...orderToMove,
        status: newStatus,
        ...additionalData
      };

      // Remover do status atual
      updatedOrders[currentStatus] = prevOrders[currentStatus]
        .filter((o: Order) => o.id !== orderId);

      // Adicionar ao novo status
      if (!updatedOrders[newStatus]) {
        updatedOrders[newStatus] = [];
      }
      
      updatedOrders[newStatus] = [
        ...(updatedOrders[newStatus] || []),
        updatedOrder
      ];

      return updatedOrders;
    });
  };

  return (
    <div className="p-6">
      {/* Header com métricas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <ShoppingBag className="h-8 w-8 text-pink-500" />
            <div>
              <div className="text-2xl font-bold">{Object.values(orders).flat().length}</div>
              <div className="text-sm text-gray-500">Pedidos Ativos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <Package className="h-8 w-8 text-orange-500" />
            <div>
              <div className="text-2xl font-bold">{orders.SEPARANDO.length}</div>
              <div className="text-sm text-gray-500">Em Separação</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <Truck className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{orders.EM_ROTA.length}</div>
              <div className="text-sm text-gray-500">Em Entrega</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm text-gray-500">Atenção</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de ferramentas */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input className="pl-10" placeholder="Buscar pedido, cliente ou endereço..." />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Grid do Workflow */}
      <div className="grid grid-cols-5 gap-6">
        {Object.entries(orders).map(([status, statusOrders]) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {status === 'NOVO' && <ShoppingBag className="h-5 w-5 text-pink-500" />}
                {status === 'SEPARANDO' && <Package className="h-5 w-5 text-orange-500" />}
                {status === 'SEPARADO' && <Package className="h-5 w-5 text-blue-500" />}
                {status === 'EM_ROTA' && <Truck className="h-5 w-5 text-green-500" />}
                {status === 'CONCLUIDO' && <CheckCircle className="h-5 w-5 text-gray-500" />}
                <h3 className="font-medium">
                  {status.replace('_', ' ')}
                </h3>
              </div>
              <Badge variant="secondary">{statusOrders.length}</Badge>
            </div>

            <div className="space-y-4">
              {statusOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowDashboard;