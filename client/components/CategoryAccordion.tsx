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

export function CategoryAccordion() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { categories, loading } = useCategories();

  if (loading) {
    return null;
  }

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const Icon = categoryIcons[
          category.slug as keyof typeof categoryIcons
        ] ?? Settings;
        const isExpanded = expandedCategory === category.id;

        return (
          <div key={category.id} className="border-b border-border last:border-b-0">
            {/* Category Header */}
            <button
              onClick={() =>
                setExpandedCategory(
                  isExpanded ? null : category.id
                )
              }
              className="w-full px-4 py-3 flex items-center gap-3 justify-between hover:bg-muted transition-colors text-sm font-medium"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-accent" />
                <span>{category.name}</span>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {/* Subcategories */}
            {isExpanded && (
              <div className="bg-muted/50 border-t border-border">
                {category.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    to={`/categoria/${category.slug}/${subcategory.slug}`}
                    onClick={() => setExpandedCategory(null)}
                    className="block px-8 py-2.5 text-sm text-muted-foreground hover:text-accent hover:bg-muted transition-colors"
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
