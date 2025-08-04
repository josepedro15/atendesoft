import { Bot, Database, BarChart3, Workflow } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Workflow,
      title: "Automação de Processos com IA",
      description: "Automatize tarefas repetitivas e complexas com inteligência artificial avançada, liberando sua equipe para atividades estratégicas.",
      features: ["RPA Inteligente", "Machine Learning", "Processamento de Linguagem Natural"]
    },
    {
      icon: Database,
      title: "Integração com APIs e CRMs",
      description: "Conecte todos os seus sistemas e dados em uma única plataforma, garantindo fluxo de informações em tempo real.",
      features: ["Integração Salesforce", "HubSpot & Pipedrive", "APIs Personalizadas"]
    },
    {
      icon: Bot,
      title: "Chatbots Inteligentes",
      description: "Atendimento automatizado 24/7 com IA conversacional que aprende e evolui com cada interação.",
      features: ["WhatsApp Business", "Telegram & Discord", "Web Chat Personalizado"]
    },
    {
      icon: BarChart3,
      title: "Painéis de BI e Relatórios",
      description: "Dashboards inteligentes com análises preditivas e insights acionáveis para tomada de decisões estratégicas.",
      features: ["Análise Preditiva", "KPIs Personalizados", "Relatórios Automatizados"]
    }
  ];

  return (
    <section className="py-24 bg-gradient-dark relative" id="services">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold">
            Nossos <span className="text-glow text-primary">Serviços</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Soluções completas em automação e inteligência artificial para revolucionar seus processos de negócio
          </p>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="card-glass hover:shadow-neon-blue transition-all duration-500 group animate-scale-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="space-y-6">
                {/* Icon */}
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full group-hover:animate-pulse" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-primary/30 transition-colors duration-300 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;