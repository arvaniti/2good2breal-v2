import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { Button } from '../components/ui/button';
import { Shield, ArrowLeft, Cookie, Lock, Clock, Settings, ExternalLink } from 'lucide-react';

const CookieSection = ({ title, content, icon: Icon }) => (
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
      {Icon && <Icon className="w-5 h-5 text-purple-400" />}
      {title}
    </h2>
    <div className="text-zinc-300 leading-relaxed">
      {content}
    </div>
  </div>
);

export function CookiesPage() {
  const { language } = useLanguage();
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
              <Cookie className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {isFr ? "Politique de Cookies et Traceurs" : "Cookie and Tracker Policy"}
          </h1>
          <p className="text-zinc-500">
            {isFr ? "Dernière mise à jour : 15 février 2026" : "Last updated: February 15, 2026"}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <CookieSection 
            title={isFr ? "1. Qu'est-ce qu'un cookie ?" : "1. What is a cookie?"}
            icon={Cookie}
            content={
              <div className="space-y-4">
                <p>
                  {isFr 
                    ? "Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette) lors de la visite d'un site web. Il permet au site de mémoriser des informations sur votre visite, comme votre langue préférée ou d'autres paramètres."
                    : "A cookie is a small text file stored on your device (computer, smartphone, tablet) when visiting a website. It allows the site to remember information about your visit, such as your preferred language or other settings."}
                </p>
                <p>
                  {isFr
                    ? "Le terme « cookie » englobe également d'autres technologies de stockage telles que le localStorage et le sessionStorage du navigateur."
                    : "The term \"cookie\" also encompasses other storage technologies such as the browser's localStorage and sessionStorage."}
                </p>
              </div>
            }
          />

          <CookieSection 
            title={isFr ? "2. Cookies utilisés par 2good2breal" : "2. Cookies used by 2good2breal"}
            content={
              <div className="space-y-6">
                <p>
                  {isFr
                    ? "2good2breal utilise principalement le localStorage de votre navigateur (plutôt que des cookies HTTP traditionnels) pour stocker certaines informations nécessaires au fonctionnement du service."
                    : "2good2breal primarily uses your browser's localStorage (rather than traditional HTTP cookies) to store certain information necessary for the service to function."}
                </p>
                
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-3">
                    {isFr ? "2.1 Stockage strictement nécessaire (exempt de consentement)" : "2.1 Strictly necessary storage (exempt from consent)"}
                  </h4>
                  <p className="text-zinc-400 mb-4">
                    {isFr
                      ? "Ces données sont essentielles au fonctionnement du site et ne peuvent pas être désactivées :"
                      : "This data is essential for the website to function and cannot be disabled:"}
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-700">
                          <th className="text-left py-2 text-zinc-300">{isFr ? "Donnée" : "Data"}</th>
                          <th className="text-left py-2 text-zinc-300">{isFr ? "Finalité" : "Purpose"}</th>
                          <th className="text-left py-2 text-zinc-300">{isFr ? "Durée" : "Duration"}</th>
                        </tr>
                      </thead>
                      <tbody className="text-zinc-400">
                        <tr className="border-b border-zinc-800">
                          <td className="py-2">{isFr ? "Jeton d'authentification" : "Authentication token"}</td>
                          <td className="py-2">{isFr ? "Maintenir votre session de connexion" : "Maintain your login session"}</td>
                          <td className="py-2">{isFr ? "24 heures" : "24 hours"}</td>
                        </tr>
                        <tr className="border-b border-zinc-800">
                          <td className="py-2">{isFr ? "Préférence de langue" : "Language preference"}</td>
                          <td className="py-2">{isFr ? "Afficher le site dans votre langue" : "Display the site in your language"}</td>
                          <td className="py-2">{isFr ? "Persistant" : "Persistent"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <p className="text-zinc-500 text-sm mt-4 italic">
                    {isFr
                      ? "Base légale : Ces traceurs sont exemptés de recueil de consentement conformément aux directives de la CNIL, car ils sont strictement nécessaires au fonctionnement du service demandé par l'utilisateur."
                      : "Legal basis: These trackers are exempt from consent collection in accordance with CNIL guidelines, as they are strictly necessary for the operation of the service requested by the user."}
                  </p>
                </div>

                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-3">
                    {isFr ? "2.2 Services tiers" : "2.2 Third-party services"}
                  </h4>
                  <p className="text-zinc-400 mb-4">
                    {isFr
                      ? "Certains services tiers peuvent déposer leurs propres cookies :"
                      : "Certain third-party services may place their own cookies:"}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-zinc-900/50 rounded-lg p-4">
                      <h5 className="font-medium text-purple-400 mb-2">Stripe ({isFr ? "paiement" : "payment"})</h5>
                      <p className="text-zinc-400 text-sm mb-2">
                        {isFr
                          ? "Lors d'un paiement, vous êtes redirigé vers Stripe qui peut utiliser des cookies pour :"
                          : "When making a payment, you are redirected to Stripe which may use cookies to:"}
                      </p>
                      <ul className="list-disc list-inside text-zinc-400 text-sm space-y-1 ml-2">
                        <li>{isFr ? "Sécuriser la transaction" : "Secure the transaction"}</li>
                        <li>{isFr ? "Détecter les fraudes" : "Detect fraud"}</li>
                        <li>{isFr ? "Améliorer leurs services" : "Improve their services"}</li>
                      </ul>
                      <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-flex items-center gap-1">
                        {isFr ? "Voir la politique de confidentialité de Stripe" : "View Stripe's Privacy Policy"} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    
                    <div className="bg-zinc-900/50 rounded-lg p-4">
                      <h5 className="font-medium text-purple-400 mb-2">Lopaga ({isFr ? "authentification" : "authentication"})</h5>
                      <p className="text-zinc-400 text-sm mb-2">
                        {isFr
                          ? "Le service d'authentification Lopaga peut utiliser des cookies de session pour :"
                          : "The Lopaga authentication service may use session cookies to:"}
                      </p>
                      <ul className="list-disc list-inside text-zinc-400 text-sm space-y-1 ml-2">
                        <li>{isFr ? "Gérer votre connexion" : "Manage your login"}</li>
                        <li>{isFr ? "Sécuriser l'authentification" : "Secure authentication"}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            }
          />

          {/* Section highlighting what we DON'T use */}
          <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-3">
              <Lock className="w-5 h-5" />
              {isFr ? "3. Cookies que nous n'utilisons PAS" : "3. Cookies we do NOT use"}
            </h2>
            <p className="text-zinc-300 mb-4">
              {isFr
                ? "2good2breal s'engage à respecter votre vie privée. Nous n'utilisons pas :"
                : "2good2breal is committed to respecting your privacy. We do not use:"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-emerald-950/40 rounded-lg p-3">
                <span className="text-emerald-400">✗</span>
                <span className="text-zinc-300 text-sm">
                  {isFr ? "Cookies publicitaires - Pas de pub, pas de ciblage" : "Advertising cookies - No ads, no targeting"}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-950/40 rounded-lg p-3">
                <span className="text-emerald-400">✗</span>
                <span className="text-zinc-300 text-sm">
                  {isFr ? "Cookies de réseaux sociaux - Pas de boutons de partage" : "Social media cookies - No share buttons"}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-950/40 rounded-lg p-3">
                <span className="text-emerald-400">✗</span>
                <span className="text-zinc-300 text-sm">
                  {isFr ? "Cookies d'analyse tiers - Pas de Google Analytics" : "Third-party analytics cookies - No Google Analytics"}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-950/40 rounded-lg p-3">
                <span className="text-emerald-400">✗</span>
                <span className="text-zinc-300 text-sm">
                  {isFr ? "Cookies de profilage - Pas de suivi sur d'autres sites" : "Profiling cookies - No tracking on other sites"}
                </span>
              </div>
            </div>
          </div>

          <CookieSection 
            title={isFr ? "4. Gérer vos préférences" : "4. Managing your preferences"}
            icon={Settings}
            content={
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">
                    {isFr ? "4.1 Paramètres du navigateur" : "4.1 Browser settings"}
                  </h4>
                  <p className="text-zinc-400 mb-3">
                    {isFr ? "Vous pouvez configurer votre navigateur pour :" : "You can configure your browser to:"}
                  </p>
                  <ul className="list-disc list-inside text-zinc-400 space-y-1 ml-2">
                    <li>{isFr ? "Accepter ou rejeter tous les cookies" : "Accept or reject all cookies"}</li>
                    <li>{isFr ? "Être averti lorsqu'un cookie est déposé" : "Be notified when a cookie is placed"}</li>
                    <li>{isFr ? "Supprimer les cookies existants" : "Delete existing cookies"}</li>
                  </ul>
                  
                  <div className="bg-amber-950/30 border border-amber-700/50 rounded-lg p-3 mt-4">
                    <p className="text-amber-300 text-sm">
                      {isFr
                        ? "⚠️ Attention : Désactiver le localStorage empêchera 2good2breal de fonctionner normalement (vous devrez vous reconnecter à chaque visite)."
                        : "⚠️ Warning: Disabling localStorage will prevent 2good2breal from functioning normally (you will need to log in again on each visit)."}
                    </p>
                  </div>
                  
                  <p className="text-zinc-400 mt-4 mb-2">
                    {isFr ? "Liens vers les paramètres des principaux navigateurs :" : "Links to settings for major browsers:"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-sm bg-zinc-800 px-3 py-1 rounded-lg">Google Chrome</a>
                    <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-sm bg-zinc-800 px-3 py-1 rounded-lg">Mozilla Firefox</a>
                    <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-sm bg-zinc-800 px-3 py-1 rounded-lg">Safari</a>
                    <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-sm bg-zinc-800 px-3 py-1 rounded-lg">Microsoft Edge</a>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-3">
                    {isFr ? "4.2 Supprimer les données stockées" : "4.2 Delete stored data"}
                  </h4>
                  <p className="text-zinc-400 mb-3">
                    {isFr
                      ? "Pour supprimer les données stockées par 2good2breal dans votre navigateur :"
                      : "To delete data stored by 2good2breal in your browser:"}
                  </p>
                  <ol className="list-decimal list-inside text-zinc-400 space-y-1 ml-2">
                    <li>{isFr ? "Ouvrez les outils de développement (F12)" : "Open developer tools (F12)"}</li>
                    <li>{isFr ? "Allez dans l'onglet « Application » ou « Stockage »" : "Go to the \"Application\" or \"Storage\" tab"}</li>
                    <li>{isFr ? "Sélectionnez « Local Storage »" : "Select \"Local Storage\""}</li>
                    <li>{isFr ? "Supprimez les entrées liées à 2good2breal" : "Delete entries related to 2good2breal"}</li>
                  </ol>
                  <p className="text-zinc-500 text-sm mt-3">
                    {isFr
                      ? "Ou utilisez l'option « Effacer les données de navigation » de votre navigateur."
                      : "Or use your browser's \"Clear browsing data\" option."}
                  </p>
                </div>
              </div>
            }
          />

          <CookieSection 
            title={isFr ? "5. Durée de conservation" : "5. Retention period"}
            icon={Clock}
            content={
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-700">
                      <th className="text-left py-3 text-zinc-300 font-semibold">
                        {isFr ? "Type de traceur" : "Tracker type"}
                      </th>
                      <th className="text-left py-3 text-zinc-300 font-semibold">
                        {isFr ? "Durée maximale" : "Maximum duration"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-400">
                    <tr className="border-b border-zinc-800">
                      <td className="py-3">{isFr ? "Jeton d'authentification" : "Authentication token"}</td>
                      <td className="py-3">{isFr ? "24 heures (renouvelé automatiquement)" : "24 hours (automatically renewed)"}</td>
                    </tr>
                    <tr className="border-b border-zinc-800">
                      <td className="py-3">{isFr ? "Préférence de langue" : "Language preference"}</td>
                      <td className="py-3">{isFr ? "Persistant (jusqu'à suppression manuelle)" : "Persistent (until manual deletion)"}</td>
                    </tr>
                    <tr className="border-b border-zinc-800">
                      <td className="py-3">{isFr ? "Consentement aux cookies" : "Cookie consent"}</td>
                      <td className="py-3">{isFr ? "6 mois" : "6 months"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            }
          />

          <CookieSection 
            title={isFr ? "6. Vos droits" : "6. Your rights"}
            content={
              <div className="space-y-4">
                <p>
                  {isFr
                    ? "Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants concernant vos données :"
                    : "In accordance with GDPR and the French Data Protection Act, you have the following rights regarding your data:"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <span className="text-purple-400 font-medium">{isFr ? "Droit d'accès" : "Right of access"}</span>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <span className="text-purple-400 font-medium">{isFr ? "Droit de rectification" : "Right to rectification"}</span>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <span className="text-purple-400 font-medium">{isFr ? "Droit à l'effacement" : "Right to erasure"}</span>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <span className="text-purple-400 font-medium">{isFr ? "Droit d'opposition" : "Right to object"}</span>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <span className="text-purple-400 font-medium">{isFr ? "Droit à la portabilité des données" : "Right to data portability"}</span>
                  </div>
                </div>
                <p className="text-zinc-400">
                  {isFr
                    ? "Pour exercer ces droits : "
                    : "To exercise these rights: "}
                  <span className="text-purple-400">{isFr ? "Référez-vous au formulaire de contact" : "Refer to Contact form"}</span>
                </p>
                <p className="text-zinc-400">
                  {isFr ? "En savoir plus : " : "Learn more: "}
                  <Link to="/terms" className="text-purple-400 hover:text-purple-300">
                    {isFr ? "Référez-vous à la Politique de confidentialité" : "Refer to Privacy Policy"}
                  </Link>
                </p>
              </div>
            }
          />

          <CookieSection 
            title={isFr ? "7. Modifications" : "7. Modifications"}
            content={
              <p>
                {isFr
                  ? "Cette politique peut être mise à jour. La date de dernière modification est indiquée en haut de page. En cas de changements substantiels, vous serez informé via une bannière sur le site."
                  : "This policy may be updated. The last modification date is indicated at the top of the page. In case of substantial changes, you will be informed via a banner on the site."}
              </p>
            }
          />

          <CookieSection 
            title={isFr ? "8. Contact" : "8. Contact"}
            content={
              <div className="space-y-2">
                <p>
                  {isFr
                    ? "Pour toute question concernant cette politique de cookies :"
                    : "For any questions regarding this cookie policy:"}
                </p>
                <ul className="list-disc list-inside text-zinc-400 space-y-1 ml-2">
                  <li>Email: <a href="mailto:contact@2good2breal.com" className="text-purple-400 hover:text-purple-300 underline">contact@2good2breal.com</a></li>
                  <li>WhatsApp : <a href="tel:+33743660555" className="text-purple-400 hover:text-purple-300 underline">+33 (0) 7 43 66 05 55</a></li>
                </ul>
              </div>
            }
          />
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-zinc-500 text-sm">
            {isFr
              ? "En continuant à naviguer sur 2good2breal, vous acceptez l'utilisation des cookies strictement nécessaires au fonctionnement du service."
              : "By continuing to browse 2good2breal, you accept the use of cookies strictly necessary for the service to function."}
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link to="/terms" className="text-purple-400 hover:text-purple-300 text-sm">
              {isFr ? "Conditions Générales d'Utilisation →" : "Terms and Conditions →"}
            </Link>
            <Link to="/cgv" className="text-purple-400 hover:text-purple-300 text-sm">
              {isFr ? "Conditions Générales de Vente →" : "General Terms of Sale →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
