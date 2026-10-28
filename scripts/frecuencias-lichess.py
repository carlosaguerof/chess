"""
Frecuencias reales de cada jugada a mi nivel, de la base de partidas abierta de lichess (CC0, database.lichess.org).

Uso:
  zstd -dc <parte>.pgn.zst 2>/dev/null | python3 -I scripts/frecuencias-lichess.py --mes 2026-09 --bytes 629145600 > conocimiento/frecuencias/rapid-600-1000.json

Cuenta solo partidas "Rated Rapid game" con los DOS jugadores entre 600 y 1000 de rating (lichess).
Guarda, para cada secuencia de jugadas desde el inicio (hasta 24 medias jugadas, en SAN inglés), cuántas partidas pasaron por ahí.
Solo se guardan secuencias con al menos 3 partidas.
"""
import sys, re, json, argparse
from collections import Counter

ap = argparse.ArgumentParser()
ap.add_argument('--mes', required=True)
ap.add_argument('--bytes', required=True, type=int, help='cuántos bytes comprimidos se leyeron del archivo del mes')
ap.add_argument('--min', type=int, default=600)
ap.add_argument('--max', type=int, default=1000)
ap.add_argument('--plies', type=int, default=24)
ap.add_argument('--minimo', type=int, default=3)
a = ap.parse_args()

COMENTARIO = re.compile(r'\{[^}]*\}')
NUMERO = re.compile(r'^\d+\.(\.\.)?$')
RESULTADOS = {'1-0', '0-1', '1/2-1/2', '*'}

conteo = Counter()
total_partidas = 0
rapid = 0
usadas = 0
cab = {}
movimientos = []
en_jugadas = False

def cerrar():
    global usadas
    if not cab:
        return
    if cab.get('Event') != 'Rated Rapid game':
        return
    try:
        bw, bn = int(cab.get('WhiteElo', '0')), int(cab.get('BlackElo', '0'))
    except ValueError:
        return
    if not (a.min <= bw <= a.max and a.min <= bn <= a.max):
        return
    texto = COMENTARIO.sub(' ', ' '.join(movimientos))
    sanes = [t for t in texto.split() if not NUMERO.match(t) and t not in RESULTADOS]
    sanes = [s.rstrip('?!') for s in sanes][: a.plies]
    usadas += 1
    for i in range(1, len(sanes) + 1):
        conteo[' '.join(sanes[:i])] += 1
    conteo[''] += 1

for linea in sys.stdin:
    linea = linea.rstrip('\n')
    if linea.startswith('[Event '):
        if cab:
            if cab.get('Event') == 'Rated Rapid game':
                rapid += 1
            cerrar()
        total_partidas += 1
        cab = {}
        movimientos = []
        en_jugadas = False
    if linea.startswith('['):
        m = re.match(r'\[(\w+) "(.*)"\]', linea)
        if m:
            cab[m.group(1)] = m.group(2)
    elif linea.strip():
        movimientos.append(linea)
# la última partida puede venir cortada (el archivo se leyó a medias): no se cuenta
salida = {
    'fuente': 'https://database.lichess.org/ (CC0), archivo lichess_db_standard_rated_%s.pgn.zst' % a.mes,
    'leido': 'primeros %d bytes comprimidos' % a.bytes,
    'filtro': 'Rated Rapid game, los dos jugadores con rating lichess entre %d y %d' % (a.min, a.max),
    'partidasLeidas': total_partidas,
    'partidasRapid': rapid,
    'partidasUsadas': usadas,
    'mediasJugadasMax': a.plies,
    'minimoPorSecuencia': a.minimo,
    'conteo': {k: v for k, v in conteo.items() if v >= a.minimo},
}
json.dump(salida, sys.stdout, ensure_ascii=False, separators=(',', ':'))
