// persistence は他モジュールより後に初期化されるため、参照を後から結び付ける
/** @type {{ autoSave: () => void, serializeSave: () => string } | null} */
let persistence = null;

/** @param {{ autoSave: () => void, serializeSave: () => string }} api */
export function bindPersistence(api) {
  persistence = api;
}

export function autoSave() {
  persistence?.autoSave();
}

/** 現在のシーンの base64 セーブコード（エクスポートと同じ形式。b6.py への入力にも使う） */
export function getSaveCode() {
  if (!persistence) throw new Error('persistence が初期化されていません');
  return persistence.serializeSave();
}
