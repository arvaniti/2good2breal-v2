import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { ChevronDown, ChevronUp, HelpCircle, Shield, CreditCard, Clock, Lock, Mail } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden mb-3">
      <button
        onClick={onClick}
        className="w-full px-6 py-4 flex items-center justify-between bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors text-left"
      >
        <span className="font-medium text-white pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-purple-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-zinc-900/30 border-t border-zinc-800">
          <p className="text-zinc-300 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQPage = () => {
  const { language } = useLanguage();
  const isFr = language === 'fr';
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      icon: Shield,
      question: isFr 
        ? "Comment fonctionne le service de vérification de profil ?" 
        : "How does the profile verification service work?",
      answer: isFr
        ? "Notre équipe d'experts analyse minutieusement le profil que vous soumettez. Nous vérifions l'authenticité des photos, les informations professionnelles, la cohérence des données et recherchons tout signe de comportement frauduleux. Vous recevez ensuite un rapport détaillé avec nos conclusions et recommandations."
        : "Our team of experts thoroughly analyze the profile you submit. We verify photo authenticity, professional information, data consistency, and look for any signs of fraudulent, improper and unsatisfactory behavior. After extensively and conclusively researching and cross-checking your profile, you will then receive a complete detailed report with our findings and recommendations."
    },
    {
      icon: Clock,
      question: isFr 
        ? "Combien de temps prend une vérification ?" 
        : "How long does a verification take?",
      answer: isFr
        ? "Le délai de vérification est généralement de 24 à 48 heures ouvrables. Pour les cas complexes nécessitant des recherches approfondies, cela peut prendre jusqu'à 72 heures. Vous serez notifié par email dès que votre rapport sera prêt."
        : "Verification typically takes 24 to 48 business hours. For complex cases requiring additional in-depth research, it may take up to 72 hours. You will be notified by email as soon as your report is ready."
    },
    {
      icon: Lock,
      question: isFr 
        ? "Mes informations sont-elles confidentielles ?" 
        : "Is my information confidential?",
      answer: isFr
        ? "Absolument. La confidentialité est notre priorité. Toutes les informations que vous partagez sont cryptées et stockées de manière sécurisée. Nous ne partageons jamais vos données avec des tiers et nous supprimons toutes les informations sensibles après le traitement de votre demande."
        : "Absolutely. Confidentiality and discretion is our priority. All information you share is encrypted and securely stored. We never share your data with third parties and we delete all sensitive information after processing your request."
    },
    {
      icon: CreditCard,
      question: isFr 
        ? "Comment fonctionne le système de crédits ?" 
        : "How does the credit system work?",
      answer: isFr
        ? "Chaque vérification de profil nécessite 1 crédit. Vous pouvez acheter des crédits via notre page de tarification. Les crédits n'expirent pas et peuvent être utilisés à tout moment. Le paiement est sécurisé via Stripe."
        : "Each profile verification requires 1 credit. You can purchase credits through our pricing page. Credits do not expire and can be used at any time. Payment by credit card is secured via Stripe."
    },
    {
      icon: HelpCircle,
      question: isFr 
        ? "Que contient le rapport de vérification ?" 
        : "What does the verification report contain?",
      answer: isFr
        ? "Le rapport comprend : une analyse de confiance avec score, la vérification des photos, l'authentification de l'occupation, la vérification des plateformes utilisées, l'analyse des incohérences, et nos recommandations personnalisées basées sur nos conclusions."
        : "The report includes: a trust score analysis, photo verification, occupation authentication, verification of platforms used, inconsistency analysis, and our personalized recommendations based on our findings."
    },
    {
      icon: Shield,
      question: isFr 
        ? "Quels types d'arnaques pouvez-vous détecter ?" 
        : "What types of scams can you detect?",
      answer: isFr
        ? "Nous sommes spécialisés dans la détection des arnaques romantiques (romance scams), les faux profils militaires, les escroqueries financières, le catfishing, et les tentatives de manipulation émotionnelle. Notre équipe est formée pour identifier les signaux d'alerte les plus subtils."
        : "We specialize in detecting all romance scams, fake profile occupations such as: military and naval positions, offshore rigging and property development, financial fraud, catfishing, and emotional manipulation attempts. Our team is professionally trained to identify the most subtle warning signs."
    },
    {
      icon: Mail,
      question: isFr 
        ? "Comment puis-je vous contacter pour plus d'informations ?" 
        : "How can I contact you for more information?",
      answer: isFr
        ? "Vous pouvez nous contacter par email à contact@2good2breal.com ou par WhatsApp au +33 (0) 7 43 66 05 55. Notre équipe répond généralement dans les 24 heures. Pour les questions urgentes concernant une vérification en cours, veuillez inclure votre numéro de référence dans votre message."
        : "You can contact us by email at contact@2good2breal.com or by WhatsApp at +33 (0) 7 43 66 05 55. Our team will respond within 24 hours. For urgent questions regarding an ongoing verification, please include your reference number in your message."
    },
    {
      icon: CreditCard,
      question: isFr 
        ? "Proposez-vous des remboursements ?" 
        : "Do you offer refunds?",
      answer: isFr
        ? "Si nous ne sommes pas en mesure de fournir une analyse complète en raison d'informations insuffisantes, nous vous proposerons un remboursement ou un crédit pour une future vérification. Veuillez consulter nos Conditions Générales de Vente pour plus de détails."
        : "If we are unable to provide a complete analysis due to insufficient information, we will offer you a refund or credit for a future verification. Please refer to our Terms of Sale for more details."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {isFr ? "Questions Fréquentes" : "Frequently Asked Questions"}
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            {isFr 
              ? "Trouvez les réponses à vos questions sur notre service de vérification de profils."
              : "Find answers to your questions about our profile verification service."
            }
          </p>
        </div>

        {/* FAQ List */}
        <div className="mb-12">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-3">
            {isFr ? "Vous avez d'autres questions ?" : "Have more questions?"}
          </h3>
          <p className="text-zinc-400 mb-6">
            {isFr 
              ? "Notre équipe est là pour vous aider. N'hésitez pas à nous contacter."
              : "Our team is here to help. Don't hesitate to contact us."
            }
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <a 
              href="mailto:contact@2good2breal.com" 
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Mail className="w-5 h-5" />
              {isFr ? "Nous contacter" : "Contact us"}
            </a>
          </div>
          <div className="text-zinc-400 text-sm space-y-1">
            <p>
              WhatsApp : <a href="tel:+33743660555" className="text-purple-400 hover:text-purple-300 underline">+33 (0) 7 43 66 05 55</a>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-wrap justify-center gap-6 text-sm">
          <Link to="/terms" className="text-zinc-400 hover:text-purple-400 transition-colors">
            {isFr ? "Conditions d'utilisation" : "Terms of Service"}
          </Link>
          <Link to="/cgv" className="text-zinc-400 hover:text-purple-400 transition-colors">
            {isFr ? "CGV" : "Terms of Sale"}
          </Link>
          <Link to="/cookies" className="text-zinc-400 hover:text-purple-400 transition-colors">
            {isFr ? "Politique de cookies" : "Cookie Policy"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
