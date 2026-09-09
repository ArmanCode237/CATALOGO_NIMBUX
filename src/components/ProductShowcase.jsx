// src/components/ProductShowcase.jsx
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const textItemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 20 }
  }
};

const imageVariants = {
  hidden: { 
    opacity: 0, 
    scale: 1.1,
    clipPath: 'inset(15% 15% 15% 15%)'
  },
  visible: {
    opacity: 1,
    scale: 1,
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function ProductShowcase({ product, index }) {
  const isEven = index % 2 === 0;

  return (
    <section 
      className="section" 
      style={{ 
        overflow: 'hidden', 
        height: '100vh', // Forzamos que ocupe el 100% de la pantalla
        display: 'flex', 
        alignItems: 'center',
        scrollSnapAlign: 'start' // Imanta esta sección a la parte superior de la ventana
      }}
    >
      <div className="container">
        <div className={`columns is-vcentered ${isEven ? '' : 'is-flex-direction-row-reverse'}`}>
          
          <div className="column is-7">
            <motion.div 
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              // once: false permite que la animación se repita al subir y bajar
              viewport={{ once: false, amount: 0.4 }} 
              style={{ borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f5f5f5' }}
            >
              <figure className="image is-16by9">
                <img src={product.imageUrl} alt={product.title} style={{ objectFit: 'cover' }} />
              </figure>
            </motion.div>
          </div>

          <motion.div 
            className="column is-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            // once: false también para el texto
            viewport={{ once: false, amount: 0.4 }}
            style={{ padding: '0 4rem' }}
          >
            <motion.p variants={textItemVariants} className="is-size-7 has-text-dark is-uppercase mb-4" style={{ letterSpacing: '2px' }}>
              0{index + 1} // Serie Limitada
            </motion.p>
            
            <motion.h2 variants={textItemVariants} className="title is-2 has-text-dark has-text-weight-light mb-5" style={{ lineHeight: '1.2' }}>
              {product.title}
            </motion.h2>
            
            <motion.p variants={textItemVariants} className="subtitle is-5 has-text-dark has-text-weight-light mb-6" style={{ lineHeight: '1.8' }}>
              {product.description}
            </motion.p>
            
            <motion.p variants={textItemVariants} className="has-text-primary title is-4 mb-6">
              ${product.price.toFixed(2)}
            </motion.p>
            
            <motion.div variants={textItemVariants}>
              <button className="button is-black is-outlined is-medium" style={{ borderRadius: '0', padding: '1rem 3rem', transition: 'all 0.3s ease' }}>
                VER DETALLES
              </button>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}