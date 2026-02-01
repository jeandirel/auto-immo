import { Edit, Trash2, Archive, Pause, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminActions({ annonce, onDelete, onArchive, onTogglePause }) {
    const navigate = useNavigate()

    const handleEdit = () => {
        navigate(`/modifier-annonce/${annonce.id}`)
    }

    const handleDelete = () => {
        if (onDelete(annonce.id)) {
            alert('✅ Annonce supprimée avec succès')
        }
    }

    const handleArchive = () => {
        onArchive(annonce.id)
        alert('📦 Annonce archivée')
    }

    const handleTogglePause = () => {
        onTogglePause(annonce.id)
        const newStatus = annonce.status === 'paused' ? 'active' : 'paused'
        alert(newStatus === 'paused' ? '⏸️ Annonce mise en pause' : '▶️ Annonce réactivée')
    }

    return (
        <div className="flex flex-wrap gap-2 mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <p className="w-full text-xs font-semibold text-gray-600 mb-2">🔧 Actions Admin :</p>

            <button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition transform hover:scale-105 shadow"
            >
                <Edit size={16} />
                Modifier
            </button>

            <button
                onClick={handleTogglePause}
                className={`flex items-center gap-2 ${annonce.status === 'paused'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-yellow-500 hover:bg-yellow-600'
                    } text-white px-4 py-2 rounded-lg transition transform hover:scale-105 shadow`}
            >
                {annonce.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}
                {annonce.status === 'paused' ? 'Reprendre' : 'Pause'}
            </button>

            <button
                onClick={handleArchive}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition transform hover:scale-105 shadow"
            >
                <Archive size={16} />
                Archiver
            </button>

            <button
                onClick={handleDelete}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition transform hover:scale-105 shadow"
            >
                <Trash2 size={16} />
                Supprimer
            </button>
        </div>
    )
}
