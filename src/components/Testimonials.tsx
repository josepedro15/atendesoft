import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Carlos Mendes",
      role: "CEO",
      company: "TechCorp Brasil",
      image: "/placeholder.svg",
      rating: 5,
      text: "A Atendesoft revolucionou nossos processos. Conseguimos automatizar 80% das tarefas repetitivas e nossa produtividade aumentou em 300%. O ROI foi alcançado em apenas 2 meses."
    },
    {
      name: "Ana Paula Santos",
      role: "Diretora de Operações",
      company: "LogiFlow Ltda",
      image: "/placeholder.svg",
      rating: 5,
      text: "O chatbot inteligente que desenvolveram para nós reduziu 90% dos tickets de suporte. Nossos clientes adoram o atendimento instantâneo e nossa equipe pode focar em casos complexos."
    },
    {
      name: "Roberto Silva",
      role: "CTO",
      company: "DataVision",
      image: "/placeholder.svg",
      rating: 5,
      text: "A integração com nosso CRM foi perfeita. Agora temos visibilidade completa do funil de vendas e insights acionáveis que aumentaram nossa conversão em 45%."
    }
  ];

  const brands = [
    { name: "Microsoft", logo: "🔷" },
    { name: "Google", logo: "🔸" },
    { name: "Salesforce", logo: "⚡" },
    { name: "HubSpot", logo: "🧡" },
    { name: "AWS", logo: "🟠" },
    { name: "OpenAI", logo: "🤖" }
  ];

  return (
    <section className="py-24 bg-gradient-dark relative" id="testimonials">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 left-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-56 h-56 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '8s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold">
            O que nossos <span className="text-glow text-primary">clientes</span> dizem
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Histórias reais de transformação digital e crescimento exponencial
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="card-glass hover:shadow-neon-blue transition-all duration-500 group animate-scale-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <Quote className="w-8 h-8 text-primary" />
              </div>
              
              <div className="space-y-6">
                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                  ))}
                </div>
                
                {/* Testimonial Text */}
                <p className="text-foreground leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partner Brands */}
        <div className="space-y-8 animate-fade-in">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-muted-foreground mb-8">
              Tecnologias e parcerias que confiam em nós
            </h3>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {brands.map((brand, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 glass px-6 py-3 rounded-lg hover:shadow-neon-blue transition-all duration-300 group cursor-default"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {brand.logo}
                </span>
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;