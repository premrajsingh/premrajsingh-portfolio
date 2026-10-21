import Loader from "./components/Loader.jsx"
import Header from "./components/Header.jsx"
import Hero from "./components/Hero.jsx"
import About from "./components/About.jsx"
import Experience from "./components/Experience.jsx"
import Projects from "./components/Projects.jsx"
import Skills from "./components/Skills.jsx"
import Credentials from "./components/Credentials.jsx"
import Contact from "./components/Contact.jsx"
import Footer from "./components/Footer.jsx"
import BackToTop from "./components/BackToTop.jsx"
import { useLenis } from "./hooks/useLenis.js"

export default function App() {
  useLenis()
  return (
    <>
      <Loader />
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Credentials />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
