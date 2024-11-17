export interface RecipeItem {
  part: string;
  amount: number;
  perMin: number;
  isByProduct?: boolean;
}

export interface Recipe {
  id: string;
  displayName: string;
  ingredients: RecipeItem[];
  products: RecipeItem[];
  building: {
    name: string;
    power: number;
  }
  isAlternate: boolean;
  isFicsmas: boolean;
}
