import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <Header user={user} />
      {children}
      <footer className="site-footer">
        <p>© 2026 poketier. All rights reserved.</p>
      </footer>
    </>
  );
}
