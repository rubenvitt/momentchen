// src/stronghold.ts
import {appDataDir} from "@tauri-apps/api/path";
import {Client, Store, Stronghold} from "@tauri-apps/plugin-stronghold";

const VAULT_PASSWORD_KEY = 'vault_password';

async function generateSecurePassword(): Promise<string> {
    // Generiere 32 Bytes (256 Bit) zufällige Daten
    const randomData = crypto.getRandomValues(new Uint8Array(32));
    // Konvertiere zu Base64 für bessere Handhabung
    return btoa(String.fromCharCode(...randomData));
}

async function getOrCreateVaultPassword(): Promise<string> {
    try {
        // Versuche das Passwort aus dem localStorage zu lesen
        const storedPassword = localStorage.getItem(VAULT_PASSWORD_KEY);
        if (storedPassword) {
            return storedPassword;
        }

        // Wenn kein Passwort existiert, generiere ein neues
        const newPassword = await generateSecurePassword();
        localStorage.setItem(VAULT_PASSWORD_KEY, newPassword);
        return newPassword;
    } catch (error) {
        console.error('Error managing vault password:', error);
        throw error;
    }
}

export const initStronghold = async () => {
    const vaultPath = `${await appDataDir()}/vault.hold`;
    const vaultPassword = await getOrCreateVaultPassword();

    const stronghold = await Stronghold.load(vaultPath, vaultPassword);
    return initStrongholdClient(stronghold);
};

async function initStrongholdClient(stronghold: Stronghold) {
    let client: Client;
    const clientName = "momentchen";

    try {
        client = await stronghold.loadClient(clientName);
    } catch (e) {
        client = await stronghold.createClient(clientName);
    }

    return {
        stronghold,
        client,
    };
}

export async function insertRecord(store: Store, key: string, value: string) {
    const data = Array.from(new TextEncoder().encode(value));
    await store.insert(key, data);
}

export async function getRecord(store: Store, key: string): Promise<string> {
    const data = await store.get(key);
    return new TextDecoder().decode(new Uint8Array(data ?? []));
}

export async function removeRecord(store: Store, key: string) {
    await store.remove(key);
}

export async function saveStronghold(stronghold: Stronghold) {
    await stronghold.save();
}