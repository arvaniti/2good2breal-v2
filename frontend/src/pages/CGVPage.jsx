import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { Button } from '../components/ui/button';
import { Shield, ArrowLeft, CreditCard, FileText, Scale, Mail } from 'lucide-react';

const CGVSection = ({ title, content, icon: Icon }) => (
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
      {Icon && <Icon className="w-5 h-5 text-purple-400" />}
      {title}
    </h2>
    <div className="text-zinc-300 leading-relaxed whitespace-pre-line">
      {content}
    </div>
  </div>
);

export function CGVPage() {
  const { language, t } = useLanguage();
  const isFr = language === 'fr';

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="text-zinc-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isFr ? "Retour à l'accueil" : "Back to Home"}
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {isFr ? "Conditions Générales de Vente" : "General Terms of Sale"}
          </h1>
          <p className="text-zinc-500">
            {isFr ? "Dernière mise à jour : 15 février 2026" : "Last updated: February 15, 2026"}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-950/40 border border-amber-600/50">
            <span className="text-amber-400 text-sm font-medium">
              {isFr 
                ? "Important : Ces Conditions Générales de Vente régissent exclusivement les services payants (Basic, Comprehensive, Premium) du service 2good2breal."
                : "Important: These General Terms of Sale exclusively govern the paid services (Basic, Comprehensive, Premium) of the 2good2breal service."}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Seller Section with clickable links */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400" />
              {isFr ? "1. Vendeur" : "1. Seller"}
            </h2>
            <div className="text-zinc-300 leading-relaxed">
              <p className="mb-4">{isFr ? "Les services 2good2breal sont commercialisés par :" : "The 2good2breal services are marketed by:"}</p>
              <ul className="space-y-2 ml-4">
                <li>• {isFr ? "Nom" : "Name"}: Jamie Madison {isFr ? "et" : "and"} Fréderic Lawrence</li>
                <li>• {isFr ? "Statut" : "Status"}: SAS - Société par Actions Simplifiée</li>
                <li>• SIRET: [{isFr ? "À compléter" : "To be completed"}]</li>
                <li>• Contact: {isFr ? "Référez-vous au formulaire de contact" : "Refer to Contact form"}</li>
                <li>• WhatsApp : <a href="tel:+33743660555" className="text-purple-400 hover:text-purple-300 underline">+33 (0) 7 43 66 05 55</a></li>
              </ul>
            </div>
          </div>

          <CGVSection 
            title={isFr ? "2. Description des Offres" : "2. Description of Offers"}
            icon={CreditCard}
            content={isFr
              ? `VÉRIFICATION BASIC - 49€ par profil
• Analyse de profil standard
• Évaluation du score de confiance
• Détection des signaux d'alerte tels que Red Flags
• Rapport détaillé
• Livraison sous 48 heures

VÉRIFICATION COMPREHENSIVE - 99€ par profil
• Investigation approfondie du profil
• Vérification étendue des antécédents
• Vérification croisée sur les réseaux sociaux
• Évaluation du score de confiance
• Rapport complet détaillé et score de confiance
• Livraison prioritaire sous 24 heures

PACK PREMIUM - 189€ (jusqu'à 3 profils)
• Toutes les fonctionnalités Comprehensive incluses
• Score de confiance et rapport détaillé Premium
• Vérification croisée intensive sur tous les réseaux
• Surveillance continue (30 jours)
• Consultation directe avec nos experts
• Support prioritaire

Les prix sont indiqués en euros, toutes taxes comprises.`
              : `BASIC VERIFICATION - €49 per profile
• Standard profile analysis
• Trust score assessment
• Warning such as Red Flags signal detection
• Detailed report
• Delivery within 48 hours

COMPREHENSIVE VERIFICATION - €99 per profile
• In-depth profile analysis and investigation
• Extended background check
• Cross-verification across social networks
• Trust score assessment
• Comprehensive detailed report and Trust score
• Priority delivery within 24 hours

PREMIUM PACKAGE - €189 (up to 2 profiles)
• All COMPREHENSIVE VERIFICATION features
• Trust score and Premium detailed report
• Intense cross verification across all networks
• Monitoring of your profile for 30 days
• Trust score assessment
• Direct communication with our experts
• Priority support

Prices are indicated in euros, all taxes included.`}
          />

          <CGVSection 
            title={isFr ? "3. Commande et Paiement" : "3. Order and Payment"}
            content={isFr
              ? `3.1 Processus de souscription

Pour souscrire à une offre :
    • Connectez-vous à votre compte 2good2breal
    • Accédez à la section "Mon Abonnement"
    • Sélectionnez l'offre souhaitée
    • Procédez au paiement via notre prestataire sécurisé Stripe
    • Confirmez votre commande et acceptez ces Conditions Générales de Vente

3.2 Moyens de paiement

Les paiements sont traités par Stripe, un prestataire de paiement sécurisé certifié PCI-DSS. Moyens acceptés :
    • Cartes de crédit/débit (Visa, Mastercard, American Express)
    • Apple Pay, Google Pay

Vos informations bancaires ne sont jamais stockées sur nos serveurs.

3.3 Confirmation de commande

Après paiement, vous recevrez un email de confirmation contenant :
    • Un récapitulatif de votre abonnement
    • Un lien vers votre facture
    • Les paramètres de votre compte 2good2breal
    • Le portail de gestion Stripe (lien dans votre espace client)`
              : `3.1 Subscription Process

To subscribe to a plan:
    • Log in to your 2good2breal account
    • Go to the "My Subscription" section
    • Select your desired offer
    • Proceed to payment through our secure provider Stripe
    • Confirm your order and accept the General Terms of Sale

3.2 Payment Methods

Payments are processed by Stripe, a PCI-DSS certified secure payment provider. Accepted methods:
    • Credit/Debit cards (Visa, Mastercard, American Express)
    • Apple Pay, Google Pay

Your banking information is never stored on our servers.

3.3 Order Confirmation

After payment, you will receive a confirmation email containing:
    • A summary of your subscription
    • A link to your invoice
    • Your 2good2breal account settings
    • The Stripe management portal (link in your account area)`}
          />

          {/* Important Section - Right of Withdrawal */}
          <div className="bg-red-950/30 border-2 border-red-800/50 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-3">
              <Scale className="w-5 h-5" />
              {isFr ? "4. Droit de Rétractation - Renonciation Expresse" : "4. Right of Withdrawal - Express Waiver"}
            </h2>
            <div className="bg-red-950/40 border border-red-700/50 rounded-xl p-4 mb-4">
              <p className="text-red-300 font-semibold text-center">
                {isFr ? "VEUILLEZ LIRE ATTENTIVEMENT" : "PLEASE READ CAREFULLY"}
              </p>
            </div>
            <div className="text-zinc-300 leading-relaxed space-y-4">
              <p className="font-medium text-white">
                {isFr 
                  ? "En souscrivant à une offre 2good2breal, vous reconnaissez et acceptez que :"
                  : "By subscribing to a 2good2breal plan, you acknowledge and agree that:"}
              </p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{isFr ? "Le service 2good2breal constitue un contenu numérique non fourni sur un support matériel ;" : "The 2good2breal service constitutes digital content not provided on a tangible medium;"}</li>
                <li>{isFr ? "L'exécution du service commence immédiatement après la validation de votre paiement, vous donnant un accès instantané au forfait sélectionné ;" : "The performance of the service begins immediately after your payment is validated, giving you instant access to your selected package;"}</li>
              </ul>

              <div className="bg-red-900/30 border border-red-700/40 rounded-lg p-4 mt-4">
                <p className="text-red-300 font-medium">
                  {isFr 
                    ? "Par conséquent, aucune demande de remboursement ne peut être acceptée une fois le paiement validé et l'accès aux fonctionnalités premium activé."
                    : "Consequently, no refund request can be accepted once payment has been validated and access to premium features has been activated."}
                </p>
              </div>

              <div className="bg-amber-900/30 border border-amber-700/40 rounded-lg p-4 mt-4">
                <p className="text-amber-300">
                  {isFr 
                    ? "Un remboursement peut également être accordé, uniquement et exceptionnellement, si 2good2breal reconnaît et détermine avant le commencement, être dans l'incapacité de fournir au client un rapport complet en raison de données insuffisantes. Les données peuvent dépendre du manque de contenu, de quantité et d'informations soumises par le client pour l'analyse du profil sélectionné."
                    : "A refund may be provided, solely and exceptionally if 2good2breal acknowledge and determine prior to commencement, to be unable to provide the client a completed report due to insufficient data. The data may be dependent on the lack of content, quantity and information submitted by the client for the selected Profile Analysis report."}
                </p>
                <Link to="/refund-request" className="inline-block mt-3">
                  <Button variant="outline" className="border-amber-600 text-amber-300 hover:bg-amber-900/50">
                    {isFr ? 'Formulaire de Demande de Remboursement' : 'Refund Request Form'}
                  </Button>
                </Link>
              </div>

              <div className="bg-purple-900/30 border border-purple-700/40 rounded-lg p-4 mt-4">
                <p className="text-purple-300 font-medium">
                  {isFr 
                    ? "Toutes les demandes de remboursement doivent être reçues dans les 7 jours suivant l'achat du forfait."
                    : "All Refund Requests need to be received within 7 days of the purchased package."}
                </p>
              </div>
            </div>
          </div>

          <CGVSection 
            title={isFr ? "5. Justification" : "5. Justification"}
            content={isFr
              ? `Cette disposition est justifiée par la nature du service :
    • 2good2breal est un service de vérification de vos profils choisis sur toutes les plateformes, sites web et bases de données sécurisées autrement inaccessibles, dont la valeur est consommée instantanément
    • L'accès aux profils, signaux et messagerie est immédiat
    • Le service fourni est par nature non remboursable

5.1 Exceptions

Un remboursement peut exceptionnellement être accordé en cas de :
    • Double facturation avérée (erreur technique)
    • Si 2good2breal n'a pas reçu suffisamment de données de 'Profil' de la part du client pour fournir un rapport adéquat et complet.
    • Fermeture définitive du service par 2good2breal

Toute demande doit être soumise via le formulaire de contact avec pièces justificatives.`
              : `This provision is justified by the nature of the service:
    • 2good2breal is a verification service for your chosen profiles across all platforms, websites, and otherwise inaccessible secure databases, the value of which is consumed instantly
    • Access to profiles, signals, and messaging is immediate
    • The service provided is by nature non-refundable

5.1 Exceptions

A refund may exceptionally be granted in case of:
    • Proven double billing (technical error)
    • If 2good2breal has not been provided with sufficient 'Profile' data by the client in order to provide an adequate, complete report.
    • Permanent closure of the service by 2good2breal

Any request must be submitted via the contact form with supporting documents.`}
          />

          <CGVSection 
            title={isFr ? "6. Facturation" : "6. Invoicing"}
            content={isFr
              ? `Une facture est automatiquement générée pour chaque paiement et accessible depuis :
    • Votre email de confirmation
    • Le portail de gestion Stripe

Les factures incluent : la date, le montant et le forfait sélectionné.`
              : `An invoice is automatically generated for each payment and accessible from:
    • Your confirmation email
    • The Stripe management portal

Invoice includes: the date, amount and package selected.`}
          />

          <CGVSection 
            title={isFr ? "7. Modification des Prix" : "7. Price Modifications"}
            content={isFr
              ? `2good2breal se réserve le droit de modifier ses prix. Toute modification sera communiquée par email au moins 30 jours avant la prochaine date de facturation. Si vous n'acceptez pas le nouveau prix, vous pouvez résilier avant la date d'effet.`
              : `2good2breal reserves the right to modify its prices. Any modification will be communicated by email at least 30 days before the next billing date. If you do not accept the new price, you may cancel before the effective date.`}
          />

          <CGVSection 
            title={isFr ? "8. Service Client" : "8. Customer Service"}
            icon={Mail}
            content={isFr
              ? `Pour toute question concernant votre abonnement :
    • Veuillez vous référer au formulaire de contact ou aux numéros de téléphone directs et aux heures de bureau.`
              : `For any questions regarding your subscription:
    • Please refer to the Contact form or direct phone numbers and office hours.`}
          />

          <CGVSection 
            title={isFr ? "9. Litiges et Médiation" : "9. Disputes and Mediation"}
            icon={Scale}
            content={isFr
              ? `En cas de litige, une solution amiable sera privilégiée.

Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, vous pouvez recourir gratuitement au service de médiation de la consommation. Le médiateur "droit de la consommation" proposé est MEDICYS.

Site web : www.medicys.fr

Vous pouvez également utiliser la plateforme de Règlement en Ligne des Litiges (RLL) de la Commission européenne : https://ec.europa.eu/consumers/odr`
              : `In the case of dispute, an amicable solution will be sought.

In accordance with Articles L.616-1 and R.616-1 of the French Consumer Code, you may use the consumer mediation service free of charge. The proposed "consumer law" mediator is MEDICYS.

Website: www.medicys.fr

You may also use the European Commission's Online Dispute Resolution (ODR) platform: https://ec.europa.eu/consumers/odr`}
          />

          <CGVSection 
            title={isFr ? "10. Droit Applicable" : "10. Applicable Law"}
            content={isFr
              ? `Ces Conditions Générales de Vente sont régies par le droit français. En cas de litige, les tribunaux français seront compétents.`
              : `These General Terms of Sale are governed by French law. In case of dispute, French courts shall have jurisdiction.`}
          />

          <CGVSection 
            title={isFr ? "11. Acceptation des Conditions" : "11. Acceptance of Terms"}
            content={isFr
              ? `La validation du paiement implique l'acceptation pleine et entière de ces Conditions Générales de Vente, ainsi que des Conditions Générales d'Utilisation et de la Politique de Confidentialité.`
              : `Validation of payment implies full and complete acceptance of these General Terms of Sale, as well as the Terms and Conditions and the Privacy Policy.`}
          />
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-zinc-500 text-sm">
            {isFr 
              ? "En utilisant les services payants de 2good2breal, vous reconnaissez avoir lu, compris et accepté ces Conditions Générales de Vente."
              : "By using the paid services of 2good2breal, you acknowledge having read, understood, and accepted these General Terms of Sale."}
          </p>
          <div className="mt-4">
            <Link to="/terms" className="text-purple-400 hover:text-purple-300 text-sm">
              {isFr ? "Voir aussi : Conditions Générales d'Utilisation →" : "See also: Terms and Conditions →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
