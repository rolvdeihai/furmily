export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  image: string;
  badge?: string;
}

export const products: Product[] = [
  // === FREEZE DRIED TREATS (Protein) ===
  {
    id: '1',
    name: 'Duck Freeze Dried',
    category: 'Freeze Dried',
    description: 'Bebek freeze dried 100% alami, kaya protein untuk kucing & anjing.',
    price: 'Rp 99.000',
    image: '/images/duck-freeze-dried.jpg',
    badge: 'Best Seller',
  },
  {
    id: '2',
    name: 'Salmon Freeze Dried',
    category: 'Freeze Dried',
    description: 'Salmon segar beku kering, kaya Omega-3 untuk kulit & bulu sehat.',
    price: 'Rp 139.000',
    image: '/images/salmon-freeze-dried.jpg',
    badge: 'Premium',
  },
  {
    id: '3',
    name: 'Chicken Freeze Dried',
    category: 'Freeze Dried',
    description: 'Ayam pilihan freeze dried, camilan sehat favorit hewan peliharaan.',
    price: 'Rp 99.000',
    image: '/images/chicken-freeze-dried.jpg',
  },
  {
    id: '4',
    name: 'Cod Fish Freeze Dried',
    category: 'Freeze Dried',
    description: 'Ikan cod kaya protein, rendah lemak, baik untuk diet sehat.',
    price: 'Rp 99.000',
    image: '/images/cod-fish-freeze-dried.jpg',
  },
  {
    id: '5',
    name: 'Shishamo Freeze Dried',
    category: 'Freeze Dried',
    description: 'Ikan shishamo utuh dengan telur, kaya kalsium dan nutrisi.',
    price: 'Rp 99.000',
    image: '/images/shishamo-freeze-dried.jpg',
  },
  {
    id: '6',
    name: 'Beef Freeze Dried',
    category: 'Freeze Dried',
    description: 'Daging sapi premium freeze dried, 100% bahan alami tanpa pengawet.',
    price: 'Rp 139.000',
    image: '/images/beef-freeze-dried.jpg',
  },
  {
    id: '7',
    name: 'Egg Yolk Freeze Dried',
    category: 'Freeze Dried',
    description: 'Kuning telur kaya lesitin untuk kesehatan kulit & bulu mengkilap.',
    price: 'Rp 99.000',
    image: '/images/egg-yolk-freeze-dried.jpg',
  },
  {
    id: '8',
    name: 'Goat Milk Freeze Dried',
    category: 'Freeze Dried',
    description: 'Susu kambing bubuk freeze dried, sumber probiotik alami.',
    price: 'Rp 99.000',
    image: '/images/goat-milk-freeze-dried.jpg',
  },
  {
    id: '9',
    name: 'Yogurt Cube Freeze Dried',
    category: 'Freeze Dried',
    description: 'Yogurt cube dengan strawberry & blueberry, 100% natural.',
    price: 'Rp 99.000',
    image: '/images/yogurt-cube-freeze-dried.jpg',
  },

  // === FOOD TOPPERS ===
  {
    id: '10',
    name: 'Skin & Coat Food Topper',
    category: 'Food Topper',
    description: 'Meningkatkan kesehatan kulit dan bulu, 100% alami.',
    price: 'Rp 169.000',
    image: '/images/skin-coat-topper.jpg',
    badge: 'Popular',
  },
  {
    id: '11',
    name: 'Tummy Care Food Topper',
    category: 'Food Topper',
    description: 'Menjaga kesehatan pencernaan dengan probiotik alami.',
    price: 'Rp 149.000',
    image: '/images/tummy-care-topper.jpg',
  },
  {
    id: '12',
    name: 'Berry Glow Food Topper',
    category: 'Food Topper',
    description: 'Kaya antioksidan dari berry, meningkatkan vitalitas.',
    price: 'Rp 169.000',
    image: '/images/berry-glow-topper.jpg',
  },
  {
    id: '13',
    name: 'Muscle Growth Food Topper',
    category: 'Food Topper',
    description: 'Protein tinggi untuk pertumbuhan otot dan energi.',
    price: 'Rp 169.000',
    image: '/images/muscle-growth-topper.jpg',
  },

  // === SUPPLEMENTS ===
  {
    id: '14',
    name: 'Fish Oil for Cats',
    category: 'Supplements',
    description: 'Minyak ikan dengan 92% Omega-3 untuk kulit & bulu kucing.',
    price: 'Rp 149.000',
    image: '/images/fish-oil-cat.jpg',
    badge: 'Terjual Tinggi',
  },
  {
    id: '15',
    name: 'Fish Oil for Dogs',
    category: 'Supplements',
    description: 'Minyak ikan dengan 92% Omega-3 untuk kulit & bulu anjing.',
    price: 'Rp 149.000',
    image: '/images/fish-oil-dog.jpg',
  },
];