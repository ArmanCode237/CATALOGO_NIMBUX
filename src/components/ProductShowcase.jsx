import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const textItemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 20 }
  }
};

const imageContainerVariants = {
  hidden: { opacity: 0, scale: 1.05, clipPath: 'inset(10% 10% 10% 10%)' },
  visible: {
    opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function ProductShowcase({ product, index }) {
  const isEven = index % 2 === 0;
  
  // Lógica para controlar la imagen actual del slider
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Verificación de seguridad
  const images = product.imageUrls || (product.imageUrl ? [product.imageUrl] : []);
  const hasMultipleImages = images.length > 1;

  // --- LÓGICA DE AUTOPLAY (4 segundos) ---
  useEffect(() => {
    // Si solo hay una imagen, no hacemos nada
    if (!hasMultipleImages) return;

    // Configuramos un temporizador para avanzar la imagen
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, 4000); // 4000 ms = 4 segundos

    // Limpiamos el temporizador si el componente se desmonta
    return () => clearInterval(timer);
  }, [hasMultipleImages, images.length]);
  // ---------------------------------------

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  // --- LÓGICA DE WHATSAPP ---
  // Reemplaza con tu número real (ej. 52 para México + los 10 dígitos)
  const numeroWhatsApp = "529381289812"; 
  const mensajeFormateado = encodeURIComponent(`Hola, quiero cotizar el modelo: ${product.title}`);
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeFormateado}`;
  // --------------------------

  return (
    <section 
      className="section" 
      style={{ 
        overflow: 'hidden', 
        height: '100vh',
        display: 'flex', 
        alignItems: 'center',
        scrollSnapAlign: 'start'
      }}
    >
      <div className="container">
        <div className={`columns is-vcentered ${isEven ? '' : 'is-flex-direction-row-reverse'}`}>
          
          {/* COLUMNA DE LA IMAGEN (CON CARRUSEL INTEGRADO) */}
          <div className="column is-7">
            <motion.div 
              variants={imageContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.4 }} 
              style={{ 
                borderRadius: '8px', 
                overflow: 'hidden', 
                backgroundColor: '#f5f5f5',
                position: 'relative',
                aspectRatio: '16/9' // Mantiene la proporción en todas las fotos
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentIndex} // La key obliga a Framer Motion a animar el cambio
                  src={images[currentIndex]} 
                  alt={`${product.title} - Vista ${currentIndex + 1}`} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
                />
              </AnimatePresence>

              {/* Controles del Carrusel (Solo visibles si hay > 1 imagen) */}
              {hasMultipleImages && (
                <>
                  {/* Flechas Laterales */}
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 1rem', transform: 'translateY(-50%)', zIndex: 10 }}>
                    <button onClick={prevImage} className="button is-white is-rounded is-small" style={{ opacity: 0.7, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                      ←
                    </button>
                    <button onClick={nextImage} className="button is-white is-rounded is-small" style={{ opacity: 0.7, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                      →
                    </button>
                  </div>

                  {/* Puntos (Dots) Inferiores */}
                  <div style={{ position: 'absolute', bottom: '15px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
                    {images.map((_, dotIndex) => (
                      <div 
                        key={dotIndex}
                        onClick={() => setCurrentIndex(dotIndex)}
                        style={{
                          width: dotIndex === currentIndex ? '24px' : '8px',
                          height: '8px',
                          borderRadius: '4px',
                          backgroundColor: dotIndex === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* COLUMNA DE TEXTOS */}
          <motion.div 
            className="column is-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.4 }}
            style={{ padding: '0 4rem' }}
          >
            <motion.p variants={textItemVariants} className="is-size-7 has-text-black is-uppercase mb-4" style={{ letterSpacing: '2px' }}>
              Modelo 0{index + 1} - Edición límitada
            </motion.p>
            
            <motion.h2 variants={textItemVariants} className="title is-2 has-text-weight-light has-text-black mb-5" style={{ lineHeight: '1.2' }}>
              {product.title}
            </motion.h2>
            
            <motion.p variants={textItemVariants} className="subtitle is-5 has-text-black has-text-weight-light mb-6" style={{ lineHeight: '1.8' }}>
              {product.description}
            </motion.p>

            <motion.p variants={textItemVariants} className="has-text-info title is-4 mb-6">
              ${product.price.toFixed(2)}
            </motion.p>
            
            {/* Convertido de button a tag 'a' para funcionar como enlace externo */}
            <motion.div variants={textItemVariants}>
              <a 
                href={urlWhatsApp} 
                target="_blank" 
                rel="noopener noreferrer"
                className="button is-black is-outlined is-medium mt-4" 
                style={{ borderRadius: '0', padding: '1rem 3rem', transition: 'all 0.3s ease', textDecoration: 'none' }}
              >
                SOLICITAR COTIZACIÓN
              </a>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}