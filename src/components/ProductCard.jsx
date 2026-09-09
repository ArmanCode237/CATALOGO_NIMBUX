import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';

export default function ProductCard({ title, price, imageUrl }) {
  return (
    <motion.div 
      className="card"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div className="card-image">
        <figure className="image is-4by3">
          <img src={imageUrl} alt={title} style={{ objectFit: 'cover' }} />
        </figure>
      </div>
      
      <div className="card-content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="media mb-4">
          <div className="media-content">
            <p className="title is-5">{title}</p>
            <p className="subtitle is-4 has-text-weight-bold has-text-primary mb-0">${price}</p>
          </div>
        </div>
        
        <div className="content mt-auto">
          <button className="button is-primary is-fullwidth">
            <span className="icon">
              <FaShoppingCart />
            </span>
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}