import { LogoLoader } from "@/components/logo-loader";

// Public pages without their own skeleton (profile, collection, legal). /explore keeps its skeleton.
export default function Loading() {
  return <LogoLoader />;
}
