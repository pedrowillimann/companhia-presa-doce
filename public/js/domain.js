export const progressPercent = level => level == null ? 0 : Math.round((level - 1) / 49 * 100);
export function validateProgress(value, build) {
  if (!Number.isInteger(value.level) || value.level < 1 || value.level > 50) throw new Error('Informe um nível inteiro entre 1 e 50.');
  if (!Array.isArray(value.completed) || value.completed.length > build.checklistIds.length || new Set(value.completed).size !== value.completed.length || value.completed.some(id => !build.checklistIds.includes(id))) throw new Error('Checklist inválido para esta build.');
  if (!Number.isInteger(value.attributes) || value.attributes < 0 || value.attributes > 64) throw new Error('Informe entre 0 e 64 pontos de atributo.');
  if (typeof value.notes !== 'string' || value.notes.length > 2000) throw new Error('As anotações devem ter até 2.000 caracteres.');
  return value;
}
export function attributePoints(level) {let total=0;for(let n=2;n<=level;n++) total+=n%10===0?3:n%5===0?2:1;return total;}
export function canEdit(user, profile, assignment) { return !!user && (profile?.role === 'admin' || assignment?.ownerUid === user.uid); }
export const escapeHtml = text => String(text ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
