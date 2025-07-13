import { pdfjs } from 'react-pdf';

// Import the worker directly as a string
// This works in both development and production
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

export default pdfjs; 