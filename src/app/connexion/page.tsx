import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConnexionForm from "@/components/ConnexionForm";

export default function ConnexionPage() {
  return (
    <div style={{ background: "#fff9ef", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <section style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "50px 24px 70px" }}>
        <ConnexionForm />
      </section>
      <Footer />
    </div>
  );
}
