export interface VocabItem {
  word: string;
  wordPT: string;
  emoji: string;
  color?: string;
}

export interface VocabLevel {
  id: number;
  name: string;
  namePT: string;
  color: string;
  items: VocabItem[];
}

export const vocabulary: VocabLevel[] = [
  {
    id: 1,
    name: 'Colors',
    namePT: 'Cores',
    color: '#FF6B6B',
    items: [
      { word: 'red', wordPT: 'vermelho', emoji: '🔴', color: '#EF4444' },
      { word: 'blue', wordPT: 'azul', emoji: '🔵', color: '#3B82F6' },
      { word: 'yellow', wordPT: 'amarelo', emoji: '🟡', color: '#EAB308' },
      { word: 'green', wordPT: 'verde', emoji: '🟢', color: '#22C55E' },
      { word: 'orange', wordPT: 'laranja', emoji: '🟠', color: '#F97316' },
    ],
  },
  {
    id: 2,
    name: 'Animals',
    namePT: 'Animais',
    color: '#4ECDC4',
    items: [
      { word: 'dog', wordPT: 'cachorro', emoji: '🐶' },
      { word: 'cat', wordPT: 'gato', emoji: '🐱' },
      { word: 'bird', wordPT: 'pássaro', emoji: '🐦' },
      { word: 'duck', wordPT: 'pato', emoji: '🦆' },
      { word: 'cow', wordPT: 'vaca', emoji: '🐮' },
      { word: 'pig', wordPT: 'porco', emoji: '🐷' },
    ],
  },
  {
    id: 3,
    name: 'Fruits',
    namePT: 'Frutas',
    color: '#FFE66D',
    items: [
      { word: 'apple', wordPT: 'maçã', emoji: '🍎' },
      { word: 'banana', wordPT: 'banana', emoji: '🍌' },
      { word: 'orange', wordPT: 'laranja', emoji: '🍊' },
      { word: 'strawberry', wordPT: 'morango', emoji: '🍓' },
      { word: 'grape', wordPT: 'uva', emoji: '🍇' },
    ],
  },
  {
    id: 4,
    name: 'Numbers',
    namePT: 'Números',
    color: '#A78BFA',
    items: [
      { word: 'one', wordPT: 'um', emoji: '1️⃣' },
      { word: 'two', wordPT: 'dois', emoji: '2️⃣' },
      { word: 'three', wordPT: 'três', emoji: '3️⃣' },
      { word: 'four', wordPT: 'quatro', emoji: '4️⃣' },
      { word: 'five', wordPT: 'cinco', emoji: '5️⃣' },
      { word: 'six', wordPT: 'seis', emoji: '6️⃣' },
      { word: 'seven', wordPT: 'sete', emoji: '7️⃣' },
      { word: 'eight', wordPT: 'oito', emoji: '8️⃣' },
      { word: 'nine', wordPT: 'nove', emoji: '9️⃣' },
      { word: 'ten', wordPT: 'dez', emoji: '🔟' },
    ],
  },
  {
    id: 5,
    name: 'Home Objects',
    namePT: 'Objetos da Casa',
    color: '#FB923C',
    items: [
      { word: 'ball', wordPT: 'bola', emoji: '⚽' },
      { word: 'book', wordPT: 'livro', emoji: '📚' },
      { word: 'doll', wordPT: 'boneca', emoji: '🪆' },
      { word: 'car', wordPT: 'carrinho', emoji: '🚗' },
      { word: 'cup', wordPT: 'xícara', emoji: '☕' },
      { word: 'plate', wordPT: 'prato', emoji: '🍽️' },
      { word: 'chair', wordPT: 'cadeira', emoji: '🪑' },
    ],
  },
];
