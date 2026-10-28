/** Nombre corto en español de cada apertura o variante de la base (para la lista y la ficha de los bots). */
export const NOMBRES_APERTURAS: Record<string, string> = {
  italiana: 'Italiana',
  abierta: '1...e5',
  'abierta:escocesa': 'Escocesa',
  'abierta:espanola': 'Española',
  'abierta:vienesa': 'Vienesa',
  'abierta:dama': 'Ataque de la dama',
  'caro-kann': 'Caro-Kann',
  'caro-kann:avance': 'Caro-Kann: Avance',
  'caro-kann:clasica': 'Caro-Kann: Clásica',
  'caro-kann:cambio': 'Caro-Kann: Cambio',
  'caro-kann:dos-caballos': 'Caro-Kann: Dos Caballos',
  francesa: 'Francesa',
  escandinava: 'Escandinava',
  'siciliana-alapin': 'Siciliana (Alapin)',
  eslava: 'Eslava',
  'gambito-dama': 'Gambito de Dama',
  'gambito-dama-declinado': 'Gambito de Dama Declinado',
  'gambito-dama-aceptado': 'Gambito de Dama Aceptado',
  londres: 'Sistema Londres',
  'otros-negras:inglesa': 'Inglesa (1.c4)',
  'otros-negras:reti': 'Réti (1.Cf3)',
  'otros-negras:larsen': 'Larsen (1.b3)',
}

export const nombreApertura = (id: string) => NOMBRES_APERTURAS[id] ?? id
