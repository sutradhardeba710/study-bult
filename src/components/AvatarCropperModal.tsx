import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Modal from './Modal'; // Assume you have a Modal component, or use a simple div fallback
import Button from './Button';

interface AvatarCropperModalProps {
  isOpen: boolean;
  imageUrl?: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, cropParams: { x: number; y: number; width: number; height: number; zoom: number }) => void;
  loading?: boolean;
  initialCrop?: { x: number; y: number; width: number; height: number; zoom: number };
}

const createImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
};

async function getCroppedImg(imageSrc: string, croppedAreaPixels: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas is empty'));
    }, 'image/jpeg', 0.95);
  });
}

const AvatarCropperModal: React.FC<AvatarCropperModalProps> = ({ isOpen, imageUrl, onClose, onCropComplete, loading, initialCrop }) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>(initialCrop ? { x: initialCrop.x, y: initialCrop.y } : { x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(initialCrop?.zoom || 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(initialCrop ? { x: initialCrop.x, y: initialCrop.y, width: initialCrop.width, height: initialCrop.height } : null);
  const [processing, setProcessing] = useState(false);

  React.useEffect(() => {
    if (initialCrop) {
      setCrop({ x: initialCrop.x, y: initialCrop.y });
      setZoom(initialCrop.zoom);
      setCroppedAreaPixels({ x: initialCrop.x, y: initialCrop.y, width: initialCrop.width, height: initialCrop.height });
    }
  }, [initialCrop, imageUrl]);

  const onCropChange = (c: any) => setCrop(c);
  const onZoomChange = (z: number) => setZoom(z);
  const onCropCompleteInternal = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!imageUrl || !croppedAreaPixels) return;
    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
      onCropComplete(croppedBlob, { ...croppedAreaPixels, zoom });
    } catch (err) {
      alert('Failed to crop image.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crop your avatar">
      <div className="p-4 w-full max-w-md mx-auto">
        <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden mb-4">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteInternal}
          />
        </div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <label className="flex-1">
            <span className="text-xs text-gray-500">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={processing || loading}>Cancel</Button>
          <Button type="button" onClick={handleCrop} loading={processing || loading}>
            Crop & Upload
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AvatarCropperModal;
export type { AvatarCropperModalProps }; 