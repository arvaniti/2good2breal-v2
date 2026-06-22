import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { Button } from '../components/ui/button';
import { Shield, ArrowLeft, FileText } from 'lucide-react';

const TermsSection = ({ title, content }) => (
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
    <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
    <div className="text-zinc-300 leading-relaxed whitespace-pre-line">
      {content}
    </div>
  </div>
);

export function TermsPage() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  const title = isEnglish ? "Terms and Conditions" : "Conditions Générales";
  const lastUpdated = isEnglish ? "Last Updated: February 2026" : "Dernière mise à jour : Février 2026";

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="text-zinc-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isEnglish ? "Back to Home" : "Retour à l'accueil"}
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-zinc-500">{lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <TermsSection 
            title={isEnglish ? "1. Introduction" : "1. Introduction"}
            content={isEnglish 
              ? `Welcome to 2good2breal. The Terms and Conditions govern your use of our profile verification services and website. By accessing or using our services, you agree to these terms.

2good2breal is a professional profile‑verification service. We are not a dating site. We provide independent verification and vetting of profiles from all dating platforms — as well as from any other website — worldwide.`
              : `Bienvenue sur 2good2breal ("nous," "notre," ou "nos"). Ces Conditions Générales régissent votre utilisation de nos services de vérification de profils et de notre site web. En accédant ou en utilisant nos services, vous acceptez ces conditions.

2good2breal est un service professionnel de vérification de profils. Nous ne sommes PAS un site de rencontres. Nous fournissons des services indépendants de vérification pour les profils provenant de toutes les plateformes et sites de rencontres.`
            }
          />

          <TermsSection 
            title={isEnglish ? "2. Description of Services" : "2. Description des Services"}
            content={isEnglish 
              ? `Our services include:
• Professional profile verification and vetting of dating profiles from any platform, for both online and offline dating
• A.I.‑powered analysis and authenticity assessment
• Detailed dossier reports with an assigned trust score
• Red‑flag detection, scam identification, and descriptive findings
• Customized verification filters based on your preferences

All verification results are delivered within 48 hours of your profile submission. Our team uses advanced technology — including comprehensive A.I. systems and in‑depth manual social‑platform research — to provide you with an accurate and precise profile assessment.`
              : `Nos services comprennent :
• Vérification professionnelle des profils de rencontres de toute plateforme
• Analyse alimentée par l'IA et évaluation de l'authenticité
• Rapports détaillés avec score de confiance
• Détection des signaux d'alerte et identification des arnaques
• Filtres de vérification personnalisés selon vos préférences

Tous les résultats de vérification livrés dans les 48 heures suivant la soumission de la demande.`
            }
          />

          <TermsSection 
            title={isEnglish ? "3. Service Fees and Payment" : "3. Frais de Service et Paiement"}
            content={isEnglish 
              ? `Our service fees are structured as follows:

BASIC VERIFICATION - €49 per profile
• Standard profile analysis
• Trust score assessment
• Red flag detection
• 48-hour delivery
• Personal consultation via WhatsApp, Zoom, or direct phone call
• Standard dossier report

COMPREHENSIVE VERIFICATION - €99 per profile
• In-depth profile analysis and investigation
• Trust score assessment
• Red flag detection
• Extended background research
• Social media cross-referencing
• Detailed dossier report
• Priority 24-hour delivery
• Personal consultation via WhatsApp, Zoom, or direct phone call

PREMIUM PACKAGE - €189 (up to 2 profiles)
• All COMPREHENSIVE VERIFICATION features
• Monitoring of your profile for 30 days
• Trust score assessment
• Direct communication with our experts
• Priority support
• Personal consultation via WhatsApp, Zoom, or direct phone call

All fees are due upon submission of your verification request. Payments are processed securely and are non-refundable once the verification process has begun. We reserve the right to modify our pricing at any time, with notice provided to registered users.`
              : `Nos frais de service sont structurés comme suit :

VÉRIFICATION BASIQUE - 49€ par profil
• Analyse de profil standard
• Évaluation du score de confiance
• Détection basique des signaux d'alerte
• Livraison en 48 heures
• Consultation personnelle via WhatsApp, Zoom ou appel téléphonique direct

VÉRIFICATION COMPLÈTE - 99€ par profil
• Investigation approfondie du profil
• Recherche étendue des antécédents
• Vérification croisée des réseaux sociaux
• Rapport détaillé
• Livraison prioritaire en 24 heures
• Consultation personnelle via WhatsApp, Zoom ou appel téléphonique direct

FORFAIT PREMIUM - 189€ (jusqu'à 3 profils)
• Toutes les fonctionnalités Complètes
• Surveillance continue (30 jours)
• Consultation directe avec nos experts
• Support prioritaire
• Consultation personnelle via WhatsApp, Zoom ou appel téléphonique direct

Tous les frais sont dus lors de la soumission de votre demande de vérification. Les paiements sont traités de manière sécurisée et ne sont pas remboursables une fois le processus de vérification commencé.`
            }
          />

          <TermsSection 
            title={isEnglish ? "4. User Responsibilities" : "4. Responsabilités de l'Utilisateur"}
            content={isEnglish 
              ? `By using our services, you agree to:
• Provide accurate information for your verification requests
• Any misuse, redistribution or commercial exploitation of our verification reports is prohibited
• Maintain confidentiality of your account credentials
• Comply with all applicable laws and regulations

You acknowledge you are solely responsible for any decisions, communications and meetings you proceed with this profile based on our verification reports.`
              : `En utilisant nos services, vous acceptez de :
• Fournir des informations exactes pour vos demandes de vérification
• Toute utilisation abusive, redistribution ou exploitation commerciale de nos rapports de vérification est interdite
• Maintenir la confidentialité de vos identifiants de compte
• Respecter toutes les lois et réglementations applicables

Vous reconnaissez être seul responsable de toutes décisions, communications et rencontres que vous effectuez sur la base de nos rapports de vérification.`
            }
          />

          <TermsSection 
            title={isEnglish ? "5. Limitation of Liability" : "5. Limitation de Responsabilité"}
            content={isEnglish 
              ? `IMPORTANT: PLEASE READ THIS SECTION CAREFULLY.

To the maximum extent permitted by applicable law:

a) GUARANTEE OF ACCURACY: While we strive to provide precise and thorough verification services, we cannot guarantee 100 % accuracy of information contained in our reports. Our team's assessments are advanced, skilled researches, using only the highest level of technologies based on uncovering even the most difficult and secured profile data. Our profile analyzation and verification systems are at the utmost forefront and advanced level of analysis, however should not be considered infallible.

b) NO LIABILITY FOR DECISIONS: 2good2breal shall not be held liable for any decision making or actions you take based on our verification reports. We provide information and analysis; the decision to proceed with or terminate any relationship is solely yours.

c) LIMITATION OF DAMAGES: Under no circumstances shall 2good2breal, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.

d) MAXIMUM LIABILITY: In any event, our total liability to you for all claims arising from or related to our services shall not exceed the amount you paid to us for the specific service giving rise to the claim.

e) THIRD-PARTY PLATFORMS: We are not responsible for the accuracy of information obtained by you from third-party dating platforms or social media sites. Our analysis and verifications are exclusively based on the information and data you provide.

f) ADVISORY SERVICES: 2good2breal does not constitute legal, psychological, relationship or counseling guidance. For specific concerns in these areas, please consult qualified professionals.`
              : `IMPORTANT : VEUILLEZ LIRE CETTE SECTION ATTENTIVEMENT.

Dans la mesure maximale permise par la loi applicable :

a) AUCUNE GARANTIE D'EXACTITUDE : Bien que nous nous efforcions de fournir des services de vérification précis et approfondis, nous ne pouvons garantir l'exactitude absolue, l'exhaustivité ou la fiabilité des informations contenues dans nos rapports.

b) AUCUNE RESPONSABILITÉ POUR LES DÉCISIONS : 2good2breal ne sera pas tenu responsable des décisions que vous prenez ou des actions que vous entreprenez sur la base de nos rapports de vérification.

c) LIMITATION DES DOMMAGES : En aucun cas 2good2breal, ses directeurs, employés, partenaires, agents, fournisseurs ou affiliés ne seront responsables de tout dommage indirect, accessoire, spécial, consécutif ou punitif.

d) RESPONSABILITÉ MAXIMALE : Notre responsabilité totale envers vous pour toutes les réclamations ne dépassera pas le montant que vous nous avez payé pour le service spécifique.

e) PLATEFORMES TIERCES : Nous ne sommes pas responsables de l'exactitude des informations obtenues auprès de plateformes de rencontres tierces ou de sites de médias sociaux.

f) AUCUN CONSEIL PROFESSIONNEL : Nos services ne constituent pas des conseils juridiques, psychologiques ou relationnels.`
            }
          />

          <TermsSection 
            title={isEnglish ? "6. Disclaimer of Warranties" : "6. Exclusion de Garanties"}
            content={isEnglish 
              ? `Our services are provided on an "AS IS" and "AS AVAILABLE" basis, without any warranties of any kind, either expressed or implied. To maintain our confidential and loyal subscriber network, 2good2breal is built on trust, quality and compassion.

We do not warrant that the service will be uninterrupted or error-free. 2good2breal only accept first party subscriptions and submissions.`
              : `Nos services sont fournis "EN L'ÉTAT" et "SELON DISPONIBILITÉ", sans aucune garantie d'aucune sorte, expresse ou implicite. Pour maintenir notre réseau d'abonnés confidentiel et fidèle, 2good2breal est construit sur la confiance, la qualité et la compassion.

Nous ne garantissons pas que le service sera ininterrompu, sécurisé ou exempt d'erreurs. 2good2breal n'accepte que les abonnements et soumissions de première partie.`
            }
          />

          <TermsSection 
            title={isEnglish ? "7. Privacy and Data Protection" : "7. Confidentialité et Protection des Données"}
            content={isEnglish 
              ? `We are committed to protecting your privacy and handling your data with full discretion. By using our services:
• All personal information you provide is kept strictly confidential
• Verification requests and reports are securely stored and encrypted
• We do not share your information with third parties except as required by law
• You may request deletion of your data at any time

For complete details, please refer to our Privacy Policy.`
              : `Nous nous engageons à protéger votre vie privée et à traiter vos données avec une discrétion totale. En utilisant nos services :
• Toutes les informations personnelles que vous fournissez sont gardées strictement confidentielles
• Les demandes et rapports de vérification sont stockés et cryptés de manière sécurisée
• Nous ne partageons pas vos informations avec des tiers sauf si la loi l'exige
• Vous pouvez demander la suppression de vos données à tout moment`
            }
          />

          <TermsSection 
            title={isEnglish ? "8. Intellectual Property" : "8. Propriété Intellectuelle"}
            content={isEnglish 
              ? `All content, features, and functionality of our website and services, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, and software are the exclusive property of 2good2breal and are protected by international copyright, trademark, and other intellectual property laws.

Our verification reports are provided for your personal use only and may not be reproduced, distributed, or commercially exploited without our express written consent.`
              : `Tout le contenu, les fonctionnalités et les fonctions de notre site web et de nos services sont la propriété exclusive de 2good2breal et sont protégés par les lois internationales sur les droits d'auteur et les marques.

Nos rapports de vérification sont fournis pour votre usage personnel uniquement et ne peuvent être reproduits, distribués ou exploités commercialement sans notre consentement écrit exprès.`
            }
          />

          <TermsSection 
            title={isEnglish ? "9. Governing Law and Jurisdiction" : "9. Droit Applicable et Juridiction"}
            content={isEnglish 
              ? `These Terms and Conditions shall be governed by and construed in accordance with the laws of the European Union and the applicable national laws.

Any disputes arising out of or related to these terms or our services shall be subject to the exclusive jurisdiction of the courts in the applicable jurisdiction.`
              : `Ces Conditions Générales sont régies par et interprétées conformément aux lois de l'Union Européenne et aux lois nationales applicables.

Tout litige découlant de ces conditions ou de nos services sera soumis à la juridiction exclusive des tribunaux de la juridiction applicable.`
            }
          />

          <TermsSection 
            title={isEnglish ? "10. Changes to Terms" : "10. Modifications des Conditions"}
            content={isEnglish 
              ? `We reserve the right to modify or replace these Terms and Conditions at any time at our sole discretion. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.

Your continued use of our services after any such changes constitutes your acceptance of the new Terms and Conditions.`
              : `Nous nous réservons le droit de modifier ces Conditions Générales à tout moment à notre seule discrétion. Si une révision est importante, nous fournirons un préavis d'au moins 30 jours avant l'entrée en vigueur des nouvelles conditions.

Votre utilisation continue de nos services après de telles modifications constitue votre acceptation des nouvelles Conditions Générales.`
            }
          />

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-400" />
              {isEnglish ? "11. Contact Information" : "11. Coordonnées"}
            </h2>
            <div className="text-zinc-300 leading-relaxed whitespace-pre-line">
              <p className="mb-4">{isEnglish 
                ? "If you have any questions about these Terms and Conditions, please contact us at:"
                : "Si vous avez des questions concernant ces Conditions Générales, veuillez nous contacter à :"}</p>
              <ul className="space-y-2 ml-4">
                <li>• Email: <a href="mailto:contact@2good2breal.com" className="text-purple-400 hover:text-purple-300 underline">contact@2good2breal.com</a></li>
                <li>• WhatsApp 1 : <a href="tel:+33743660555" className="text-purple-400 hover:text-purple-300 underline">+33 (0) 7 43 66 05 55</a></li>
                <li>• WhatsApp 2 : <a href="tel:+33767925545" className="text-purple-400 hover:text-purple-300 underline">+33 (0) 7 67 92 55 45</a></li>
              </ul>
              <p className="mt-4 text-zinc-400">{isEnglish 
                ? "We aim to respond to all inquiries within 48 business hours."
                : "Nous nous efforçons de répondre à toutes les demandes dans les 48 heures ouvrables."}</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-zinc-500 text-sm">
            {isEnglish 
              ? "By using 2good2breal services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions."
              : "En utilisant les services de 2good2breal, vous reconnaissez avoir lu, compris et accepté d'être lié par ces Conditions Générales."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
