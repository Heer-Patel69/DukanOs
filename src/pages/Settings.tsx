import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { User, Bell, Palette, Database, HelpCircle, ChevronRight, Save, LogOut, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useStoreProfile } from "@/hooks/use-offline-store";
import { useSales } from "@/hooks/use-offline-store";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { profile, save } = useStoreProfile();
  const { items: sales } = useSales();
  const [showProfile, setShowProfile] = useState(true);
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    address: profile?.address ?? "",
    city: profile?.city ?? "",
    phone: profile?.phone ?? "",
    whatsapp: profile?.whatsapp ?? "",
    gstin: (profile as { gstin?: string })?.gstin ?? "",
    mapsUrl: (profile as { mapsUrl?: string })?.mapsUrl ?? "",
  });

  const saveProfile = async () => {
    await save({
      id: "default",
      name: form.name || "My Business",
      slug: (form.name || "my-business").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      address: form.address,
      city: form.city,
      phone: form.phone,
      whatsapp: form.whatsapp || form.phone,
      categories: profile?.categories ?? [],
      isOpen: true,
      // Phase 0 additions, stored alongside legacy schema
      ...(form.gstin ? { gstin: form.gstin } : {}),
      ...(form.mapsUrl ? { mapsUrl: form.mapsUrl } : {}),
    } as Parameters<typeof save>[0]);
    toast.success("Business profile saved");
  };

  const exportCsv = () => {
    const rows = [["Invoice", "Customer", "Phone", "Amount", "Paid", "Status", "Date"]];
    for (const s of sales) {
      rows.push([s.id, s.customer, s.customerPhone || "", String(s.amount), String(s.paidAmount), s.status, s.date]);
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dukanos-bills-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${sales.length} bills`);
  };

  const simpleRows = [
    { icon: Bell, label: "Reminders", desc: "Auto follow-ups for udhaar & AMC" },
    { icon: Palette, label: "Invoice Template", desc: "Simple, Professional/GST, Branded" },
    { icon: HelpCircle, label: "Help & Support", desc: "FAQ, contact us" },
  ];

  return (
    <PageShell title="Settings" subtitle="DukanOs configuration">
      <div className="space-y-2">
        {/* Business Profile */}
        <button onClick={() => setShowProfile(!showProfile)}
          className="w-full glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-all hover:bg-card/70 text-left">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Business Profile</p>
            <p className="text-xs text-muted-foreground">Name, address, GST — auto-fills every bill</p>
          </div>
          <ChevronRight className={`h-4 w-4 text-muted-foreground/50 transition-transform ${showProfile ? "rotate-90" : ""}`} />
        </button>

        {showProfile && (
          <div className="glass rounded-2xl p-4 space-y-3 ml-2 border-l-2 border-primary/20">
            <Field label="Business Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g., Patel Kirana" />
            <Field label="Address" value={form.address} onChange={v => setForm({ ...form, address: v })} placeholder="Shop No, Street, Area" />
            <div className="grid grid-cols-2 gap-2">
              <Field label="City" value={form.city} onChange={v => setForm({ ...form, city: v })} placeholder="Ahmedabad" />
              <Field label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="+91 98xxx xxxxx" />
            </div>
            <Field label="GSTIN (optional)" value={form.gstin} onChange={v => setForm({ ...form, gstin: v })} placeholder="22AAAAA0000A1Z5" />
            <Field label="Google Maps Link (optional)" value={form.mapsUrl} onChange={v => setForm({ ...form, mapsUrl: v })} placeholder="https://maps.app.goo.gl/..." />
            <button onClick={saveProfile} className="w-full gradient-accent text-accent-foreground py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
              <Save className="h-4 w-4" /> Save Profile
            </button>
          </div>
        )}

        {/* Backup & Export */}
        <button onClick={exportCsv}
          className="w-full glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-all hover:bg-card/70 text-left">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Backup & Export</p>
            <p className="text-xs text-muted-foreground">Download all bills as CSV ({sales.length} records)</p>
          </div>
          <Download className="h-4 w-4 text-primary" />
        </button>

        {simpleRows.map((item) => (
          <button key={item.label} className="w-full glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-all hover:bg-card/70 text-left">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </button>
        ))}

        {user && (
          <button onClick={signOut}
            className="w-full glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-all hover:bg-destructive/5 text-left mt-4">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center flex-shrink-0">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive">Sign Out</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </button>
        )}
      </div>
    </PageShell>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1 block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
    </div>
  );
}
