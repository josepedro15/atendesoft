import { Mail, Phone, MapPin, Instagram, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    company: [
      { name: "Sobre Nós", href: "#about" },
      { name: "Serviços", href: "#services" },
      { name: "Casos de Sucesso", href: "#testimonials" },
      { name: "Blog", href: "#blog" },
      { name: "Carreira", href: "#career" }
    ],
    services: [
      { name: "Automação com IA", href: "#automation" },
      { name: "Integração de APIs", href: "#integration" },
      { name: "Chatbots", href: "#chatbots" },
      { name: "Business Intelligence", href: "#bi" },
      { name: "Consultoria", href: "#consulting" }
    ],
    support: [
      { name: "Central de Ajuda", href: "#help" },
      { name: "Documentação", href: "#docs" },
      { name: "Status do Sistema", href: "#status" },
      { name: "Contato", href: "#contact" },
      { name: "Portal do Cliente", href: "/login" }
    ]
  };

  const socialLinks = [
    { icon: Linkedin, href: "#linkedin", name: "LinkedIn" },
    { icon: Instagram, href: "#instagram", name: "Instagram" },
    { icon: Twitter, href: "#twitter", name: "Twitter" }
  ];

  return (
    <footer className="bg-background border-t border-border relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-glow text-primary mb-2">AtendeSoft</h3>
              <p className="text-muted-foreground leading-relaxed">
                Transformando negócios com automações inteligentes e tecnologia de ponta. 
                Seu parceiro em inovação e eficiência.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">contato@atendesoft.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">+55 (11) 9 9999-9999</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Empresa</h4>
            <ul className="space-y-3">
              {links.company.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Serviços</h4>
            <ul className="space-y-3">
              {links.services.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Suporte</h4>
            <ul className="space-y-3">
              {links.support.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © {currentYear} AtendeSoft. Todos os direitos reservados.
            </div>
            
            {/* Legal Links */}
            <div className="flex gap-6 text-sm">
              <a href="#privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Política de Privacidade
              </a>
              <a href="#terms" className="text-muted-foreground hover:text-primary transition-colors">
                Termos de Uso
              </a>
              <a href="#cookies" className="text-muted-foreground hover:text-primary transition-colors">
                Política de Cookies
              </a>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:shadow-neon-blue transition-all duration-300 group"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;