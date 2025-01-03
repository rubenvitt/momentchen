interface StorageAdapter {
    getItem(key: string): Promise<string | null>;

    setItem(key: string, value: string): Promise<void>;

    removeItem(key: string): Promise<void>;
}

class BrowserStorageAdapter implements StorageAdapter {
    async getItem(key: string): Promise<string | null> {
        return localStorage.getItem(key);
    }

    async setItem(key: string, value: string): Promise<void> {
        localStorage.setItem(key, value);
    }

    async removeItem(key: string): Promise<void> {
        localStorage.removeItem(key);
    }
}

// class StrongholdStorageAdapter implements StorageAdapter {
//     async getItem(key: string): Promise<string | null> {
//         try {
//             const {client} = await initStronghold();
//             return await getRecord(client.getStore(), key);
//         } catch (error) {
//             console.error('Error reading from Stronghold:', error);
//             return null;
//         }
//     }
//
//     async setItem(key: string, value: string): Promise<void> {
//         const {stronghold, client} = await initStronghold();
//         await insertRecord(client.getStore(), key, value);
//         await saveStronghold(stronghold);
//     }
//
//     async removeItem(key: string): Promise<void> {
//         const {stronghold, client} = await initStronghold();
//         await client.getStore().remove(key);
//         await saveStronghold(stronghold);
//     }
// }

let storageAdapter: StorageAdapter;

export async function initStorage(): Promise<StorageAdapter> {
    if (storageAdapter) {
        return storageAdapter;
    }

    // Prüfe, ob wir in einer Tauri-Umgebung sind
    // if (isTauri()) {
    // storageAdapter = new StrongholdStorageAdapter();
    // console.log('Using Stronghold storage');
    // } else {
    storageAdapter = new BrowserStorageAdapter();
    console.log('Using browser storage');
    // }

    return storageAdapter;
}