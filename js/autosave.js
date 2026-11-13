// persistence は他モジュールより後に初期化されるため、参照を後から結び付ける
let persistence = null;

/** @param {{ autoSave: () => void }} api */
export function bindPersistence(api) {
  persistence = api;
}

export function autoSave() {
  persistence?.autoSave();
}
