import VaultHeader    from "@/components/vault/VaultHeader";
import VaultClient    from "@/components/vault/VaultClient";

export default function VaultPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <VaultHeader />
      <VaultClient />
    </div>
  );
}
