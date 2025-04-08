
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { fadeInAnimation, slideInAnimation, scaleInAnimation } from "@/lib/animations";

// Logo component
const Logo = () => (
  <motion.div 
    className="relative flex items-center justify-center w-24 h-24"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <div className="absolute w-full h-full bg-primary/10 rounded-full" />
    <div className="relative z-10">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12L36 36" stroke="#1a56db" strokeWidth="6" strokeLinecap="round" />
        <path d="M12 24L24 36" stroke="#1a56db" strokeWidth="6" strokeLinecap="round" />
        <path d="M24 12L36 24" stroke="#1a56db" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </div>
  </motion.div>
);

const OnboardingStep = ({ 
  title, 
  description, 
  image, 
  index 
}: { 
  title: string;
  description: string;
  image: string;
  index: number;
}) => {
  return (
    <motion.div 
      className="flex flex-col items-center max-w-md mx-auto px-6 pt-10 pb-16"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
    >
      <div className="flex justify-between w-full mb-4">
        <motion.div 
          className="flex items-center"
          variants={fadeInAnimation}
        >
          <Logo />
          <span className="ml-2 text-xl font-bold text-primary">SpendWise</span>
        </motion.div>
      </div>
      
      <motion.div 
        className="w-64 h-64 bg-primary rounded-full flex items-center justify-center mb-8"
        variants={scaleInAnimation}
      >
        <img src={image} alt={title} className="w-48 h-48 object-contain" />
      </motion.div>
      
      <motion.h1 
        className="text-2xl font-bold text-center mb-2"
        variants={slideInAnimation}
      >
        {title}
      </motion.h1>
      
      <motion.p 
        className="text-center text-muted-foreground mb-8"
        variants={fadeInAnimation}
      >
        {description}
      </motion.p>
      
      <div className="flex space-x-2 mb-8">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className={`w-2 h-2 rounded-full ${index === dot ? 'bg-primary' : 'bg-primary/30'}`}
            variants={fadeInAnimation}
          />
        ))}
      </div>
      
      <motion.div 
        className="w-full"
        variants={slideInAnimation}
      >
        <Button asChild className="w-full h-12 text-base" size="lg">
          <Link to={index < 2 ? `/onboarding/${index + 1}` : "/welcome"}>
            LET'S GO
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
};

const onboardingSteps = [
  {
    title: "Note Down Expenses",
    description: "Keep track of your expenses to better manage your money",
    image: "/lovable-uploads/d8160077-25b5-4c9c-8ace-9ed2ebf40037.png"
  },
  {
    title: "Simple Money Management",
    description: "Set your savings goals or alert when you go over your expenses",
    image: "/lovable-uploads/d8160077-25b5-4c9c-8ace-9ed2ebf40037.png"
  },
  {
    title: "Easy to Track and Analyze",
    description: "Tracking your expenses made easy so you can focus on what matters",
    image: "/lovable-uploads/d8160077-25b5-4c9c-8ace-9ed2ebf40037.png"
  }
];

const Index = () => {
  // This page acts as the first onboarding step
  return <OnboardingStep {...onboardingSteps[0]} index={0} />;
};

export default Index;
