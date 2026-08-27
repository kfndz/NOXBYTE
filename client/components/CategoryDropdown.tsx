import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Baby,
  ChevronDown,
  Dumbbell,
  Gamepad2,
  Heart,
  Home,
  PawPrint,
  Settings,
  Shirt,
  Smartphone,
  Utensils,
  Zap,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

const categoryIcons = {
  tecnologia: Smartphone,
  games: Gamepad2,
  casa: Home,
  eletrodomesticos: Zap,
  "moda-acessorios": Shirt,
  "saude-beleza": Heart,
  "esporte-fitness": Dumbbell,
  utilidades: Utensils,
  automotivo: Settings,
  "pet-shop": PawPrint,
  "bebes-criancas": Baby,
  "alimentos-bebidas": Utensils,
};

export function CategoryDropdown() {
  const { categories, loading } = useCategories();

  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);

  const activeCategory =
    categories.find((category) => category.slug === activeCategorySlug) ??
    categories[0] ??
    null;

  if (loading) {
    return null;
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Button */}
      <button className="flex items-center gap-1 text-sm font-medium hover:text-accent transition-colors py-2">
        Categorias
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50",
          "w-96 py-2"
        )}
      >
        <div className="flex">
          {/* Categories List */}
          <div className="w-48 border-r border-border">
            {categories.map((category) => {
              const Icon =
                categoryIcons[
                category.slug as keyof typeof categoryIcons
                ] ?? Settings;
              return (
                <button
                  key={category.id}
                  onMouseEnter={() => setActiveCategorySlug(category.slug)}
                  className={cn(
                    "w-full px-4 py-3 text-sm text-left flex items-center gap-3 transition-colors",
                    "hover:bg-muted",
                    activeCategory?.slug === category.slug &&
                    "bg-accent/10 text-accent font-medium"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Subcategories */}
          {activeCategory && (
            <div className="w-56 pl-4 pr-4 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                {activeCategory.name}
              </p>
              <div className="space-y-1">
                {activeCategory.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    to={`/categoria/${activeCategory.slug}/${subcategory.slug}`}
                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-accent hover:bg-muted rounded transition-colors whitespace-nowrap"
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
