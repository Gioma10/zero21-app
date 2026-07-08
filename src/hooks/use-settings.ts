import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

// Impostazioni di piattaforma (riga singleton id='global' in platform_settings).
// Il costo di consegna è UNICO per tutta la piattaforma e lo gestisce l'admin:
// qui lo leggiamo in sola lettura (policy pubblica sulla tabella).

async function fetchDeliveryFee(): Promise<number> {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("delivery_fee")
    .eq("id", "global")
    .maybeSingle<{ delivery_fee: number }>();

  if (error) throw error;
  const fee = data?.delivery_fee;
  return typeof fee === "number" && Number.isFinite(fee) && fee >= 0 ? fee : 0;
}

// Costo di consegna corrente (euro). Cache condivisa: una sola fetch per l'app.
export function useDeliveryFee() {
  return useQuery({
    queryKey: ["delivery-fee"],
    queryFn: fetchDeliveryFee,
  });
}
