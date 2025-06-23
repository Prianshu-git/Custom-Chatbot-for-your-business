import { motion } from "framer-motion";
import { Bot, Brain, Shield, Rocket, CheckCircle, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SetupWizard from "@/components/setup-wizard";
import ChatWidget from "@/components/chat-widget";
import { useState } from "react";

// 1. Define allowed color types
type StatColor = 'green' | 'blue' | 'purple';

// 2. Type your colorMap with StatColor as keys
const colorMap: Record<StatColor, { bg: string; text: string; from: string; to: string }> = {
  green: { bg: 'bg-green-500', text: 'text-green-700', from: 'from-green-400', to: 'to-green-600' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-700', from: 'from-blue-400', to: 'to-blue-600' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-700', from: 'from-purple-400', to: 'to-purple-600' },
};

// 3. Type your stats array
const stats: { label: string; value: number; color: StatColor }[] = [
  { label: "Response Accuracy", value: 94, color: "green" },
  { label: "Human Handoff Rate", value: 12, color: "blue" },
  { label: "Customer Satisfaction", value: 97, color: "purple" }
];

export default function Home() {
  const [showSetup, setShowSetup] = useState(false);
  const [chatSession, setChatSession] = useState<string | null>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-blue to-bright-blue rounded-lg flex items-center justify-center">
                <Bot className="text-blue-600" size={16} />
              </div>
              <span className="text-xl font-bold gradient-text">UrChatbot</span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-slate-600 hover:text-primary-blue transition-colors cursor-pointer"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('demo')}
                className="text-slate-600 hover:text-primary-blue transition-colors cursor-pointer"
              >
                Demo
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-slate-600 hover:text-primary-blue transition-colors cursor-pointer"
              >
                Pricing
              </button>
              <Button 
                className="bg-gradient-to-r from-primary-blue to-bright-blue hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => scrollToSection('demo')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Transform Your Business with
              <span className="block gradient-text mt-2">
                AI-Powered FAQ Assistant
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Upload your documents, add your website, and watch as our RAG-powered chatbot learns your business inside out. Provide instant, accurate answers to customer queries 24/7.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button 
                onClick={() => {
                  setShowSetup(true);
                  scrollToSection('demo');
                }}
                className="bg-gradient-to-r from-primary-blue to-bright-blue text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse-glow"
              >
                <Rocket className="mr-2" size={20} />
                Start Live Demo
              </Button>
            </motion.div>
          </div>
          
          {/* Demo Preview */}
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="glass rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-slate-500 ml-4">Business FAQ Assistant</span>
              </div>
              <CardContent className="bg-white/50 rounded-lg p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="text-primary-blue" size={16} />
                  </div>
                  <div className="glass-blue rounded-lg p-3 max-w-xs">
                    <p className="text-sm text-slate-700">What are your business hours?</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-blue-100 blue rounded-lg p-3 max-w-xs">
                    <p className="bg-blue-100 text-slate-700">We're open Monday through Friday from 9 AM to 6 PM EST. Our AI assistant is available 24/7 for immediate support!</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-blue to-bright-blue rounded-full flex items-center justify-center">
                    <Bot className="text-primary-blue" size={16} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-slate-800 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Why Choose Our AI Assistant?
            </motion.h2>
            <motion.p 
              className="text-lg text-slate-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Advanced RAG technology meets business intelligence for unparalleled customer support
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "RAG-Powered Intelligence",
                description: "Advanced Retrieval-Augmented Generation ensures accurate, contextual responses based on your specific business documents.",
                delay: 0
              },
              {
                icon: Shield,
                title: "Smart Escalation",
                description: "Automatically detects when to say \"I don't know\" and seamlessly connects customers to human agents when needed.",
                delay: 0.1
              },
              {
                icon: Rocket,
                title: "Instant Setup",
                description: "Upload documents, add your website URL, configure your API key, and launch your custom chatbot in minutes.",
                delay: 0.2
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card className="glass rounded-xl p-6 h-full hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-bright-blue rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Setup Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-slate-800 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Set Up Your Demo in 3 Steps
            </motion.h2>
            <motion.p 
              className="text-lg text-slate-800"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Experience the power of AI-driven customer support tailored to your business
            </motion.p>
          </div>

          <SetupWizard onSessionCreated={setChatSession} />
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-6">
                Intelligent Response System
              </h2>
              <div className="space-y-4">
                {([
                  {
                    icon: CheckCircle,
                    title: "Context-Aware Responses",
                    description: "Understands your business context to provide relevant, accurate answers.",
                    color: "green" as StatColor
                  },
                  {
                    icon: Users,
                    title: "Human Handoff",
                    description: "Seamlessly transfers complex queries to human agents when needed.",
                    color: "blue" as StatColor
                  },
                  {
                    icon: TrendingUp,
                    title: "Learning & Improvement",
                    description: "Continuously improves responses based on interactions and feedback.",
                    color: "purple" as StatColor
                  }
                ]).map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className={`w-6 h-6 ${colorMap[item.color].bg} rounded-full flex items-center justify-center mt-0.5`}>
                      <item.icon className={`${colorMap[item.color].text}`} size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{item.title}</h4>
                      <p className="text-blue-500 text-sm">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="glass rounded-2xl p-6">
                <div className="space-y-4">
                  {stats.map((stat, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600">{stat.label}</span>
                        <span className="text-slate-800 font-semibold">{stat.value}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <motion.div 
                          className={`bg-gradient-to-r ${colorMap[stat.color].from} ${colorMap[stat.color].to} h-2 rounded-full`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${stat.value}%` }}
                          transition={{ duration: 1.5, delay: index * 0.2 }}
                          viewport={{ once: true }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-blue to-bright-blue">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-black mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p 
            className="text-xl text-blue-500 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Choose the plan that fits your business. No hidden fees, cancel anytime.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Starter",
                price: "$5",
                period: "/month",
                features: [
                  "Up to 500 queries/month",
                  "Basic analytics",
                  "Email support",
                  "1 business integration"
                ],
                delay: 0
              },
              {
                title: "Pro",
                price: "$15",
                period: "/month",
                features: [
                  "Up to 5,000 queries/month",
                  "Advanced analytics",
                  "Priority email support",
                  "Up to 3 business integrations"
                ],
                highlight: true,
                delay: 0.1
              },
              {
                title: "Enterprise",
                price: "$25",
                period: "/month",
                features: [
                  "Unlimited queries",
                  "Full analytics suite",
                  "24/7 priority support",
                  "Unlimited integrations"
                ],
                delay: 0.2
              }
            ].map((plan, idx) => (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: plan.delay }}
                viewport={{ once: true }}
              >
                <Card className={`glass rounded-2xl p-8 h-full border-2 transition-all duration-300 ${plan.highlight ? "border-yellow-400 shadow-xl scale-105" : "border-transparent hover:shadow-xl hover:scale-105"}`}>
                  <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? "text-yellow-400" : "text-black"}`}>{plan.title}</h3>
                  <div className="flex items-end justify-center mb-6">
                    <span className="text-4xl font-extrabold text-black">{plan.price}</span>
                    <span className="text-lg text-blue-500 ml-1">{plan.period}</span>
                  </div>
                  <ul className="mb-8 space-y-2 text-green-700 text-left">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="text-primary-blue mr-2" size={18} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.highlight ? "bg-yellow-400 text-slate-900" : "bg-white/80 text-primary-blue"} font-semibold hover:scale-105 transition-all duration-300`}>
                    {plan.highlight ? "Most Popular" : "Choose Plan"}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
          {/* Special Offer Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
            className="mx-auto max-w-xl"
          >
            <Card className="glass rounded-2xl p-8 border-2 border-blue-400 bg-white/30 backdrop-blur-md shadow-2xl animate-pulse-glow">
              <div className="flex items-center justify-center mb-4">
                <Rocket className="text-blue-500 mr-2" size={24} />
                <span className="text-lg font-bold text-blue-500 uppercase tracking-wide">Limited Time Offer</span>
              </div>
              <div className="flex items-end justify-center mb-2">
                <span className="text-4xl font-extrabold text-pink-600">$99</span>
                <span className="text-lg text-black ml-1">/year</span>
              </div>
              <p className="text-blue-700 mb-4 font-semibold">🎉Save over 65% compared to monthly plans!🎉</p>
              <Button className="w-full bg-blue-400 text-white font-semibold hover:scale-105 transition-all duration-300">
                Grab Annual Deal
              </Button>
              <p className="text-xs text-pink-600 mt-3">Valid for a limited time only.</p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-blue to-bright-blue rounded-lg flex items-center justify-center">
                  <Bot className="text-white" size={16} />
                </div>
                <span className="text-xl font-bold text-white">UrChatBot</span>
              </div>
              <p className="text-slate-400 text-sm">Empowering businesses with intelligent customer support solutions.</p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "API", "Documentation"]
              },
              {
                title: "Company", 
                links: ["About", "Blog", "Careers", "Contact"]
              },
              {
                title: "Support",
                links: ["Help Center", "Security", "Privacy", "Terms"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-white mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="hover:text-white transition-colors cursor-pointer">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 ChatBot Demo. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      {chatSession && <ChatWidget sessionId={chatSession} />}
    </div>
  );
}
