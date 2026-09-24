import { ChevronDown } from "lucide-react";

// Answers are checked against the product (plan 3 §1 facts); keep them in sync when behaviour changes.
const FAQ: { question: string; answer: string }[] = [
  {
    question: "What does “public” mean?",
    answer: "Anyone with the link can open it. It's listed on your profile and in Explore, and search engines can find it.",
  },
  {
    question: "Who can see my private collections?",
    answer: "Only you. Anyone else who opens the URL sees “Page not found”.",
  },
  {
    question: "Can I copy someone else's collection?",
    answer:
      "Yes. “Save to my collections” puts a private copy in your account. Later changes to the original don't carry over.",
  },
  {
    question: "Can a link be in more than one collection?",
    answer: "Yes. Edit its title or description once and the change shows everywhere.",
  },
  {
    question: "What happens if I change my username?",
    answer: "Your public URLs change with it, and the old ones stop working.",
  },
  { question: "Is it free?", answer: "Yes, ihateurl is free right now." },
];

/** Landing FAQ (plan 3 §4.2 #7): native `<details>`, so it works without client JS (LP6). */
export function LandingFaq() {
  return (
    <div className="max-w-3xl divide-y border-y">
      {FAQ.map(({ question, answer }) => (
        <details key={question} className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-3 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden">
            {question}
            {/* No transition: motion is limited to pending spinners (rules/ui.md §9). */}
            <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground group-open:rotate-180" />
          </summary>
          <p className="pb-4 text-muted-foreground">{answer}</p>
        </details>
      ))}
    </div>
  );
}
