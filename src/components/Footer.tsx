import { Link } from 'react-router-dom';


const Footer = () => {
  return (
    <footer className="footer-bg text-white py-12 relative overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-gray-900 to-transparent opacity-50 footer-gradient"></div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-64 opacity-10 footer-shape">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="white" d="M40.8,-68.7C51.9,-61.9,59.5,-48.1,65.6,-34C71.7,-19.9,76.3,-5.5,74.9,8.2C73.5,21.9,66.2,35,56.4,45.3C46.6,55.6,34.4,63.2,21.1,68.8C7.8,74.5,-6.6,78.2,-20.1,75.7C-33.6,73.1,-46.3,64.3,-54.9,52.7C-63.6,41.2,-68.3,26.8,-70.8,12.1C-73.3,-2.7,-73.7,-17.7,-68.6,-30.7C-63.5,-43.7,-52.9,-54.6,-40.5,-60.8C-28.1,-67,-14,-68.5,0.5,-69.3C15,-70.1,29.7,-75.4,40.8,-68.7Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-1/4 h-48 opacity-10 footer-shape-slow">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="white" d="M47.7,-73.2C62.1,-66.5,74.5,-53.9,79.7,-39C84.9,-24.1,82.9,-7,78.1,8.3C73.3,23.5,65.6,36.8,55.3,48.9C44.9,61,31.9,71.8,16.7,77.2C1.5,82.6,-15.8,82.5,-30.1,76.4C-44.4,70.3,-55.6,58.2,-65.4,44.8C-75.2,31.4,-83.5,16.7,-83.8,1.8C-84,-13.2,-76.2,-26.3,-67.1,-38.2C-58,-50.1,-47.6,-60.7,-35.3,-68.4C-22.9,-76.1,-8.6,-80.9,4.2,-87.2C17,-93.6,33.3,-79.9,47.7,-73.2Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="absolute top-1/3 left-1/4 w-16 h-16 opacity-10 footer-rotate">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="50" cy="50" r="10" fill="white" />
          <line x1="50" y1="10" x2="50" y2="20" stroke="white" strokeWidth="2" />
          <line x1="50" y1="80" x2="50" y2="90" stroke="white" strokeWidth="2" />
          <line x1="10" y1="50" x2="20" y2="50" stroke="white" strokeWidth="2" />
          <line x1="80" y1="50" x2="90" y2="50" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <div className="absolute bottom-1/4 right-1/4 w-20 h-20 opacity-10 footer-shape-right">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,15 20,80 80,80" fill="white" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/favicon.png" alt="Study Volte Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-white">Study Volte</span>
            </div>
            <p className="text-gray-400">
              Your trusted platform for academic resources and question papers.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/browse" className="text-gray-400 hover:text-white transition-colors">Browse Papers</Link></li>
              <li><Link to="/upload" className="text-gray-400 hover:text-white transition-colors">Upload Paper</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help-center" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Study Volte. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;