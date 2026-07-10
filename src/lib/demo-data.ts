export type Orientation = "PORTRAIT" | "LANDSCAPE" | "SQUARE";

export type CategoryView = {
  id: string;
  slug: string;
  name: string;
  groupName?: string | null;
  description: string;
  icon: string;
};

export type DuelImageView = {
  id: string;
  title: string;
  imageUrl: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  orientation: Orientation;
  rating: number;
  wins: number;
  losses: number;
  appearances: number;
};

type CategorySeed = CategoryView & {
  queryTags: string[];
};

const categorySeeds: CategorySeed[] = [
  niche("natureza-florestas", "Florestas", "Natureza", "Florestas densas, trilhas e copas verdes.", "TreePine", ["forest", "trees", "nature"]),
  niche("natureza-arvores", "Arvores", "Natureza", "Arvores, troncos, copas e bosques.", "TreePine", ["tree", "forest", "nature"]),
  niche("natureza-montanhas", "Montanhas", "Natureza", "Picos, vales e paisagens de altitude.", "Mountain", ["mountain", "landscape", "nature"]),
  niche("natureza-cachoeiras", "Cachoeiras", "Natureza", "Agua em movimento, quedas e rochas.", "Waves", ["waterfall", "nature", "river"]),
  niche("natureza-praias", "Praias naturais", "Natureza", "Areia, mar e horizontes abertos.", "Waves", ["beach", "ocean", "nature"]),
  niche("natureza-desertos", "Desertos", "Natureza", "Dunas, sol forte e paisagens secas.", "Sun", ["desert", "dunes", "nature"]),
  niche("natureza-lagos", "Lagos", "Natureza", "Agua calma, reflexos e margens naturais.", "Waves", ["lake", "nature", "landscape"]),
  niche("natureza-plantas", "Plantas", "Natureza", "Folhas, vasos, texturas e verde de perto.", "Leaf", ["plants", "leaves", "botanical"]),
  niche("natureza-flores", "Flores", "Natureza", "Petalas, jardins e cores naturais.", "Flower2", ["flowers", "garden", "botanical"]),
  niche("natureza-macro", "Natureza macro", "Natureza", "Detalhes pequenos de folhas, agua e texturas.", "ScanSearch", ["macro", "nature", "plants"]),
  niche("fotos-natureza", "Fotos da natureza", "Natureza", "Paisagens naturais variadas para duelos livres.", "Images", ["nature", "landscape", "wild"]),

  niche("animais-gatos", "Gatos", "Animais", "Gatos domesticos em poses e expressoes fortes.", "Cat", ["cat", "kitten", "pet"]),
  niche("animais-cachorros", "Cachorros", "Animais", "Caes de varios portes, racas e estilos.", "Dog", ["dog", "puppy", "pet"]),
  niche("animais-peixes", "Peixes", "Animais", "Aquarios, peixes tropicais e cores submersas.", "Fish", ["fish", "aquarium", "underwater"]),
  niche("animais-calopsitas", "Calopsitas", "Animais", "Calopsitas e aves pequenas de companhia.", "Bird", ["cockatiel", "bird", "parrot"]),
  niche("aves", "Aves", "Animais", "Aves de varios tipos, cores e habitats.", "Bird", ["bird", "wildlife", "nature"]),
  niche("animais-passaros", "Passaros", "Animais", "Aves urbanas, selvagens e coloridas.", "Bird", ["bird", "wildlife", "feathers"]),
  niche("animais-felinos", "Felinos selvagens", "Animais", "Leoes, tigres, leopardos e grandes felinos.", "Cat", ["lion", "tiger", "wildcat"]),
  niche("animais-cavalos", "Cavalos", "Animais", "Cavalos em campo, pista e retratos.", "Badge", ["horse", "equestrian", "animal"]),
  niche("animais-coelhos", "Coelhos", "Animais", "Coelhos, filhotes e cenas delicadas.", "Badge", ["rabbit", "bunny", "animal"]),
  niche("animais-marinhos", "Animais marinhos", "Animais", "Tartarugas, golfinhos, peixes e vida oceanica.", "Fish", ["marine", "sea", "animal"]),
  niche("animais-insetos", "Insetos", "Animais", "Insetos, asas, antenas e macrofotografia.", "Bug", ["insect", "butterfly", "macro"]),

  niche("casas-praia", "Casas de praia", "Arquitetura", "Casas claras, varandas e clima litoraneo.", "Home", ["beach", "house", "architecture"]),
  niche("casas-campo", "Casas de campo", "Arquitetura", "Cabanas, fazendas e refugios rurais.", "Home", ["country", "house", "cottage"]),
  niche("casas-modernas", "Casas modernas", "Arquitetura", "Fachadas limpas, vidro e interiores atuais.", "Home", ["modern", "house", "architecture"]),
  niche("cidades", "Fotos de cidades", "Fotografia", "Ruas, skylines, predios e luz urbana.", "Building2", ["city", "street", "architecture"]),

  niche("roupas-biquinis", "Biquinis", "Roupas", "Moda praia, estampas e cortes de biquini.", "Shirt", ["bikini", "swimwear", "fashion"]),
  niche("roupas-jaquetas", "Jaquetas", "Roupas", "Jaquetas casuais, couro, frio e streetwear.", "Shirt", ["jacket", "fashion", "clothing"]),
  niche("roupas-maios", "Maios", "Roupas", "Maios, moda praia e looks de piscina.", "Shirt", ["swimsuit", "swimwear", "fashion"]),
  niche("roupas-vestidos", "Vestidos", "Roupas", "Vestidos casuais, festa e editoriais.", "Shirt", ["dress", "fashion", "clothing"]),
  niche("ternos", "Ternos", "Roupas", "Alfaiataria, cortes formais e combinacoes.", "BriefcaseBusiness", ["suit", "menswear", "fashion"]),
  niche("gravatas", "Gravatas", "Roupas", "Gravatas, padroes e detalhes formais.", "Badge", ["tie", "menswear", "fashion"]),
  niche("moda-praia-infantil", "Moda praia infantil", "Roupas", "Pecas infantis de praia, cores e protecao solar.", "Shirt", ["kids", "swimwear", "beachwear"]),
  niche("moda-praia-adulto", "Moda praia adulto", "Roupas", "Moda praia adulta, praia, piscina e resort.", "Shirt", ["adult", "swimwear", "beachwear"]),
  niche("moda-inverno-adulto", "Moda inverno adulto", "Roupas", "Casacos, camadas e looks adultos de frio.", "Shirt", ["winter", "adult", "fashion"]),

  niche("aneis", "Aneis", "Acessorios", "Aneis, joias, metais e pedras.", "Gem", ["ring", "jewelry", "gold"]),
  niche("sandalias", "Sandalias", "Acessorios", "Sandalias, tiras, couro e looks leves.", "Footprints", ["sandals", "shoes", "fashion"]),
  niche("calcados", "Calcados", "Acessorios", "Tenis, botas, sapatos e detalhes de calcado.", "Footprints", ["shoes", "sneakers", "fashion"]),
  niche("relogios", "Relogios", "Acessorios", "Relogios analogicos, esportivos e luxuosos.", "Watch", ["watch", "wristwatch", "accessory"]),

  niche("facas", "Facas", "Objetos", "Facas, laminas, cozinha e cutelaria.", "Utensils", ["knife", "blade", "kitchen"]),
  niche("motos", "Motos", "Veiculos", "Motos urbanas, custom, esporte e estrada.", "Bike", ["motorcycle", "bike", "vehicle"]),
  niche("bicicletas", "Bicicletas", "Veiculos", "Bikes urbanas, estrada, trilha e lifestyle.", "Bike", ["bicycle", "cycling", "bike"]),
  niche("carros", "Carros", "Veiculos", "Carros classicos, esportivos e urbanos.", "Car", ["car", "automobile", "vehicle"]),
  niche("espaco", "Fotos do espaco", "Fotografia", "Galaxias, estrelas, planetas e ceu profundo.", "Rocket", ["space", "stars", "galaxy"]),
];

export const demoCategories: CategoryView[] = categorySeeds.map((category) => ({
  id: category.id,
  slug: category.slug,
  name: category.name,
  groupName: category.groupName,
  description: category.description,
  icon: category.icon,
}));

export const demoImages: DuelImageView[] = categorySeeds.flatMap((category, index) =>
  makeImagesForCategory(category, index + 1),
);

function niche(
  slug: string,
  name: string,
  groupName: string,
  description: string,
  icon: string,
  queryTags: string[],
): CategorySeed {
  return {
    id: `cat-${slug}`,
    slug,
    name,
    groupName,
    description,
    icon,
    queryTags,
  };
}

function makeImagesForCategory(category: CategorySeed, categoryIndex: number) {
  const orientations: Orientation[] = [
    "PORTRAIT",
    "PORTRAIT",
    "PORTRAIT",
    "PORTRAIT",
    "PORTRAIT",
    "PORTRAIT",
    "PORTRAIT",
    "PORTRAIT",
    "LANDSCAPE",
    "LANDSCAPE",
    "LANDSCAPE",
    "LANDSCAPE",
    "LANDSCAPE",
    "LANDSCAPE",
    "LANDSCAPE",
    "LANDSCAPE",
    "SQUARE",
    "SQUARE",
    "SQUARE",
    "SQUARE",
    "SQUARE",
    "SQUARE",
    "SQUARE",
    "SQUARE",
  ];

  return orientations.map((orientation, itemIndex) =>
    image(category, orientation, categoryIndex, itemIndex + 1),
  );
}

function image(
  category: CategorySeed,
  orientation: Orientation,
  categoryIndex: number,
  itemIndex: number,
): DuelImageView {
  const width =
    orientation === "PORTRAIT" ? 900 : orientation === "SQUARE" ? 1000 : 1400;
  const height =
    orientation === "PORTRAIT" ? 1300 : orientation === "SQUARE" ? 1000 : 900;
  const seed = categoryIndex * 1000 + itemIndex;
  const rating = 1130 + ((seed * 37) % 190);
  const query = category.queryTags.map(encodeURIComponent).join(",");

  return {
    id: `${category.slug}-${itemIndex}`,
    title: `${category.name} #${itemIndex}`,
    imageUrl: `https://loremflickr.com/${width}/${height}/${query}?lock=${seed}`,
    categoryId: category.id,
    categorySlug: category.slug,
    categoryName: category.name,
    orientation,
    rating,
    wins: Math.max(0, Math.round((rating - 1120) / 18)),
    losses: Math.max(0, Math.round((1260 - rating) / 22)),
    appearances: 18,
  };
}
