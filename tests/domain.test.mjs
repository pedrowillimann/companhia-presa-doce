import {test} from 'node:test';import assert from 'node:assert/strict';
import {validateProgress,progressPercent,attributePoints,canEdit,escapeHtml} from '../public/js/domain.js';
const build={checklistIds:['skill','goal']};const valid={level:27,attributes:30,completed:['skill'],notes:''};
test('progresso 1–50 e não informado',()=>{assert.equal(progressPercent(null),0);assert.equal(progressPercent(1),0);assert.equal(progressPercent(50),100);assert.equal(progressPercent(27),53);});
test('atributos preservam os 64 pontos do tracker',()=>{assert.equal(attributePoints(1),0);assert.equal(attributePoints(10),12);assert.equal(attributePoints(50),64);});
test('rejeita níveis inválidos, objetivos alheios, duplicados e conteúdo excessivo',()=>{for(const patch of [{level:0},{level:51},{level:2.5},{completed:['foreign']},{completed:['skill','skill']},{attributes:65},{notes:'x'.repeat(2001)}])assert.throws(()=>validateProgress({...valid,...patch},build));assert.deepEqual(validateProgress(valid,build),valid);});
test('edição exige conta vinculada ou administrador',()=>{assert.equal(canEdit(null,{role:'admin'},null),false);assert.equal(canEdit({uid:'a'},{role:'player'},{ownerUid:'b'}),false);assert.equal(canEdit({uid:'a'},{role:'player'},{ownerUid:'a'}),true);assert.equal(canEdit({uid:'a'},{role:'admin'},null),true);});
test('texto de usuário é escapado',()=>assert.equal(escapeHtml('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;'));
