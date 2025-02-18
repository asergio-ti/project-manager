import React from 'react';
import { Camera } from 'lucide-react';

const LoginPage = () => {
  const handleGoogleLogin = () => {
    // Na implementação real, aqui seria feita a integração com o Google OAuth
    console.log('Iniciando login com Google');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Camera className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ChatConnect</h1>
          <p className="text-gray-600 mt-2">Plataforma de Comunicação Empresarial</p>
        </div>

        {/* Botão de Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          <img 
            src="/api/placeholder/24/24" 
            alt="Google logo" 
            className="w-6 h-6"
          />
          Entrar com Google
        </button>

        {/* Informações Adicionais */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Utilize sua conta Google corporativa</p>
          <p className="mt-4">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Termos de Serviço
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;