import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center animated-bg overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(200, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary rounded-full opacity-60 animate-float" />
        <div className="absolute top-32 right-20 w-6 h-6 bg-secondary rounded-full opacity-40 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-32 left-32 w-3 h-3 bg-accent rounded-full opacity-50 animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-20 right-32 w-5 h-5 bg-primary-glow rounded-full opacity-30 animate-float" style={{ animationDelay: '6s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Login Button */}
        <div className="absolute top-8 right-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="text-primary hover:bg-primary/10 hover:text-primary border border-primary/20"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Portal do Cliente
          </Button>
        </div>

        <div className="text-center space-y-8 animate-slide-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="w-4 h-4" />
            Tecnologia de ponta para empresas inovadoras
          </div>
          
          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="text-glow text-primary">Automações</span>
            <br />
            <span className="text-foreground">Inteligentes com</span>
            <br />
            <span className="text-glow text-secondary">Inteligência Artificial</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transforme seu negócio com <span className="text-primary font-semibold">automações de IA</span>, 
            integrações com <span className="text-secondary font-semibold">APIs e CRMs</span>, 
            chatbots inteligentes e painéis de BI personalizados.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="btn-neon text-primary-foreground group">
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Fale com um Especialista
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button variant="outline" size="lg" className="btn-outline-neon">
              Solicitar Orçamento
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">150+</div>
              <div className="text-sm text-muted-foreground">Empresas Atendidas</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-secondary">90%</div>
              <div className="text-sm text-muted-foreground">Redução de Tempo</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-sm text-muted-foreground">Suporte Ativo</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary-glow">ROI 300%</div>
              <div className="text-sm text-muted-foreground">Retorno Médio</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;