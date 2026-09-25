import type { Metadata } from "next";
import Link from "next/link";
import { ContactLink, LegalDocument, type LegalSection } from "@/components/legal-document";

const DESCRIPTION = "The rules for using ihateurl: your account, your content, public collections and acceptable use.";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: { type: "website", url: "/terms", title: "Terms of Service", description: DESCRIPTION, images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Terms of Service", description: DESCRIPTION },
};

const privacyLink = (
  <Link href="/privacy" className="font-medium underline underline-offset-4">
    Privacy Notice
  </Link>
);

// Price wording follows plan 3 LD2: "free right now", never "free forever" or "no ads".
const SECTIONS: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement",
    body: (
      <p>
        By using ihateurl you agree to these terms and to our {privacyLink}. If you do not agree, do not use
        ihateurl.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "Who can use ihateurl",
    body: (
      <p>
        You must be at least 13 years old. If you are under 18, you may use ihateurl only with the consent of a parent
        or guardian, who accepts these terms for you. You must not use ihateurl where the law forbids it.
      </p>
    ),
  },
  {
    id: "account",
    title: "Your account",
    body: (
      <>
        <p>
          You sign in with Google or GitHub. Keep that account secure; you are responsible for what happens under your
          ihateurl account.
        </p>
        <p>
          Your username is your public address. We may change or take back a username that impersonates someone,
          infringes someone&rsquo;s rights or breaks these terms.
        </p>
      </>
    ),
  },
  {
    id: "your-content",
    title: "Your content",
    body: (
      <>
        <p>
          You keep ownership of what you add: your profile, collections, descriptions and the links you save. The pages
          behind those links belong to their owners.
        </p>
        <p>
          You give us a worldwide, non-exclusive, royalty-free permission to store, copy, process and display your
          content as needed to run ihateurl. For public collections this includes showing them to anyone, listing them
          on your profile and in Explore, making them available to search engines, and letting other users save copies.
          The permission ends when you delete the content, except for copies other users already saved and backups we
          keep for a short time.
        </p>
        <p>You are responsible for your content and must have the right to share what you make public.</p>
      </>
    ),
  },
  {
    id: "public-collections",
    title: "Public collections and copies",
    body: (
      <p>
        Collections are private until you make them public. When you make one public, other signed-in users can save a
        copy to their own account. A copy belongs to the user who saved it and does not change when you edit, hide or
        delete your original.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>Do not use ihateurl to:</p>
        <ul>
          <li>share or link to illegal content, malware, phishing or scams;</li>
          <li>share or link to sexual content involving minors, or content that promotes violence or hatred;</li>
          <li>harass, threaten or impersonate anyone;</li>
          <li>infringe copyright, trademarks or other rights;</li>
          <li>send spam or create accounts or content by automated means;</li>
          <li>
            scrape or overload the service, get around rate limits or security, or access accounts or data that are not
            yours.
          </li>
        </ul>
        <p>
          If you find a security problem, report it to <ContactLink /> instead of testing it against other users.
        </p>
      </>
    ),
  },
  {
    id: "enforcement",
    title: "Removing content and suspending accounts",
    body: (
      <p>
        We may remove content, make a collection private, or suspend or close an account that breaks these terms or the
        law, or to protect users or the service. Where reasonable, we will tell you why.
      </p>
    ),
  },
  {
    id: "price",
    title: "Price",
    body: (
      <p>
        ihateurl is free right now. We may add paid plans or advertising later. We will tell you before anything you
        use starts to cost money, and we will never charge you without your agreement.
      </p>
    ),
  },
  {
    id: "changes-to-service",
    title: "Changes to the service",
    body: (
      <p>
        We may add, change or remove features, or pause the service. If we decide to shut ihateurl down, we will give
        reasonable notice where we can so you can copy your links.
      </p>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services and links",
    body: (
      <p>
        Sign-in runs through Clerk with your Google or GitHub account, under their terms. Links saved on ihateurl lead
        to sites we do not control, and we are not responsible for their content or practices.
      </p>
    ),
  },
  {
    id: "our-rights",
    title: "Our name and code",
    body: (
      <p>
        The ihateurl name, logo, design and code belong to us. These terms do not give you any right to use them beyond
        using the service. To report content that infringes your rights, email <ContactLink /> with the page address and
        details; we will review it and remove content that infringes.
      </p>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    body: (
      <p>
        ihateurl is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. To the extent the law allows, we make
        no promises that it will be uninterrupted or error-free, that fetched link details are accurate, or that saved
        links will keep working.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <p>
        To the extent the law allows, we are not liable for indirect, incidental or consequential loss, or for loss of
        data, profits or goodwill. Our total liability for any claim about ihateurl is limited to the amount you paid us
        in the 12 months before the claim, or ₹1,000 if you paid nothing. Nothing in these terms limits liability that
        cannot be limited by law.
      </p>
    ),
  },
  {
    id: "indemnity",
    title: "Your responsibility for claims",
    body: (
      <p>
        If someone makes a claim against us because of your content or your breach of these terms, you agree to cover
        the reasonable costs of that claim, to the extent the law allows.
      </p>
    ),
  },
  {
    id: "ending",
    title: "Ending your use",
    body: (
      <p>
        You can stop using ihateurl at any time. To delete your account and its data, email <ContactLink /> from the
        email address on your account. Sections that by their nature should continue, such as ownership, disclaimers,
        limits of liability and governing law, stay in effect after your account ends.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law and disputes",
    body: (
      <p>
        These terms are governed by the laws of India. If you have a dispute with us, please contact us first so we can
        try to resolve it within 30 days. If we cannot, the courts of India have exclusive jurisdiction.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We will post any update on this page and change the date above. If a change is significant, we will make
        reasonable efforts to tell you before it takes effect. Using ihateurl after a change means you accept the new
        terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about these terms: <ContactLink />.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      updated="September 25, 2026"
      updatedIso="2026-09-25"
      intro={
        <p>
          These terms cover your use of ihateurl (<span className="font-mono">ihateurl.com</span>), run by Vinay
          Bhoure, an individual based in India (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
        </p>
      }
      sections={SECTIONS}
    />
  );
}
