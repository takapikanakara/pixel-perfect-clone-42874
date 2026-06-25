import sharkVacuum from "@/assets/shark-vacuum.png.asset.json";
import ninjaSlushi from "@/assets/ninja-slushi.webp.asset.json";
import sharkFlexbreeze from "@/assets/shark-flexbreeze.jpg.asset.json";
import roomba from "@/assets/roomba-105.jpg.asset.json";

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
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
