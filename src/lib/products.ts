import sharkVacuum from "@/assets/shark-vacuum.png.asset.json";
import ninjaSlushi from "@/assets/ninja-slushi.webp.asset.json";
import sharkFlexbreeze from "@/assets/shark-flexbreeze.jpg.asset.json";
import roomba from "@/assets/roomba-105.jpg.asset.json";
import switch2 from "@/assets/switch2-mariokart.webp.asset.json";
import album from "@/assets/album-mundial-2026.png.asset.json";
import parafusadeira from "@/assets/parafusadeira-48v.png.asset.json";

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  price: number;
  oldPrice: number;
  image: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "shark",
    slug: "shark-aspirador-de-maos",
    name: "Shark Aspirador de Mão sem Fios, Leve e Portátil, com 600 g",
    shortName: "Shark Aspirador de Mão",
    price: 97.9,
    oldPrice: 355,
    image: sharkVacuum.url,
  },
  {
    id: "ninja-slushi",
    slug: "maquina-de-granizados-ninja-slushi",
    name: "Máquina de Granizados Ninja SLUSHi — Bebidas Geladas em Casa",
    shortName: "Ninja SLUSHi",
    price: 109.9,
    oldPrice: 285,
    image: ninjaSlushi.url,
  },
  {
    id: "shark-flexbreeze",
    slug: "shark-ventoinha-flexbreeze-hydrogo",
    name: "Shark Ventoinha de Chão FLEXBREEZE HydroGo — Portátil sem Fios",
    shortName: "Shark FLEXBREEZE HydroGo",
    price: 39,
    oldPrice: 113.91,
    image: sharkFlexbreeze.url,
  },
  {
    id: "roomba-105",
    slug: "aspirador-robo-irobot-roomba-105-combo",
    name: "Aspirador Robô IROBOT Roomba 105 Combo (Autonomia: 120 min - Preto)",
    shortName: "iRobot Roomba 105 Combo",
    price: 39,
    oldPrice: 149.99,
    image: roomba.url,
  },
  {
    id: "switch2-mariokart",
    slug: "consola-nintendo-switch-2-mario-kart-world",
    name: "Consola Nintendo Switch 2 + Jogo Mario Kart World (Código de Descarga na Caixa)",
    shortName: "Nintendo Switch 2 + Mario Kart World",
    price: 139.9,
    oldPrice: 489.99,
    image: switch2.url,
  },
  {
    id: "album-mundial-2026",
    slug: "album-mundial-2026-50-cromos",
    name: "Álbum Mundial 2026 + 50 Cromos",
    shortName: "Álbum Mundial 2026 + 50 Cromos",
    price: 49.9,
    oldPrice: 75,
    image: album.url,
  },
  {
    id: "parafusadeira-48v",
    slug: "parafusadeira-furadeira-48v-yuyango4",
    name: "Parafusadeira Furadeira 48V 2 Baterias Com Maleta e Acessórios Completo-Yuyango4",
    shortName: "Parafusadeira 48V + Maleta",
    price: 97.9,
    oldPrice: 435.6,
    image: parafusadeira.url,
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
