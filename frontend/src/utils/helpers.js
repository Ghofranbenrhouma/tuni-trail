export function diffClass(diff) {
  if (diff === 'Facile') return 'diff-easy'
  if (diff === 'Modéré') return 'diff-mod'
  return 'diff-hard'
}

export function statusClass(st) {
  if (st === 'confirmed') return 'sb-ok'
  if (st === 'pending') return 'sb-wait'
  if (st === 'cancelled') return 'sb-cancel'
  return 'sb-draft'
}

export function statusLabel(st) {
  if (st === 'confirmed') return 'Confirmé'
  if (st === 'pending') return 'En attente'
  if (st === 'cancelled') return 'Annulé'
  return 'Brouillon'
}

export function generateRef() {
  return '#TT-' + Date.now().toString().slice(-6)
}
