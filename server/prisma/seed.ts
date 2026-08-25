import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV === "production") {
  console.warn("Seed de categorias bloqueado em produção.");
  process.exit(0);
}

const prisma = new PrismaClient();

const categories = [
  {
    name: "Tecnologia",
    slug: "tecnologia",
    description: "Smartphones, computadores, eletrônicos e acessórios",
    subcategories: [
      { name: "Smartphones", slug: "smartphones" },
      { name: "Informática", slug: "informatica" },
      { name: "Áudio", slug: "audio" },
      { name: "Wearables", slug: "wearables" },
      {
        name: "Segurança",
        slug: "seguranca-smart-home",
      },
      {
        name: "Acessórios",
        slug: "acessorios-tech",
      },
    ],
  },
  {
    name: "Games",
    slug: "games",
    description: "Consoles, jogos, periféricos e equipamentos gamer",
    subcategories: [
      { name: "Consoles", slug: "consoles" },
      { name: "Jogos", slug: "jogos" },
      {
        name: "Periféricos",
        slug: "perifericos",
      },
      {
        name: "Cadeiras Gamer",
        slug: "cadeiras-gamer",
      },
    ],
  },
  {
    name: "Casa & Cozinha",
    slug: "casa",
    description: "Produtos para equipar, organizar e decorar sua casa",
    subcategories: [
      { name: "Cozinha", slug: "cozinha" },
      { name: "Decoração", slug: "decoracao" },
      { name: "Organização", slug: "organizacao" },
      {
        name: "Cama, Mesa & Banho",
        slug: "cama-mesa-banho",
      },
      { name: "Móveis", slug: "moveis" },
    ],
  },
  {
    name: "Eletrodomésticos",
    slug: "eletrodomesticos",
    description: "Eletrodomésticos e equipamentos para facilitar sua rotina",
    subcategories: [
      {
        name: "Eletroportáteis",
        slug: "eletroportateis",
      },
      {
        name: "Cozinha Elétrica",
        slug: "cozinha-eletrica",
      },
      {
        name: "Climatização",
        slug: "climatizacao",
      },
      {
        name: "Limpeza",
        slug: "limpeza-eletrica",
      },
    ],
  },
  {
    name: "Moda & Acessórios",
    slug: "moda-acessorios",
    description: "Roupas, calçados, bolsas e acessórios para todos os estilos",
    subcategories: [
      {
        name: "Roupas",
        slug: "roupas",
      },
      {
        name: "Calçados",
        slug: "calcados",
      },
      {
        name: "Bolsas & Carteiras",
        slug: "bolsas-carteiras",
      },
      {
        name: "Meias & Underwear",
        slug: "meias-underwear",
      },
      {
        name: "Relógios & Joias",
        slug: "relogios-joias",
      },
      {
        name: "Acessórios",
        slug: "acessorios-moda",
      },
    ],
  },
  {
    name: "Beleza & Cuidados",
    slug: "saude-beleza",
    description: "Beleza, higiene, saúde e cuidados pessoais",
    subcategories: [
      { name: "Maquiagem", slug: "maquiagem" },
      {
        name: "Cuidados com a Pele",
        slug: "cuidados-com-a-pele",
      },
      {
        name: "Cuidados com o Cabelo",
        slug: "cabelos",
      },
      {
        name: "Perfumaria",
        slug: "perfumaria",
      },
      {
        name: "Saúde & Bem-estar",
        slug: "saude-bem-estar",
      },
    ],
  },
  {
    name: "Esporte & Fitness",
    slug: "esporte-fitness",
    description: "Produtos para treinos, esportes e uma rotina ativa",
    subcategories: [
      { name: "Musculação", slug: "musculacao" },
      { name: "Corrida", slug: "corrida" },
      { name: "Ciclismo", slug: "ciclismo" },
      {
        name: "Esportes",
        slug: "esportes",
      },
      {
        name: "Suplementos",
        slug: "suplementos",
      },
    ],
  },
  {
    name: "Utilidades & Ferramentas",
    slug: "utilidades",
    description:
      "Ferramentas, organização e produtos práticos para o dia a dia",
    subcategories: [
      {
        name: "Ferramentas",
        slug: "ferramentas",
      },
      {
        name: "Organizadores",
        slug: "organizadores",
      },
      {
        name: "Jardim",
        slug: "jardim",
      },
      {
        name: "Material Elétrico",
        slug: "material-eletrico",
      },
    ],
  },
  {
    name: "Automotivo",
    slug: "automotivo",
    description: "Acessórios, equipamentos e cuidados para veículos",
    subcategories: [
      {
        name: "Acessórios",
        slug: "acessorios-auto",
      },
      {
        name: "Som Automotivo",
        slug: "som-automotivo",
      },
      {
        name: "Limpeza e Cuidados",
        slug: "limpeza-automotiva",
      },
      {
        name: "Motos",
        slug: "motos",
      },
    ],
  },
  {
    name: "Pet Shop",
    slug: "pet-shop",
    description: "Alimentação, higiene e acessórios para animais",
    subcategories: [
      { name: "Cães", slug: "caes" },
      { name: "Gatos", slug: "gatos" },
      {
        name: "Alimentação",
        slug: "alimentacao-pet",
      },
      {
        name: "Higiene",
        slug: "higiene-pet",
      },
      {
        name: "Acessórios",
        slug: "acessorios-pet",
      },
    ],
  },
  {
    name: "Bebês & Crianças",
    slug: "bebes-criancas",
    description: "Cuidados, brinquedos e produtos para os pequenos",
    subcategories: [
      {
        name: "Cuidados com o Bebê",
        slug: "cuidados-bebe",
      },
      {
        name: "Brinquedos",
        slug: "brinquedos",
      },
      {
        name: "Roupas Infantis",
        slug: "roupas-infantis",
      },
      {
        name: "Passeio",
        slug: "passeio",
      },
    ],
  },
  {
    name: "Alimentos & Bebidas",
    slug: "alimentos-bebidas",
    description: "Alimentos, bebidas e produtos para sua despensa",
    subcategories: [
      {
        name: "Alimentos",
        slug: "alimentos",
      },
      {
        name: "Bebidas",
        slug: "bebidas",
      },
      {
        name: "Doces & Sobremesas",
        slug: "doces-sobremesas",
      },
      {
        name: "Mercearia",
        slug: "mercearia",
      },
      {
        name: "Café & Chás",
        slug: "cafe-chas",
      },
    ],
  },
];

const productSubcategoryMap = [
  {
    productName:
      "Perfume Asad Lataffa 100ml Eau De Parfum Original Edp",
    subcategorySlug: "perfumaria",
  },
  {
    productName:
      "Perfume Nautica Voyage Eau De Toilette Masculino 100ml",
    subcategorySlug: "perfumaria",
  },
  {
    productName:
      "Kit Shampoo E Condicionador 1l + Máscara 1kg Sos Hidratação com Óleo de Rícino Linha de Tratamento Cabelos Danificados",
    subcategorySlug: "cabelos",
  },
  {
    productName:
      "Meu Cacho Minha Vida Condicionador 500g , Lola Cosmetics",
    subcategorySlug: "cabelos",
  },
  {
    productName:
      "Creme Hidratante Acetinado L`eau De Lily Soleil Floral 200g O Boticario",
    subcategorySlug: "cuidados-com-a-pele",
  },
  {
    productName:
      "Principia Kit Completo Para Pele Sensível Com Fps 60",
    subcategorySlug: "cuidados-com-a-pele",
  },
  {
    productName:
      "Conjunto Mesa De Centro Para Sala Lateral Redonda Pés Palito",
    subcategorySlug: "moveis",
  },
  {
    productName:
      "Cadeira de Escritório Giratória HomeNow Columbus Presidente Preta com Tela Mesh",
    subcategorySlug: "moveis",
  },
  {
    productName:
      "Kit 4 Camisetas Canelada Americana Masculina Ribana Premium",
    subcategorySlug: "roupas",
  },
  {
    productName:
      "Polo Aramis Manga Curta Algodão Piquet Mescla Básica Branco",
    subcategorySlug: "roupas",
  },
  {
    productName:
      "Kit 6 Cuecas Lupo Boxer Box Sem Costura Basic Microfibra",
    subcategorySlug: "meias-underwear",
  },
  {
    productName:
      "Kit 10 Pares Meia Lupo Original Masculina Cano Médio Algodão",
    subcategorySlug: "meias-underwear",
  },
  {
    productName: "Camiseta Daily T-shirt Insider",
    subcategorySlug: "roupas",
  },
  {
    productName:
      "Kit 3 Camisetas Algodão Dia Dia Sandrini Básica Conforto",
    subcategorySlug: "roupas",
  },
];

async function main() {
  console.log("Iniciando seed de categorias...");

  for (const categoryData of categories) {
    const { subcategories, ...category } = categoryData;

    const savedCategory = await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        description: category.description,
      },
      create: category,
    });

    for (const subcategory of subcategories) {
      await prisma.subcategory.upsert({
        where: {
          categoryId_slug: {
            categoryId: savedCategory.id,
            slug: subcategory.slug,
          },
        },
        update: {
          name: subcategory.name,
        },
        create: {
          name: subcategory.name,
          slug: subcategory.slug,
          categoryId: savedCategory.id,
        },
      });
    }
  }

  // 2. Associa os produtos existentes às subcategorias
  console.log("Associando produtos às subcategorias...");

  for (const mapping of productSubcategoryMap) {
    const product = await prisma.product.findFirst({
      where: {
        name: mapping.productName,
      },
    });

    if (!product) {
      console.warn(
        `Produto não encontrado: ${mapping.productName}`,
      );
      continue;
    }

    const subcategory = await prisma.subcategory.findFirst({
      where: {
        slug: mapping.subcategorySlug,
        categoryId: product.categoryId,
      },
    });

    if (!subcategory) {
      console.warn(
        `Subcategoria não encontrada para "${mapping.productName}": ${mapping.subcategorySlug}`,
      );
      continue;
    }

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        subcategoryId: subcategory.id,
      },
    });

    console.log(
      `✓ ${product.name} -> ${subcategory.name}`,
    );
  }

  console.log("Associação de produtos concluída.");
  console.log("Seed de categorias concluído com sucesso.");
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });