import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

export default function ImageCarousel({ photos = [], onImageClick, badges = null }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [touchStart, setTouchStart] = useState(0)
    const [touchEnd, setTouchEnd] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState(0)

    // Image par défaut si aucune photo
    const images = photos.length > 0 ? photos : ['/placeholder-property.jpg']
    const hasMultipleImages = images.length > 1

    // Navigation
    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const goToSlide = (index) => {
        setCurrentIndex(index)
    }

    // Gestion tactile (mobile)
    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX)
    }

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe && hasMultipleImages) {
            goToNext()
        }
        if (isRightSwipe && hasMultipleImages) {
            goToPrev()
        }

        setTouchStart(0)
        setTouchEnd(0)
    }

    // Gestion drag souris (desktop)
    const handleMouseDown = (e) => {
        setIsDragging(true)
        setDragStart(e.clientX)
    }

    const handleMouseMove = (e) => {
        if (!isDragging) return
        // Optionnel: afficher une preview du drag
    }

    const handleMouseUp = (e) => {
        if (!isDragging) return

        const distance = dragStart - e.clientX
        const isLeftDrag = distance > 50
        const isRightDrag = distance < -50

        if (isLeftDrag && hasMultipleImages) {
            goToNext()
        }
        if (isRightDrag && hasMultipleImages) {
            goToPrev()
        }

        setIsDragging(false)
        setDragStart(0)
    }

    // Navigation clavier
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft' && hasMultipleImages) goToPrev()
            if (e.key === 'ArrowRight' && hasMultipleImages) goToNext()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [hasMultipleImages])

    return (
        <div className="relative w-full h-[400px] md:h-[600px] bg-black rounded-2xl overflow-hidden group">
            {/* Image principale */}
            <div
                className="relative w-full h-full cursor-pointer select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => setIsDragging(false)}
                onClick={() => onImageClick && onImageClick(currentIndex)}
            >
                <img
                    src={images[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    draggable="false"
                />

                {/* Overlay gradient pour les badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Badges en overlay */}
                {badges && (
                    <div className="absolute top-6 left-6 flex flex-wrap gap-2 z-10">
                        {badges}
                    </div>
                )}

                {/* Compteur d'images */}
                {hasMultipleImages && (
                    <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full font-semibold text-sm z-10">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}

                {/* Bouton plein écran */}
                {onImageClick && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onImageClick(currentIndex)
                        }}
                        className="absolute bottom-6 right-6 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 z-10 opacity-0 group-hover:opacity-100"
                        aria-label="Plein écran"
                    >
                        <Maximize2 size={20} />
                    </button>
                )}
            </div>

            {/* Flèches de navigation - uniquement si plusieurs images */}
            {hasMultipleImages && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            goToPrev()
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-4 rounded-full shadow-xl transition-all transform hover:scale-110 z-20 opacity-0 group-hover:opacity-100"
                        aria-label="Image précédente"
                    >
                        <ChevronLeft size={28} strokeWidth={3} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            goToNext()
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-4 rounded-full shadow-xl transition-all transform hover:scale-110 z-20 opacity-0 group-hover:opacity-100"
                        aria-label="Image suivante"
                    >
                        <ChevronRight size={28} strokeWidth={3} />
                    </button>
                </>
            )}

            {/* Indicateurs (points) - uniquement si plusieurs images */}
            {hasMultipleImages && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation()
                                goToSlide(index)
                            }}
                            className={`transition-all ${index === currentIndex
                                    ? 'w-8 h-3 bg-white rounded-full'
                                    : 'w-3 h-3 bg-white/50 hover:bg-white/75 rounded-full'
                                }`}
                            aria-label={`Aller à l'image ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Message si aucune photo */}
            {photos.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="text-center text-gray-500">
                        <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg font-semibold">Aucune photo disponible</p>
                    </div>
                </div>
            )}
        </div>
    )
}
