import type { Metadata } from "next";
import Link from "next/link";
import { ContactLink, LegalDocument, type LegalSection } from "@/components/legal-document";

const DESCRIPTION = "What ihateurl collects, what becomes public, who processes your data and how to delete it.";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: { type: "website", url: "/privacy", title: "Privacy Notice", description: DESCRIPTION, images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Privacy Notice", description: DESCRIPTION },
};

// Keep every statement in line with the product (plan 4 R2); update when behaviour changes.
const SECTIONS: LegalSection[] = [
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <p>
          <strong>From your sign-in account.</strong> You sign in with Google or GitHub through Clerk, our sign-in
          provider. Clerk receives your name, email address and profile photo from that account and keeps them to run
          your login. We store your Clerk account ID and a link to your profile photo.
        </p>
        <p>
          <strong>What you give us.</strong> Your username, display name and bio; the links you save; the collections
          you create, with their titles, descriptions, categories, order and visibility; and any edits you make to link
          titles and descriptions.
        </p>
        <p>
          <strong>What we fetch.</strong> When you save a link, we read the page&rsquo;s title and description and the
          addresses of its site icon and preview image, and store them with the link.
        </p>
        <p>
          <strong>Technical data.</strong> Our hosting and sign-in providers process your IP address and browser and
          device details to serve pages, keep you signed in and block abuse. Clerk shows your active sessions, with
          device and approximate location, under Manage account.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: (
      <p>
        Clerk sets the cookies that keep you signed in. We keep your theme choice (light, dark or system) in your
        browser&rsquo;s local storage. We do not use analytics, advertising or tracking cookies.
      </p>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: (
      <ul>
        <li>To run ihateurl: save, organize and show your links, and publish the collections you make public.</li>
        <li>To fetch link details for the links you save.</li>
        <li>To keep the service safe: rate limits, abuse prevention and fixing faults.</li>
        <li>To reply when you contact us.</li>
      </ul>
    ),
  },
  {
    id: "what-is-public",
    title: "What is public",
    body: (
      <>
        <p>
          Collections are private when you create them. Only you can see a private collection; anyone else who opens
          its address sees &ldquo;Page not found&rdquo;.
        </p>
        <p>
          Your profile page at <span className="font-mono">ihateurl.com/your-username</span> is public. It shows your
          username, display name, profile photo, bio and public collections.
        </p>
        <p>When you make a collection public:</p>
        <ul>
          <li>anyone with the link can see its title, description, categories and links;</li>
          <li>it is listed on your profile and in Explore, and included in our sitemap for search engines;</li>
          <li>
            other signed-in users can save a copy to their own account. The copy is theirs: it does not change or
            disappear when you edit, hide or delete yours.
          </li>
        </ul>
        <p>
          Making a collection private again removes it from our public pages at once. Search engines may show an old
          copy until they next visit.
        </p>
      </>
    ),
  },
  {
    id: "third-party-sites",
    title: "Links and third-party sites",
    body: (
      <>
        <p>
          When you save a link, our server visits that page once to read its details. It identifies itself as
          &ldquo;ihateurl-bot&rdquo;.
        </p>
        <p>
          Site icons load straight from the sites they belong to, so those sites can see the IP address of whoever
          views the page. We do not send them the address of the ihateurl page.
        </p>
        <p>Sites you open from ihateurl have their own privacy practices.</p>
      </>
    ),
  },
  {
    id: "service-providers",
    title: "Who processes your data",
    body: (
      <>
        <p>We use these providers to run ihateurl. They process data for us:</p>
        <ul>
          <li>Clerk: sign-in and account management.</li>
          <li>Vercel: hosting.</li>
          <li>Neon: the database that stores your profile, links and collections.</li>
        </ul>
        <p>
          They may store and process data outside India, including in the United States. Google and GitHub handle your
          accounts with them under their own policies. We do not sell your personal information or share it for
          advertising.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep data",
    body: (
      <>
        <p>
          We keep your profile and content while your account exists. When you delete a link or collection, it is
          removed from our database at once; our database provider&rsquo;s backups may hold it for a short time after
          that.
        </p>
        <p>
          When you ask us to delete your account, we delete your profile, links, collections and categories and your
          Clerk sign-in account within 30 days. Copies of your public collections that other users saved stay in their
          accounts.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your choices and rights",
    body: (
      <>
        <ul>
          <li>Edit your profile, links and collections at any time in the app.</li>
          <li>Make any collection private, or delete it.</li>
          <li>
            Ask for a copy of your data, a correction, or deletion of your account by emailing <ContactLink /> from
            the email address on your account.
          </li>
        </ul>
        <p>
          Under India&rsquo;s Digital Personal Data Protection Act, 2023, you can ask to access, correct or erase your
          personal data, nominate someone to act for you, and raise a complaint with us. If we do not resolve it, you
          can approach the Data Protection Board of India. Depending on where you live, you may have other rights; write
          to us and we will help.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Age",
    body: (
      <p>
        You must be at least 13 years old to use ihateurl. If you are under 18, you may use it only with the consent of
        a parent or guardian. If you believe a child has used ihateurl without that consent, email <ContactLink /> and
        we will delete the account.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        ihateurl is served over HTTPS, and every private page and change checks that you own the data. No system is
        perfectly secure; if you find a security problem, please email <ContactLink />.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this notice",
    body: (
      <p>
        We will post any update on this page and change the date above. If a change is significant, we will make
        reasonable efforts to tell you before it takes effect.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions, requests or complaints about privacy: <ContactLink />.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Notice"
      updated="September 25, 2026"
      updatedIso="2026-09-25"
      intro={
        <p>
          ihateurl (<span className="font-mono">ihateurl.com</span>) is run by Vinay Bhoure, an individual based in
          India (&ldquo;we&rdquo;, &ldquo;us&rdquo;). This notice explains what we collect, what becomes public and the
          choices you have. It works together with our{" "}
          <Link href="/terms" className="font-medium underline underline-offset-4">
            Terms of Service
          </Link>
          .
        </p>
      }
      sections={SECTIONS}
    />
  );
}
