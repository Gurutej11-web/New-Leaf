import Link from "next/link";
import { LeafLogo } from "@/components/newleaf/LeafIcon";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <LeafLogo size={52} />
      <p className="mt-8 text-6xl font-fredoka font-semibold text-leaf-forest">404</p>
      <h1 className="mt-3 text-2xl font-fredoka font-semibold text-foreground">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist. If you need support, we&apos;re still here.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          href="/chat"
          className="bg-leaf-forest text-white font-semibold px-6 py-3 rounded-2xl hover:bg-leaf-sage transition-colors"
        >
          Get help now
        </Link>
        <Link
          href="/"
          className="border border-border text-foreground font-medium px-6 py-3 rounded-2xl hover:bg-leaf-mist transition-colors"
        >
          Back to home
        </Link>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        In immediate danger?{" "}
        <a href="tel:911" className="font-semibold text-leaf-crimson">Call 911</a>
        {" · "}
        <a href="tel:988" className="font-semibold text-leaf-forest">Mental health: 988</a>
      </p>
    </div>
  );
}
