import Navbar    from "@/components/Navbar";
import Hero      from "@/components/Hero";
import ScrollStory from "@/components/ScrollStory";
import Outro     from "@/components/Outro";
import Footer    from "@/components/Footer";
import { getHomepage, getNavigation, getFooterContent } from "@/lib/content";

export default function Home() {
  const homepage   = getHomepage();
  const navigation = getNavigation();
  const footer     = getFooterContent();

  return (
    <>
      <Navbar    content={navigation} />
      <main>
        <Hero        content={homepage.hero}        stats={homepage.stats} />
        <ScrollStory content={homepage.scrollStory} />
        <Outro       content={homepage}             />
      </main>
      <Footer content={footer} />
    </>
  );
}
