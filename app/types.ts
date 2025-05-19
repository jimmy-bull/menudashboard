// Définition des types utilisés dans les composants de menu

export interface Gastronomie {
  id: number;
  nom: string;
}

export interface Menu {
  id: number;
  gastronomy: string;
  name: string;
  price_per_person: number;
  min_people: number;
  description: string;
}

export interface Categorie {
  id: number;
  nom: string;
}

export interface SousMenu {
  id: number;
  name: string;
  description: string;
  price: number;
  image_path: string;
  category: string;
  gastronomy: string;
}

export interface WeeklyItem {
  id: number;
  code: string;
  nom: string;
  description?: string;
  prix: number;
  categorie: string;
  vegetarien: boolean;
  epice: boolean;
}

export type FormValues = {
  name: string;
  gastronomy: string;
  price_per_person: number;
  min_people: number;
  description?: string;
};
