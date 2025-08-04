import { Brain, Cpu, Shield, Zap, Globe, Award } from "lucide-react";

const Differentials = () => {
  const technologies = [
    { name: "OpenAI", color: "text-green-400" },
    { name: "Supabase", color: "text-emerald-400" },
    { name: "n8n", color: "text-purple-400" },
    { name: "Microsoft AI", color: "text-blue-400" },
    { name: "Google Cloud", color: "text-yellow-400" },
    { name: "AWS", color: "text-orange-400" }
  ];

  const differentials = [
    {
      icon: Brain,
      title: "IA de Última Geração",
      description: "Utilizamos os modelos mais avançados de inteligência artificial, incluindo GPT-4, Claude e LLaMA para resultados excepcionais."
    },
    {
      icon: Zap,
      title: "Implementação Rápida",
      description: "Metodologia ágil que permite implementações em até 30 dias, com ROI visível desde a primeira semana."
    },
    {
      icon: Shield,
      title: "Segurança Corporativa",
      description: "Protocolos de segurança enterprise com criptografia end-to-end e compliance total com LGPD."
    },
    {
      icon: Globe,
      title: "Suporte 24/7",
      description: "Equipe especializada disponível 24 horas para suporte técnico e otimização contínua dos sistemas."
    },
    {
      icon: Cpu,
      title: "Escalabilidade Infinita",
      description: "Arquitetura cloud-native que cresce junto com seu negócio, suportando milhões de operações."
    },
    {
      icon: Award,
      title: "Expertise Comprovada",
      description: "Mais de 5 anos no mercado com cases de sucesso em empresas de diversos segmentos e portes."
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden" id="differentials">
      {/* Parallax Background */}
      <div className="absolute inset-0 parallax-container">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 transform translate-z-0" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '10s' }} />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold">
            Nossos <span className="text-glow text-primary">Diferenciais</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            O que nos torna únicos no mercado de automação e inteligência artificial
          </p>
          
          {/* Technologies */}
          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <span className="text-sm text-muted-foreground mr-4">Tecnologias que utilizamos:</span>
            {technologies.map((tech, index) => (
              <span 
                key={index}
                className={`px-3 py-1 rounded-full text-xs font-semibold glass ${tech.color} hover:scale-105 transition-transform cursor-default`}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>

        {/* Differentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {differentials.map((differential, index) => (
            <div 
              key={index}
              className="group relative animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card */}
              <div className="card-glass h-full p-8 hover:shadow-neon-blue transition-all duration-500 group-hover:transform group-hover:-translate-y-2">
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <differential.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {differential.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {differential.description}
                  </p>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-primary/50 rounded-full group-hover:animate-pulse" />
                <div className="absolute bottom-4 left-4 w-1 h-1 bg-secondary/50 rounded-full group-hover:animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              
              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-primary/30 transition-colors duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Differentials;