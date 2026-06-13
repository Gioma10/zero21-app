// Polyfill necessario: alcune API web (URL) usate da supabase-js
// non sono complete in React Native. Va importato PRIMA di supabase-js.
import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";

// Le chiavi arrivano da .env.local. Il prefisso EXPO_PUBLIC_ dice a Expo
// di renderle leggibili nell'app (vengono "iniettate" nel bundle JS).
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Il client: lo importeremo ovunque serva parlare col database.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Niente login per ora → nessuna sessione da salvare su disco.
    // Quando aggiungeremo l'autenticazione, qui metteremo lo storage.
    persistSession: false,
  },
});
