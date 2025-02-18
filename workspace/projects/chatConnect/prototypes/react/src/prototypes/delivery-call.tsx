import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, ChevronDown, MapPin, Clock, DollarSign,
  User, Phone
} from 'lucide-react';

const DeliveryCall = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isRinging, setIsRinging] = useState(true);
  const [dragComplete, setDragComplete] = useState(false);
  
  const dragY = useMotionValue(0);
  
  const dragScale = useTransform(
    dragY,
    [-150, 0, 150],
    [1.1, 1, 0.9]
  );

  // Som de chamada
  useEffect(() => {
    if (isRinging) {
      const audio = new Audio('/api/placeholder/audio/ring.mp3');
      audio.loop = true;
      audio.play().catch(e => console.log('Audio play failed:', e));
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [isRinging]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !dragComplete) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleDecline();
    }
  }, [timeLeft, dragComplete]);

  const handleDragEnd = (_, info) => {
    if (info.offset.y < -100) {
      handleAccept();
    } else if (info.offset.y > 100) {
      handleDecline();
    }
  };

  const handleAccept = () => {
    setDragComplete(true);
    setIsRinging(false);
    setTimeout(() => setIsVisible(false), 500);
  };

  const handleDecline = () => {
    setDragComplete(true);
    setIsRinging(false);
    setTimeout(() => setIsVisible(false), 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50"
        >
          {/* Texto Superior - Aceitar */}
          <div className="absolute top-12 left-0 right-0 text-center">
            <p className="text-green-500 font-semibold text-lg uppercase tracking-wide">
              Arraste para Aceitar
            </p>
          </div>

          {/* Timer circular com pulso */}
          <div className="relative w-32 h-32 mb-8">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0"
            >
              <div className="w-full h-full rounded-full bg-blue-500/20"/>
            </motion.div>

            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="#1a365d"
                strokeWidth="8"
              />
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="#3182ce"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - timeLeft / 15)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">
              {timeLeft}s
            </div>
          </div>

          {/* Informações da entrega */}
          <motion.div
            drag="y"
            dragConstraints={{ top: -150, bottom: 150 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            style={{ scale: dragScale }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-800 rounded-lg p-6 mb-8 w-full max-w-md"
          >
            <h2 className="text-white text-2xl font-bold mb-4">Nova Entrega!</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-blue-400"/>
                <div>
                  <div className="text-sm opacity-75">Endereço de Coleta</div>
                  <div>Rua das Flores, 123</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="w-5 h-5 text-blue-400"/>
                <div>
                  <div className="text-sm opacity-75">Tempo Estimado</div>
                  <div>15-20 minutos</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300">
                <DollarSign className="w-5 h-5 text-blue-400"/>
                <div>
                  <div className="text-sm opacity-75">Valor da Entrega</div>
                  <div>R$ 15,00</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <User className="w-5 h-5 text-blue-400"/>
                <div>
                  <div className="text-sm opacity-75">Cliente</div>
                  <div className="flex items-center justify-between">
                    <span>Maria Silva</span>
                    <Phone className="w-4 h-4 text-blue-400 ml-2 cursor-pointer"/>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Texto Inferior - Recusar */}
          <div className="absolute bottom-12 left-0 right-0 text-center">
            <p className="text-red-500 font-semibold text-lg uppercase tracking-wide">
              Arraste para Recusar
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeliveryCall;