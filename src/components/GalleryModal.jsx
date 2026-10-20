import React from "react";

export function GalleryModal({ galleryImages, galleryIndex, onClose, onSelect }) {
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <button
        className="modal-close"
        onClick={onClose}
        aria-label="Close gallery image"
      >
        Close
      </button>
      <button
        className="modal-arrow left"
        onClick={() =>
          onSelect((galleryIndex - 1 + galleryImages.length) % galleryImages.length)
        }
        aria-label="Previous gallery image"
      >
        Prev
      </button>
      <img
        src={galleryImages[galleryIndex]}
        alt={`Gallery embroidery ${galleryIndex + 1}`}
      />
      <button
        className="modal-arrow right"
        onClick={() => onSelect((galleryIndex + 1) % galleryImages.length)}
        aria-label="Next gallery image"
      >
        Next
      </button>
    </div>
  );
}
