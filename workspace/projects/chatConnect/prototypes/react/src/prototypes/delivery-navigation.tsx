import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Map, Navigation, Route, AlertTriangle, Package, Clock, 
  List, Maximize, Minimize, RotateCcw, MoveLeft, MoveRight,
  Plus, Minus
} from 'lucide-react';

const DeliveryNavigation = () => {
  const [viewMode, setViewMode] = useState('map');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraRotation, setCameraRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  
  // Dados simulados de entregas
  const [deliveries] = useState([
    { id: 1, address: 'Rua das Flores, 123', status: 'in_progress', eta: '10 min', distance: '2.3 km', coords: {x: 100, y: 150} },
    { id: 2, address: 'Av. Principal, 456', status: 'pending', eta: '25 min', distance: '5.1 km', coords: {x: 300, y: 200} },
    { id: 3, address: 'Rua do Comércio, 789', status: 'pending', eta: '40 min', distance: '8.7 km', coords: {x: 500, y: 180} }
  ]);

  const MapView = () => (
    <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <svg viewBox="0 0 800 600" className="w-full h-full">
        {/* Grid de fundo */}
        <rect width="800" height="600" fill="#1a1a1a"/>
        
        {/* Rota entre pontos */}
        <path 
          d={`M${deliveries[0].coords.x},${deliveries[0].coords.y} 
              L${deliveries[1].coords.x},${deliveries[1].coords.y} 
              L${deliveries[2].coords.x},${deliveries[2].coords.y}`}
          stroke="#4a90e2" 
          strokeWidth="3"
          fill="none"
          strokeDasharray="5,5"
        />
        
        {/* Pontos de entrega */}
        {deliveries.map((delivery, index) => (
          <g key={delivery.id}>
            <circle 
              cx={delivery.coords.x} 
              cy={delivery.coords.y} 
              r="8"
              fill={delivery.status === 'in_progress' ? '#10b981' : '#6b7280'}
            />
            <text
              x={delivery.coords.x}
              y={delivery.coords.y + 20}
              fill="white"
              fontSize="12"
              textAnchor="middle"
            >
              {index + 1}
            </text>
          </g>
        ))}

        {/* Localização atual */}
        <circle 
          cx={deliveries[0].coords.x} 
          cy={deliveries[0].coords.y} 
          r="10" 
          fill="#ef4444"
        />
      </svg>

      {/* Legenda */}
      <div className="absolute top-4 left-4 bg-black/50 p-2 rounded text-white text-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500"/>
          <span>Em andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500"/>
          <span>Pendente</span>
        </div>
      </div>

      {/* Botão de tela cheia */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
      >
        {isFullscreen ? <Minimize className="h-4 w-4"/> : <Maximize className="h-4 w-4"/>}
      </Button>
    </div>
  );

  const ThreeDView = () => (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'h-96'} bg-gray-900 rounded-lg overflow-hidden`}>
      <svg viewBox="0 0 800 600" className="w-full h-full">
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a237e"/>
            <stop offset="100%" stopColor="#3949ab"/>
          </linearGradient>
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#37474f"/>
            <stop offset="100%" stopColor="#263238"/>
          </linearGradient>
        </defs>
        
        <g transform={`rotate(${cameraRotation} 400 300)`}>
          {/* Céu */}
          <rect width="800" height="300" fill="url(#skyGradient)"/>
          
          {/* Prédios */}
          <g>
            {[0,1,2,3,4].map((i) => (
              <rect
                key={i}
                x={150 + i * 120}
                y={100 + Math.sin(i) * 30}
                width="80"
                height={150 + Math.cos(i) * 20}
                fill="#1a237e"
                opacity={0.8 - Math.abs(cameraRotation) * 0.01}
              />
            ))}
          </g>
          
          {/* Estrada */}
          <path 
            d="M0,300 L800,300 L600,600 L200,600 Z" 
            fill="url(#roadGradient)"
          />
          
          {/* Faixas da estrada */}
          {[1,2,3,4].map((i) => (
            <rect
              key={i}
              x="390"
              y={350 + i * 50}
              width="20"
              height="30"
              fill="white"
              opacity={0.8 - i * 0.15}
            />
          ))}
        </g>

        {/* HUD - sempre frontal */}
        <g>
          <circle cx="100" cy="500" r="40" fill="rgba(0,0,0,0.5)"/>
          <text x="85" y="505" fill="white" fontSize="20">45</text>
          <text x="80" y="520" fill="white" fontSize="12">km/h</text>
        </g>
      </svg>

      {/* Controles de rotação */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setCameraRotation(r => Math.max(r - 5, -45))}
          className="bg-black/50 hover:bg-black/70 text-white"
        >
          <MoveLeft className="h-4 w-4"/>
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setCameraRotation(r => Math.min(r + 5, 45))}
          className="bg-black/50 hover:bg-black/70 text-white"
        >
          <MoveRight className="h-4 w-4"/>
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setCameraRotation(0)}
          className="bg-black/50 hover:bg-black/70 text-white"
        >
          <RotateCcw className="h-4 w-4"/>
        </Button>
      </div>

      {/* Botão de tela cheia */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
      >
        {isFullscreen ? <Minimize className="h-4 w-4"/> : <Maximize className="h-4 w-4"/>}
      </Button>

      {/* Info de navegação */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 p-4 rounded-lg text-white text-center">
        <div className="text-lg">Siga em frente por 200m</div>
        <div className="text-sm">Vire à direita na Rua das Flores</div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 p-4 ${isFullscreen ? 'h-screen overflow-hidden' : ''}`}>
      {!isFullscreen && (
        <>
          {/* Barra superior com informações */}
          <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg text-white">
            <div className="flex items-center gap-4">
              <Package className="h-6 w-6"/>
              <div>
                <div className="text-sm">Próxima entrega</div>
                <div className="font-bold">{deliveries[0].address}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="h-6 w-6"/>
              <div>
                <div className="text-sm">Tempo estimado</div>
                <div className="font-bold">{deliveries[0].eta}</div>
              </div>
            </div>
          </div>

          {/* Botões de modo de visualização */}
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              className="flex gap-2"
            >
              <Map className="h-4 w-4"/>
              Mapa
            </Button>
            <Button 
              variant={viewMode === '3d' ? 'default' : 'outline'}
              onClick={() => setViewMode('3d')}
              className="flex gap-2"
            >
              <Navigation className="h-4 w-4"/>
              Navegação 3D
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="flex gap-2"
            >
              <List className="h-4 w-4"/>
              Lista
            </Button>
          </div>
        </>
      )}

      {/* Área principal de visualização */}
      {viewMode === 'map' && <MapView />}
      {viewMode === '3d' && <ThreeDView />}
      
      {!isFullscreen && (
        <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg text-white">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5"/>
            <span>{deliveries.length} entregas pendentes</span>
          </div>
          <Button variant="destructive" className="flex gap-2">
            <AlertTriangle className="h-4 w-4"/>
            Reportar Problema
          </Button>
        </div>
      )}
    </div>
  );
};

export default DeliveryNavigation;