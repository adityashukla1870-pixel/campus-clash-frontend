import LandingNavbar from "../components/LandingNavbar";
import Hero from "../components/Hero";
import GamesTicker from "../components/GamesTicker";
import Stats from "../components/Stats";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

function LandingPage(){

return(

<div className="landing">

<LandingNavbar/>

<Hero/>

<GamesTicker/>

<Stats/>

<Features/>

<HowItWorks/>

<CTA/>

<Footer/>

</div>

)

}

export default LandingPage;
