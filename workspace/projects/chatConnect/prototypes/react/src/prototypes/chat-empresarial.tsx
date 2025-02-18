import React, { useState } from 'react';
import { MessageSquare, Building2, Users, ChevronRight, ChevronDown, User } from 'lucide-react';

// Dados simulados
const contatos = [
  {
    tipo: 'pessoal',
    id: 1,
    nome: 'João Silva',
    foto: null,
    ultimaMensagem: 'Oi, tudo bem?',
    horario: '12:30'
  },
  {
    tipo: 'empresa',
    id: 2,
    nome: 'Tech Corp',
    expandido: false,
    setores: [
      {
        id: 1,
        nome: 'Suporte',
        expandido: false,
        conversas: [
          { 
            id: 1, 
            titulo: 'Chamado #123', 
            ultimaMensagem: 'Pode me ajudar com isso?', 
            horario: '16:58',
            mensagens: [
              { id: 1, texto: 'Olá, estou com um problema no sistema', minha: true, horario: '16:55' },
              { id: 2, texto: 'Pode me descrever melhor o problema?', minha: false, horario: '16:57' },
              { id: 3, texto: 'Pode me ajudar com isso?', minha: true, horario: '16:58' }
            ]
          }
        ]
      },
      {
        id: 2,
        nome: 'Vendas',
        expandido: false,
        conversas: [
          { id: 2, titulo: 'Orçamento Sistema', ultimaMensagem: 'Aguardo retorno', horario: '15:30' }
        ]
      }
    ]
  }
];

export default function ChatEmpresarial() {
  const [dados, setDados] = useState(contatos);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState([]);

  const toggleEmpresa = (empresaId) => {
    setDados(dados.map(item => {
      if (item.tipo === 'empresa' && item.id === empresaId) {
        return { ...item, expandido: !item.expandido };
      }
      return item;
    }));
  };

  const toggleSetor = (empresaId, setorId) => {
    setDados(dados.map(item => {
      if (item.tipo === 'empresa' && item.id === empresaId) {
        const setores = item.setores.map(setor => {
          if (setor.id === setorId) {
            return { ...setor, expandido: !setor.expandido };
          }
          return setor;
        });
        return { ...item, setores };
      }
      return item;
    }));
  };

  const enviarMensagem = (e) => {
    e.preventDefault();
    if (!mensagem.trim()) return;
    
    const novaMensagem = {
      id: Date.now(),
      texto: mensagem,
      minha: true,
      horario: new Date().toLocaleTimeString()
    };
    
    setMensagens([...mensagens, novaMensagem]);
    setMensagem('');
  };

  const selecionarConversa = (conversa) => {
    setConversaAtiva(conversa);
    if (conversa.mensagens) {
      setMensagens(conversa.mensagens);
    } else {
      setMensagens([]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="search"
              placeholder="Pesquisar conversa..."
              className="w-full p-2 pl-8 bg-gray-100 rounded-lg"
            />
            <span className="absolute left-2 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {dados.map(item => {
            if (item.tipo === 'pessoal') {
              return (
                <div
                  key={item.id}
                  onClick={() => selecionarConversa(item)}
                  className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.nome}</span>
                      <span className="text-xs text-gray-500">{item.horario}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{item.ultimaMensagem}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={item.id} className="border-b">
                <div
                  className="flex items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleEmpresa(item.id)}
                >
                  {item.expandido ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                  <Building2 className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">{item.nome}</span>
                </div>
                
                {item.expandido && item.setores.map(setor => (
                  <div key={setor.id} className="pl-4">
                    <div
                      className="flex items-center p-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSetor(item.id, setor.id)}
                    >
                      {setor.expandido ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                      <Users className="w-4 h-4 mr-2" />
                      <span>{setor.nome}</span>
                    </div>
                    
                    {setor.expandido && setor.conversas.map(conversa => (
                      <div
                        key={conversa.id}
                        onClick={() => selecionarConversa(conversa)}
                        className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer ${
                          conversaAtiva?.id === conversa.id ? 'bg-gray-100' : ''
                        }`}
                      >
                        <MessageSquare className="w-8 h-8 text-gray-400 mr-3" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">{conversa.titulo}</span>
                            <span className="text-xs text-gray-500">{conversa.horario}</span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{conversa.ultimaMensagem}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Área do Chat */}
      {conversaAtiva ? (
        <div className="flex-1 flex flex-col">
          {/* Header do chat */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center">
              {conversaAtiva.tipo === 'pessoal' ? (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
              ) : (
                <MessageSquare className="w-8 h-8 text-gray-400 mr-3" />
              )}
              <div className="ml-3">
                <h2 className="font-medium">
                  {conversaAtiva.tipo === 'pessoal' ? conversaAtiva.nome : conversaAtiva.titulo}
                </h2>
                {conversaAtiva.tipo !== 'pessoal' && (
                  <p className="text-sm text-gray-500">Tech Corp • Suporte</p>
                )}
              </div>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mensagens.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.minha ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.minha ? 'bg-green-500 text-white' : 'bg-white'
                  }`}
                >
                  <p>{msg.texto}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.horario}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input de mensagem */}
          <form onSubmit={enviarMensagem} className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite uma mensagem..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>Selecione uma conversa para começar</p>
          </div>
        </div>
      )}
    </div>
  );
}