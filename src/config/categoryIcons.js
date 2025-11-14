// Configuración de íconos y colores por categoría
const categoryConfig = {
    "Arte y literatura": {
        icon: "🎨",
        color: "#ec4899",
        gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)"
    },
    "Ciencia": {
        icon: "🔬",
        color: "#3b82f6",
        gradient: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)"
    },
    "Historia": {
        icon: "📜",
        color: "#f59e0b",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    "Geografía": {
        icon: "🌍",
        color: "#10b981",
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    "Deportes": {
        icon: "⚽",
        color: "#ef4444",
        gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
    },
    "Entretenimiento": {
        icon: "🎬",
        color: "#8b5cf6",
        gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
    },
    "Música": {
        icon: "🎵",
        color: "#06b6d4",
        gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
    },
    "Tecnología": {
        icon: "💻",
        color: "#6366f1",
        gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
    },
    "Gastronomía": {
        icon: "🍕",
        color: "#f97316",
        gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
    },
    "Naturaleza": {
        icon: "🌿",
        color: "#22c55e",
        gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
    },
    "Mitología": {
        icon: "⚡",
        color: "#a855f7",
        gradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)"
    },
    "Astronomía": {
        icon: "🌟",
        color: "#fbbf24",
        gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
    },
    // Categoría por defecto
    "default": {
        icon: "❓",
        color: "#6366f1",
        gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
    }
};

// Función para obtener configuración de una categoría
function getCategoryConfig(categoryName) {
    // Normalizar el nombre de la categoría
    const normalizedName = categoryName ? categoryName.trim() : "";
    
    // Buscar coincidencia exacta
    if (categoryConfig[normalizedName]) {
        return categoryConfig[normalizedName];
    }
    
    // Buscar coincidencia parcial (case-insensitive)
    const lowerCategoryName = normalizedName.toLowerCase();
    for (const [key, value] of Object.entries(categoryConfig)) {
        if (key.toLowerCase().includes(lowerCategoryName) || 
            lowerCategoryName.includes(key.toLowerCase())) {
            return value;
        }
    }
    
    // Retornar configuración por defecto
    return categoryConfig.default;
}

// Función para obtener todas las categorías disponibles
function getAllCategories() {
    const categories = Object.keys(categoryConfig).filter(key => key !== "default");
    return categories.map(name => ({
        name,
        icon: categoryConfig[name].icon,
        color: categoryConfig[name].color
    }));
}

module.exports = {
    categoryConfig,
    getCategoryConfig,
    getAllCategories
};