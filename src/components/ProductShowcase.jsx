import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductShowcase.css'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const textItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 20 }
  }
};

// Se eliminó el "clipPath" que causaba el efecto visual de "corte"
const imageContainerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

export default function ProductShowcase({ product, index }) {
  const isEven = index % 2 === 0;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const images = product.imageUrls || (product.imageUrl ? [product.imageUrl] : []);
  const hasMultipleImages = images.length > 1;

  const nextImage = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  // Recuerda poner tu número real
  const numeroWhatsApp = "529381289812"; 
  const mensajeFormateado = encodeURIComponent(`Hola, quiero cotizar el modelo: ${product.title}`);
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeFormateado}`;

  return (
    <section className="section showcase-section">
      <div className="container">
        <div className={`columns is-vcentered showcase-columns ${isEven ? '' : 'is-reversed'}`}>
          
          <div className="column is-7">
            <motion.div 
              variants={imageContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-50px" }}
              className="product-image-wrapper" /* <-- Usamos la clase CSS en lugar de estilos en línea */
            >
            <AnimatePresence mode="wait">
                <motion.img 
                  key={currentIndex} 
                  src={images[currentIndex]} 
                  alt={`${product.title} - Vista ${currentIndex + 1}`} 
                  initial={{ opacity: 0, scale: 0.98 }} /* Ligero zoom in inicial muy sutil */
                  animate={{ opacity: 1, scale: 1 }}     /* Llega a su escala natural con suavidad */
                  exit={{ opacity: 0 }}                  /* Mantiene la salida limpia */
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.2, 1, 1.4, 1] /* Curva de aceleración tipo "ease-out" natural */
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
                />
              </AnimatePresence>

              {hasMultipleImages && (
                <>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 1rem', transform: 'translateY(-50%)', zIndex: 10 }}>
                    <button onClick={prevImage} className="button is-white is-rounded is-small" style={{ opacity: 0.7, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>←</button>
                    <button onClick={nextImage} className="button is-white is-rounded is-small" style={{ opacity: 0.7, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>→</button>
                  </div>
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

          <motion.div 
            className="column is-5 showcase-text"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }} /* Sincronizado con la imagen */
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
              Unidades límitadas
            </motion.p>
            
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