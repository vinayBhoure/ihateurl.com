import type { Metadata } from "next";
import type { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { AppearanceSelect } from "@/components/appearance-select";
import { CategorySettings } from "@/components/category-settings";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile-form";
import { SocialLinksForm } from "@/components/social-links-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { requirePageUser } from "@/server/auth/current-user";
import { listCategories } from "@/server/queries/categories";
import { listMySocialLinks } from "@/server/queries/social";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requirePageUser();
  const [categories, socialLinks, clerkUser] = await Promise.all([
    listCategories(user.id),
    listMySocialLinks(user.id),
    currentUser(),
  ]);
  const avatarUrl = clerkUser?.imageUrl ?? user.avatarUrl;
  const initial = (user.displayName || user.username).charAt(0).toUpperCase();

  return (
    <div className="space-y-10">
      <PageHeader title="Settings" />

      <Section id="profile" title="Profile">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <p className="text-sm text-muted-foreground">Your avatar comes from your sign-in account.</p>
        </div>
        <ProfileForm user={{ username: user.username, displayName: user.displayName, bio: user.bio }} />
      </Section>

      <Section id="social-links" title="Social links">
        <SocialLinksForm links={socialLinks} />
      </Section>

      <Section id="categories" title="Categories">
        <CategorySettings
          system={categories.filter((c) => c.userId === null).map(({ id, name }) => ({ id, name }))}
          own={categories.filter((c) => c.userId !== null).map(({ id, name }) => ({ id, name }))}
        />
      </Section>

      <Section id="appearance" title="Appearance">
        <AppearanceSelect />
      </Section>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-4">
      <h2 id={`${id}-heading`} className="text-xl font-semibold">
        {title}
      </h2>
      <div className="space-y-6 rounded-lg border p-4 md:p-6">{children}</div>
    </section>
  );
}
