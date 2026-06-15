import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrandMarquee from "@/components/BrandMarquee";
import Services from "@/components/Services";
import CaseStudies from "@/components/CaseStudies";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";

const Landing = () => (
    <div
        data-testid="landing-page"
        className="relative min-h-screen bg-[#030305] text-white overflow-x-hidden"
    >
        <Navbar />
        <Hero />
        <BrandMarquee />
        <Services />
        <CaseStudies />
        <Pricing />
        <Faq />
        <LeadForm />
        <Footer />
    </div>
);

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
