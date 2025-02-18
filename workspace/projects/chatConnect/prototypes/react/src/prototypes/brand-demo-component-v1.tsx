import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const BrandIdentityDemo = () => {
  const products = [
    {
      name: "Panel",
      connectName: "Connect",
      description: "Gestão operacional unificada",
      color: "bg-blue-500"
    },
    {
      name: "Chat",
      connectName: "Connect",
      description: "Comunicação integrada",
      color: "bg-pink-500"
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Color Palette */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Paleta de Cores</h2>
        <div className="flex gap-4">
          {/* Primary Colors */}
          <div className="space-y-2">
            <div className="h-16 w-16 bg-blue-500 rounded-lg shadow-lg" />
            <div className="h-16 w-16 bg-blue-600 rounded-lg shadow-lg" />
            <div className="h-16 w-16 bg-blue-700 rounded-lg shadow-lg" />
          </div>
          {/* Secondary Colors */}
          <div className="space-y-2">
            <div className="h-16 w-16 bg-pink-500 rounded-lg shadow-lg" />
            <div className="h-16 w-16 bg-pink-600 rounded-lg shadow-lg" />
            <div className="h-16 w-16 bg-pink-700 rounded-lg shadow-lg" />
          </div>
          {/* Neutral Colors */}
          <div className="space-y-2">
            <div className="h-16 w-16 bg-gray-800 rounded-lg shadow-lg" />
            <div className="h-16 w-16 bg-gray-600 rounded-lg shadow-lg" />
            <div className="h-16 w-16 bg-gray-400 rounded-lg shadow-lg" />
          </div>
        </div>
      </div>

      {/* Product Logos */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        {products.map((product) => (
          <Card key={product.name} className="bg-white">
            <CardHeader>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-800">{product.name}</span>
                <span className={`text-2xl font-bold ml-2 text-blue-500`}>
                  {product.connectName}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{product.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Typography Examples */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Tipografia</h2>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">Título Principal</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Subtítulo</h2>
          <p className="text-base text-gray-600">Texto de corpo com fonte Inter Regular</p>
          <p className="text-sm text-gray-500">Texto de suporte com fonte Inter Light</p>
        </div>
      </div>

      {/* UI Elements */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Elementos UI</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Botão Primário
          </button>
          <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
            Botão Secundário
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Botão Terciário
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandIdentityDemo;