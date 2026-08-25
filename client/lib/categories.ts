import {
  Baby,
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

import type { LucideIcon } from "lucide-react";

export type Subcategory = {
  id: string;
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  subcategories: Subcategory[];
};

export const categories: Category[] = [
  {
    id: "tecnologia",
    name: "Tecnologia",
    slug: "tecnologia",
    description: "Smartphones, computadores, eletrônicos e acessórios",
    icon: Smartphone,
    subcategories: [
      { id: "smartphones", name: "Smartphones", slug: "smartphones" },
      { id: "informatica", name: "Informática", slug: "informatica" },
      { id: "audio", name: "Áudio", slug: "audio" },
      { id: "wearables", name: "Wearables", slug: "wearables" },
      {
        id: "seguranca-smart-home",
        name: "Segurança",
        slug: "seguranca-smart-home",
      },
      {
        id: "acessorios-tech",
        name: "Acessórios",
        slug: "acessorios-tech",
      },
    ],
  },
  {
    id: "games",
    name: "Games",
    slug: "games",
    description: "Consoles, jogos, periféricos e equipamentos gamer",
    icon: Gamepad2,
    subcategories: [
      { id: "consoles", name: "Consoles", slug: "consoles" },
      { id: "jogos", name: "Jogos", slug: "jogos" },
      {
        id: "perifericos",
        name: "Periféricos",
        slug: "perifericos",
      },
      {
        id: "cadeiras-gamer",
        name: "Cadeiras Gamer",
        slug: "cadeiras-gamer",
      },
    ],
  },
  {
    id: "casa",
    name: "Casa & Cozinha",
    slug: "casa",
    description: "Produtos para equipar, organizar e decorar sua casa",
    icon: Home,
    subcategories: [
      { id: "cozinha", name: "Cozinha", slug: "cozinha" },
      { id: "decoracao", name: "Decoração", slug: "decoracao" },
      { id: "organizacao", name: "Organização", slug: "organizacao" },
      {
        id: "cama-mesa-banho",
        name: "Cama, Mesa & Banho",
        slug: "cama-mesa-banho",
      },
      { id: "moveis", name: "Móveis", slug: "moveis" },
    ],
  },
  {
    id: "eletrodomesticos",
    name: "Eletrodomésticos",
    slug: "eletrodomesticos",
    description: "Eletrodomésticos e equipamentos para facilitar sua rotina",
    icon: Zap,
    subcategories: [
      {
        id: "eletroportateis",
        name: "Eletroportáteis",
        slug: "eletroportateis",
      },
      {
        id: "cozinha-eletrica",
        name: "Cozinha Elétrica",
        slug: "cozinha-eletrica",
      },
      {
        id: "climatizacao",
        name: "Climatização",
        slug: "climatizacao",
      },
      {
        id: "limpeza-eletrica",
        name: "Limpeza",
        slug: "limpeza-eletrica",
      },
    ],
  },
  {
    id: "moda-acessorios",
    name: "Moda & Acessórios",
    slug: "moda-acessorios",
    description: "Roupas, calçados, bolsas e acessórios para todos os estilos",
    icon: Shirt,
    subcategories: [
  {
    id: "roupas",
    name: "Roupas",
    slug: "roupas",
  },
  {
    id: "calcados",
    name: "Calçados",
    slug: "calcados",
  },
  {
    id: "bolsas-carteiras",
    name: "Bolsas & Carteiras",
    slug: "bolsas-carteiras",
  },
  {
    id: "meias-underwear",
    name: "Meias & Underwear",
    slug: "meias-underwear",
  },
  {
    id: "relogios-joias",
    name: "Relógios & Joias",
    slug: "relogios-joias",
  },
  {
    id: "acessorios-moda",
    name: "Acessórios",
    slug: "acessorios-moda",
  },
],
  },
  {
    id: "saude-beleza",
    name: "Beleza & Cuidados",
    slug: "saude-beleza",
    description: "Beleza, higiene, saúde e cuidados pessoais",
    icon: Heart,
    subcategories: [
      { id: "maquiagem", name: "Maquiagem", slug: "maquiagem" },
      {
        id: "cuidados-com-a-pele",
        name: "Cuidados com a Pele",
        slug: "cuidados-com-a-pele",
      },
      {
        id: "cabelos",
        name: "Cuidados com o Cabelo",
        slug: "cabelos",
      },
      { id: "perfumaria", name: "Perfumaria", slug: "perfumaria" },
      {
        id: "saude-bem-estar",
        name: "Saúde & Bem-estar",
        slug: "saude-bem-estar",
      },
    ],
  },
  {
    id: "esporte-fitness",
    name: "Esporte & Fitness",
    slug: "esporte-fitness",
    description: "Produtos para treinos, esportes e uma rotina ativa",
    icon: Dumbbell,
    subcategories: [
      { id: "musculacao", name: "Musculação", slug: "musculacao" },
      { id: "corrida", name: "Corrida", slug: "corrida" },
      { id: "ciclismo", name: "Ciclismo", slug: "ciclismo" },
      {
        id: "esportes",
        name: "Esportes",
        slug: "esportes",
      },
      {
        id: "suplementos",
        name: "Suplementos",
        slug: "suplementos",
      },
    ],
  },
  {
    id: "utilidades",
    name: "Utilidades & Ferramentas",
    slug: "utilidades",
    description:
      "Ferramentas, organização e produtos práticos para o dia a dia",
    icon: Utensils,
    subcategories: [
      {
        id: "ferramentas",
        name: "Ferramentas",
        slug: "ferramentas",
      },
      {
        id: "organizadores",
        name: "Organizadores",
        slug: "organizadores",
      },
      {
        id: "jardim",
        name: "Jardim",
        slug: "jardim",
      },
      {
        id: "material-eletrico",
        name: "Material Elétrico",
        slug: "material-eletrico",
      },
    ],
  },
  {
    id: "automotivo",
    name: "Automotivo",
    slug: "automotivo",
    description: "Acessórios, equipamentos e cuidados para veículos",
    icon: Settings,
    subcategories: [
      {
        id: "acessorios-auto",
        name: "Acessórios",
        slug: "acessorios-auto",
      },
      {
        id: "som-automotivo",
        name: "Som Automotivo",
        slug: "som-automotivo",
      },
      {
        id: "limpeza-automotiva",
        name: "Limpeza e Cuidados",
        slug: "limpeza-automotiva",
      },
      {
        id: "motos",
        name: "Motos",
        slug: "motos",
      },
    ],
  },
  {
    id: "pet-shop",
    name: "Pet Shop",
    slug: "pet-shop",
    description: "Alimentação, higiene e acessórios para animais",
    icon: PawPrint,
    subcategories: [
      { id: "caes", name: "Cães", slug: "caes" },
      { id: "gatos", name: "Gatos", slug: "gatos" },
      {
        id: "alimentacao-pet",
        name: "Alimentação",
        slug: "alimentacao-pet",
      },
      {
        id: "higiene-pet",
        name: "Higiene",
        slug: "higiene-pet",
      },
      {
        id: "acessorios-pet",
        name: "Acessórios",
        slug: "acessorios-pet",
      },
    ],
  },
  {
    id: "bebes-criancas",
    name: "Bebês & Crianças",
    slug: "bebes-criancas",
    description: "Cuidados, brinquedos e produtos para os pequenos",
    icon: Baby,
    subcategories: [
      {
        id: "cuidados-bebe",
        name: "Cuidados com o Bebê",
        slug: "cuidados-bebe",
      },
      {
        id: "brinquedos",
        name: "Brinquedos",
        slug: "brinquedos",
      },
      {
        id: "roupas-infantis",
        name: "Roupas Infantis",
        slug: "roupas-infantis",
      },
      {
        id: "passeio",
        name: "Passeio",
        slug: "passeio",
      },
    ],
  },
  {
  id: "alimentos-bebidas",
  name: "Alimentos & Bebidas",
  slug: "alimentos-bebidas",
  description: "Alimentos, bebidas e produtos para sua despensa",
  icon: Utensils,
  subcategories: [
    {
      id: "alimentos",
      name: "Alimentos",
      slug: "alimentos",
    },
    {
      id: "bebidas",
      name: "Bebidas",
      slug: "bebidas",
    },
    {
      id: "doces-sobremesas",
      name: "Doces & Sobremesas",
      slug: "doces-sobremesas",
    },
    {
      id: "mercearia",
      name: "Mercearia",
      slug: "mercearia",
    },
    {
      id: "cafe-chas",
      name: "Café & Chás",
      slug: "cafe-chas",
    },
  ],
}
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getSubcategoryBySlug(
  categorySlug: string,
  subcategorySlug: string,
): Subcategory | undefined {
  const category = getCategoryBySlug(categorySlug);

  return category?.subcategories.find(
    (subcategory) => subcategory.slug === subcategorySlug,
  );
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}
