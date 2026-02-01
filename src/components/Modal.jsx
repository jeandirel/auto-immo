import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// Modal générique fullscreen
export function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative z-10 bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-auto shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition"
                    aria-label="Fermer"
                >
                    <X size={24} />
                </button>
                {children}
            </div>
        </div>
    )
}

// Carousel de photos professionnel
export function PhotoCarousel({ photos, initialIndex = 0 }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    if (!photos || photos.length === 0) {
        return <div className="text-center p-8 text-gray-500">Aucune photo disponible</div>
    }

    const next = () => setCurrentIndex((currentIndex + 1) % photos.length)
    const prev = () => setCurrentIndex((currentIndex - 1 + photos.length) % photos.length)

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') prev()
        if (e.key === 'ArrowRight') next()
        if (e.key === 'Escape') e.stopPropagation()
    }

    return (
        <div className="relative" onKeyDown={handleKeyDown} tabIndex={0}>
            {/* Image principale */}
            <div className="relative bg-black">
                <img
                    src={photos[currentIndex]}
                    alt={`Photo ${currentIndex + 1}`}
                    className="w-full h-[70vh] object-contain"
                />

                {/* Contrôles de navigation */}
                {photos.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-4 shadow-lg transition transform hover:scale-110"
                            aria-label="Photo précédente"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-4 shadow-lg transition transform hover:scale-110"
                            aria-label="Photo suivante"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </>
                )}

                {/* Indicateur de position */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full font-semibold backdrop-blur-sm">
                    {currentIndex + 1} / {photos.length}
                </div>
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
                <div className="p-6 bg-gray-100">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {photos.map((photo, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-4 transition transform hover:scale-105 ${i === currentIndex
                                        ? 'ring-4 ring-primary border-primary shadow-lg'
                                        : 'border-transparent hover:border-gray-300'
                                    }`}
                            >
                                <img
                                    src={photo}
                                    alt={`Thumbnail ${i + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default { Modal, PhotoCarousel }
